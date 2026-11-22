from datetime import timedelta

import pytest
from django.core.management import call_command
from django.utils import timezone

from conftest import Api
from lessons import jobs
from lessons.models import Lesson
from payments.models import PaymentRecord

HOUR = timedelta(hours=1)


@pytest.fixture
def demo(db):
    call_command('seed_demo', verbosity=0)


@pytest.fixture
def olga(demo):
    api = Api()
    api.login_as('olga@mail.ru')
    return api


@pytest.fixture
def anastasia(demo):
    api = Api()
    api.login_as('anastasia@toprepet.ru')
    return api


def free_slot(api, tutor='english', skip=0, lead_hours=6):
    slots = api.get_ok(f'/tutors/{tutor}/slots', {'from': (timezone.now() + timedelta(hours=lead_hours)).isoformat(), 'days': 14})
    free = [s for s in slots if s['available']]
    return free[skip]['start']


def book(api, start, tutor='english', kind='regular', **extra):
    return api.call('post', '/bookings', {'tutorId': tutor, 'kind': kind, 'subject': api.get_ok(f'/tutors/{tutor}')["subjects"][0], 'start': start, 'durationMin': 60, **extra})


def test_booking_holds_money_and_hides_the_fee_from_the_student(olga):
    response = book(olga, free_slot(olga), topic='Past Simple')
    assert response.status_code == 201
    lesson = response.json()
    assert lesson['status'] == 'pending' and lesson['payment'] == 'hold' and lesson['price'] == 1320
    assert lesson['tutorPrice'] == 1320  # ученик не видит цену репетитора
    assert 'confirmBy' in lesson
    assert lesson['topic'] == 'Past Simple'
    assert Lesson.objects.get(pk=lesson['id']).topic == 'Past Simple'
    assert PaymentRecord.objects.filter(lesson_id=lesson['id'], kind='hold', amount=1320).exists()


def test_tutor_sees_only_his_own_price(olga, anastasia):
    lesson = book(olga, free_slot(olga)).json()
    seen = anastasia.get_ok(f'/lessons/{lesson["id"]}')
    assert seen['price'] == 1200 and seen['tutorPrice'] == 1200


def test_same_slot_cannot_be_booked_twice(olga):
    start = free_slot(olga)
    assert book(olga, start).status_code == 201
    second = book(olga, start)
    assert second.status_code == 409 and 'занято' in second.json()['message']


def test_booking_is_idempotent_with_key(olga):
    start = free_slot(olga)
    first = olga.call('post', '/bookings', {'tutorId': 'english', 'kind': 'regular', 'subject': 'Английский', 'start': start, 'durationMin': 60}, HTTP_IDEMPOTENCY_KEY='abc123')
    again = olga.call('post', '/bookings', {'tutorId': 'english', 'kind': 'regular', 'subject': 'Английский', 'start': start, 'durationMin': 60}, HTTP_IDEMPOTENCY_KEY='abc123')
    assert first.json()['id'] == again.json()['id']
    assert Lesson.objects.filter(idempotency_key='abc123').count() == 1


def test_paid_lesson_needs_a_card_and_declined_card_is_reported(olga):
    olga.call('delete', '/me/cards/card-1', status=204)
    assert book(olga, free_slot(olga)).status_code == 402
    card = olga.post_ok('/me/cards', {'number': '2200 0000 0000 0119', 'expiry': '12/30', 'cvc': '123'}, 201)
    assert card['primary'] is True
    declined = book(olga, free_slot(olga))
    assert declined.status_code == 402 and 'отклонил' in declined.json()['message']
    assert Lesson.objects.filter(student__email='olga@mail.ru', start__gt=timezone.now() + 5 * HOUR, status='pending').count() == 1  # только демо-урок l-2


def test_free_intro_is_one_per_pair_and_uses_tutor_duration(olga):
    tutor = olga.get_ok('/tutors/chemistry-biology')
    assert tutor['introMinutes'] > 0
    first = book(olga, free_slot(olga, 'chemistry-biology'), 'chemistry-biology', 'intro')
    assert first.status_code == 201
    lesson = first.json()
    assert lesson['payment'] == 'none' and lesson['price'] == 0 and lesson['durationMin'] == tutor['introMinutes']
    again = book(olga, free_slot(olga, 'chemistry-biology', 4), 'chemistry-biology', 'intro')
    assert again.status_code == 409 and 'уже было' in again.json()['message']
    assert not PaymentRecord.objects.filter(lesson_id=lesson['id']).exists()


def test_cancel_free_until_four_hours_then_money_stays(olga, demo):
    free = olga.post_ok(f'/lessons/{book(olga, free_slot(olga)).json()["id"]}/cancel', {'reason': 'Не получается'})
    assert free['status'] == 'cancelled' and free['payment'] == 'refunded'
    Lesson.objects.filter(id='l-1').update(start=timezone.now() + 3 * HOUR)
    late = olga.post_ok('/lessons/l-1/cancel', {'reason': 'Заболела'})
    assert late['payment'] == 'captured'
    assert olga.call('post', '/lessons/l-1/cancel', {'reason': 'ещё раз'}).status_code == 400


def test_tutor_cancel_always_refunds(olga, anastasia):
    Lesson.objects.filter(id='l-1').update(start=timezone.now() + HOUR)
    cancelled = anastasia.post_ok('/lessons/l-1/cancel', {'reason': 'Заболела'})
    assert cancelled['payment'] == 'refunded' and cancelled['cancelledBy'] == 'tutor'
    assert PaymentRecord.objects.filter(lesson_id='l-1', kind='refund').exists()


def test_confirm_captures_and_decline_releases(olga, anastasia):
    pending = book(olga, free_slot(olga)).json()['id']
    confirmed = anastasia.post_ok(f'/lessons/{pending}/confirm')
    assert confirmed['status'] == 'confirmed' and confirmed['payment'] == 'captured' and confirmed['meetingUrl']
    other = book(olga, free_slot(olga, skip=3)).json()['id']
    declined = anastasia.post_ok(f'/lessons/{other}/decline', {'reason': 'Занята'})
    assert declined['status'] == 'declined' and declined['payment'] == 'refunded'
    assert PaymentRecord.objects.filter(lesson_id=other, kind='release').exists()
    assert olga.call('post', f'/lessons/{other}/confirm').status_code == 403


def test_access_to_foreign_lessons_is_closed(olga, anastasia):
    stranger = Api()
    stranger.post_ok('/auth/signup', {'role': 'student', 'name': 'Пётр', 'email': 'petr.t@mail.ru', 'password': 'Strong-local-test-42!'}, 201)
    assert stranger.call('get', '/lessons/l-1').status_code == 404
    assert stranger.call('post', '/lessons/l-1/cancel', {'reason': 'x'}).status_code == 404
    other_tutor = Api()
    other_tutor.login_as('anastasia@toprepet.ru')
    assert other_tutor.call('get', '/lessons/l-3').status_code == 404  # урок к другому репетитору


def test_unconfirmed_lessons_expire_and_money_is_released(olga):
    lesson = book(olga, free_slot(olga)).json()['id']
    Lesson.objects.filter(id=lesson).update(confirm_by=timezone.now() - HOUR)
    assert jobs.run_all()['expired_lessons'] >= 1
    seen = olga.get_ok(f'/lessons/{lesson}')
    assert seen['status'] == 'expired' and seen['payment'] == 'refunded'


def test_move_needs_free_slot_and_other_side_answer(olga, anastasia):
    new_start = free_slot(olga, skip=6)
    proposed = olga.post_ok('/lessons/l-1/move', {'start': new_start})
    assert proposed['moveProposal'] == {'start': new_start, 'by': 'student'}
    assert olga.call('post', '/lessons/l-1/move/answer', {'accept': True}).status_code == 403
    answered = anastasia.post_ok('/lessons/l-1/move/answer', {'accept': True})
    assert answered['start'] == new_start and answered['moveProposal'] is None
    assert olga.call('post', '/lessons/l-1/move', {'start': timezone.now().isoformat()}).status_code == 409


def test_result_marking_rules(olga, anastasia):
    assert anastasia.call('post', '/lessons/l-1/result', {'result': 'happened'}).status_code == 400  # ещё не начался
    Lesson.objects.filter(id='l-1').update(start=timezone.now() - 2 * HOUR)
    assert olga.call('post', '/lessons/l-1/result', {'result': 'happened'}).status_code == 403
    assert anastasia.post_ok('/lessons/l-1/result', {'result': 'happened'})['status'] == 'completed'
    Lesson.objects.filter(id='l-3').update(start=timezone.now() - 2 * HOUR)
    refunded = olga.post_ok('/lessons/l-3/result', {'result': 'no_show_tutor'})
    assert refunded['status'] == 'no_show_tutor'


def test_problem_dispute_flow_refund_and_pay(olga, anastasia):
    assert olga.call('post', '/lessons/l-5/problem', {'reason': 'Не было связи', 'text': 'Давно было'}).status_code == 400
    dispute = olga.post_ok('/lessons/l-7/problem', {'reason': 'Репетитор не пришёл', 'text': 'Ждали двадцать минут.'}, 201)
    assert olga.get_ok('/lessons/l-7')['disputeId'] == dispute['id'] and olga.get_ok('/lessons/l-7')['status'] == 'disputed'
    assert olga.call('post', '/lessons/l-7/problem', {'reason': 'ещё', 'text': 'ещё раз'}).status_code == 409
    assert olga.call('post', f'/disputes/{dispute["id"]}/reply', {'text': 'Я не ученик, отвечать не могу'}).status_code == 403
    replied = anastasia.post_ok(f'/disputes/{dispute["id"]}/reply', {'text': 'Я была на связи, ученик не подключился.'})
    assert replied['status'] == 'tutor_replied'
    admin = Api()
    admin.login_as('admin@toprepet.ru')
    assert olga.call('post', f'/admin/disputes/{dispute["id"]}/resolve', {'outcome': 'refund'}).status_code == 403
    resolved = admin.post_ok(f'/admin/disputes/{dispute["id"]}/resolve', {'outcome': 'refund'})
    assert resolved['status'] == 'resolved_refund'
    assert olga.get_ok('/lessons/l-7')['payment'] == 'refunded'
    assert any(n['title'] == 'Спор решён' for n in olga.get_ok('/me/notifications'))


def test_payout_waits_for_tutor_requisites(olga, anastasia):
    Lesson.objects.filter(id='l-1').update(start=timezone.now() - 3 * 24 * HOUR, status='completed')
    assert jobs.run_all()['payouts'] == 0 and Lesson.objects.get(id='l-1').payment == 'captured'
    assert anastasia.get_ok('/tutor/finance')['available'] == 1200 + 1200  # l-1 и l-7 ждут выплаты
    bad = anastasia.call('put', '/tutor/payout', {'inn': '123', 'cardNumber': '2200 0000 0000 1111'})
    assert bad.status_code == 400
    ok = anastasia.call('put', '/tutor/payout', {'inn': '123456789012', 'cardNumber': '2200 0000 0000 1111'}, 200).json()
    assert ok == {'inn': '123456789012', 'cardLast4': '1111', 'selfEmployedConfirmed': True}
    assert jobs.run_all()['payouts'] >= 1
    assert Lesson.objects.get(id='l-1').payment == 'paid_out'
    assert anastasia.get_ok('/tutor/finance')['paidThisMonth'] >= 1200


def test_lists_students_and_tutors_and_lesson_scopes(olga, anastasia):
    upcoming = olga.get_ok('/me/lessons', {'scope': 'upcoming'})
    past = olga.get_ok('/me/lessons', {'scope': 'past'})
    assert [l['id'] for l in upcoming] == ['l-1', 'l-2', 'l-3']
    assert {l['id'] for l in past} == {'l-4', 'l-5', 'l-6', 'l-7'}
    assert anastasia.get_ok('/tutor/students')[0]['name'] == 'Ольга'
    assert olga.get_ok('/me/tutors')[0]['name'] in ('Анастасия', 'Ерлан', 'Анна')
    assert olga.call('get', '/tutor/students').status_code == 403


def test_pilot_booking_needs_no_card_and_is_confirmed_once(olga, anastasia, settings):
    settings.PILOT_MODE = True
    settings.PAYMENT_PROVIDER = 'disabled'
    settings.MEETING_ROOM_BASE_URL = ''
    olga.call('delete', '/me/cards/card-1', status=204)
    data = {'tutorId': 'english', 'kind': 'regular', 'start': free_slot(olga),
            'durationMin': 60, 'subject': 'Английский', 'topic': 'Глаголы'}
    headers = {'HTTP_IDEMPOTENCY_KEY': 'pilot-one'}
    lesson = olga.call('post', '/bookings', data, 201, **headers).json()
    assert olga.call('post', '/bookings', data, 201, **headers).json()['id'] == lesson['id']
    olga.call('post', '/bookings', {**data, 'topic': 'Другая тема'}, 409, **headers)
    assert lesson['status'] == 'confirmed' and lesson['isDemo'] and lesson['payment'] == 'none'
    assert lesson['meetingUrl'] is None and 'confirmBy' not in lesson
    assert not PaymentRecord.objects.filter(lesson_id=lesson['id']).exists()
    assert len([n for n in olga.get_ok('/me/notifications') if n['link'] == f'/me/lessons/{lesson["id"]}']) == 1
    meeting = f'/lessons/{lesson["id"]}/meeting'
    url = 'https://meet.example.com/unique-lesson'
    olga.call('put', meeting, {'url': url}, 403)
    anastasia.call('put', meeting, {'url': 'http://meet.example.com/unique-lesson'}, 400)
    anastasia.call('put', meeting, {'url': url}, 200)
    assert olga.get_ok(f'/lessons/{lesson["id"]}')['meetingUrl'] == url
    assert olga.post_ok(f'/lessons/{lesson["id"]}/cancel', {'reason': 'Тест'})['payment'] == 'none'

    completed = book(olga, free_slot(olga), topic='Упражнения').json()
    Lesson.objects.filter(pk=completed['id']).update(start=timezone.now() - timedelta(minutes=90))
    result = anastasia.post_ok(f'/lessons/{completed["id"]}/result', {'result': 'happened'})
    assert result['status'] == 'completed' and result['payment'] == 'none'
    assert any(item['id'] == completed['id'] and item['topic'] == 'Упражнения'
               for item in olga.get_ok('/me/lessons', {'scope': 'past'}))


def test_reminders_sent_once_per_lesson_time(olga, settings):
    settings.PILOT_MODE = True
    lesson = book(olga, free_slot(olga)).json()
    start = Lesson.objects.get(pk=lesson['id']).start
    jobs.remind_upcoming(start - 3 * HOUR)
    jobs.remind_upcoming(start - 3 * HOUR)
    jobs.remind_upcoming(start - HOUR)
    jobs.remind_upcoming(start - HOUR)
    assert set(Lesson.objects.get(pk=lesson['id']).reminders.values_list('offset_hours', flat=True)) == {1, 24}


def test_urgent_request_moves_above_regular_and_expires_in_a_day(olga):
    data = {'subjects': ['Математика'], 'description': 'Помогите разобрать уравнения'}
    urgent = olga.post_ok('/requests', {**data, 'urgent': True}, 201)
    regular = olga.post_ok('/requests', data, 201)
    assert urgent['urgent'] and not regular['urgent']
    assert [item['id'] for item in olga.get_ok('/requests')][:2] == [urgent['id'], regular['id']]
    from requests_board.models import StudyRequest
    record = StudyRequest.objects.get(pk=urgent['id'])
    assert timedelta(hours=23, minutes=59) < record.expires_at - record.created_at <= timedelta(days=1)
