"""Создаёт вымышленные профили и аккаунты для локального пилота."""
import secrets

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from accounts.models import User
from tutors.models import Tutor


TUTORS = [
    ('vera', 'Вера · демо', ['Информатика', 'Математика'], 1250, 20,
     ['ЕГЭ по информатике', 'Python', 'Алгоритмы']),
    ('maksim', 'Максим · демо', ['Математика', 'Физика'], 1850, 0,
     ['ОГЭ по математике', 'Геометрия', 'Механика']),
    ('alina', 'Алина · демо', ['Английский язык'], 950, 15,
     ['Разговорный английский', 'Школьная программа', 'Грамматика']),
    ('maria', 'Мария · демо', ['Русский язык', 'Литература'], 1450, 20,
     ['ЕГЭ по русскому языку', 'Сочинение', 'Анализ текста']),
]


class Command(BaseCommand):
    help = 'Добавляет локальные тестовые аккаунты и анкеты без фотографий'

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.PILOT_MODE:
            raise CommandError('Для тестовых пользователей включите DEBUG=1 и PILOT_MODE=1')

        credentials = []

        def account(login, name, role):
            email = f'{login}@pilot.example.test'
            user = User.objects.filter(email=email).first()
            if user:
                if user.name != name or user.role != role:
                    raise CommandError(f'Адрес {email} уже занят другим аккаунтом')
                return user
            password = secrets.token_urlsafe(16)
            user = User.objects.create_user(
                email, password, name=name, role=role,
                email_verified=True, onboarded=True, is_staff=(role == 'admin'),
            )
            credentials.append((role, email, password))
            return user

        for login, name in [('student1', 'Кира · тест'), ('student2', 'Павел · тест'), ('student3', 'Нина · тест')]:
            account(login, name, 'student')
        account('moderator', 'Модератор · тест', 'admin')
        for index, (login, name, subjects, price, intro, topics) in enumerate(TUTORS):
            user = account(login, name, 'tutor')
            Tutor.objects.get_or_create(user=user, defaults={
                'name': name,
                'headline': 'Тестовая анкета преподавателя',
                'subjects': subjects,
                'card_subjects': ' / '.join(subjects),
                'help_topics': topics,
                'intro': 'Вымышленная анкета для проверки поиска и записи на занятие.',
                'approach': 'В начале знакомимся с задачей ученика, затем разбираем примеры и планируем следующий шаг.',
                'price': price,
                'intro_minutes': intro,
                'durations': [45, 60],
                'status': 'published',
                'week': [{'weekday': day, 'intervals': [{'from': '09:00', 'to': '21:00'}]} for day in range(1, 8)],
                'sort_order': index + 1,
            })

        for role, email, password in credentials:
            self.stdout.write(f'{role}	{email}	{password}')
        self.stderr.write(f'Новых аккаунтов: {len(credentials)}. Существующие аккаунты сохранены.')
