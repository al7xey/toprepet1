"""Создаёт вымышленные профили и аккаунты для локального пилота."""
import secrets

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from accounts.models import User
from tutors.models import Tutor


TUTORS = [
    ('vera', 'Вера', ['Информатика', 'Математика'], 1250, 20,
     ['ЕГЭ по информатике', 'Python', 'Алгоритмы', 'Системы счисления', 'Логика']),
    ('maksim', 'Максим', ['Математика', 'Физика'], 1850, 0,
     ['ОГЭ по математике', 'Геометрия', 'Механика', 'Уравнения', 'Электричество']),
    ('alina', 'Алина', ['Английский язык'], 950, 15,
     ['Разговорный английский', 'Школьная программа', 'Грамматика', 'Аудирование', 'Английский для поездок', 'Подготовка к собеседованию']),
    ('maria', 'Мария', ['Русский язык', 'Литература'], 1450, 20,
     ['ЕГЭ по русскому языку', 'Сочинение', 'Анализ текста', 'Орфография', 'Пунктуация']),
]


PROFILE_TEXT = {
    'vera': (
        'Информатика и математика для 8–11 классов',
        'Готовлю к ЕГЭ по информатике и помогаю освоить Python с нуля. Сложные алгоритмы разбираем на небольших задачах.',
        'Начинаем с разбора одной задачи, затем решаем похожую вместе. В конце фиксируем, что повторить к следующему уроку.',
        '5 лет индивидуальных занятий. Работаю со школьниками, которые только начинают писать код, и с теми, кто решает вторую часть ЕГЭ.',
        [('Бакалавриат по прикладной информатике', 'Программирование, дискретная математика и анализ алгоритмов.'),
         ('Методика подготовки к ЕГЭ', 'Практика по задачам с кодом и разбор типичных ошибок.')],
    ),
    'maksim': (
        'Математика и физика для 7–11 классов',
        'Объясняю, откуда берутся формулы и как выбирать метод решения. Помогаю подготовиться к ОГЭ и контрольным.',
        'Рисуем схему, составляем уравнение и проверяем ответ. После урока остаётся конспект с одним разобранным примером.',
        '7 лет преподавания. Веду школьную математику и физику, в том числе подготовку к устным ответам и письменным работам.',
        [('Педагогическое образование', 'Два профиля подготовки: математика и физика.'),
         ('Курс по подготовке к ОГЭ', 'Разбор задач второй части и проверка оформления решений.')],
    ),
    'alina': (
        'Английский для школьников и взрослых',
        'Помогаю перейти от учебника к разговору: обсуждаем знакомые темы, исправляем типичные ошибки и расширяем словарь.',
        'На каждом уроке есть короткий диалог, упражнение на грамматику и задание, которое можно повторить самостоятельно.',
        '4 года индивидуальных занятий. Работаю с уровнями A2–B2, помогаю освоиться перед поездкой или собеседованием.',
        [('Бакалавриат по английской филологии', 'Лингвистика, перевод и методика преподавания.'),
         ('Курс разговорной практики A2–B2', 'Уроки с диалогами и заданиями на понимание речи.')],
    ),
    'maria': (
        'Русский язык и литература для 8–11 классов',
        'Разбираю с учениками структуру сочинения, аргументацию и задания ЕГЭ. Показываю, как редактировать собственный текст.',
        'Читаем фрагмент, собираем план, пишем один абзац и проверяем его по критериям. Дорабатываем текст по обратной связи.',
        '6 лет подготовки школьников. Проверяю тексты по критериям экзамена и подбираю задания по типичным ошибкам.',
        [('Магистратура по русской филологии', 'Анализ художественных текстов и практика редактирования.'),
         ('Методика работы с сочинением', 'План, аргументация и проверка по критериям экзамена.')],
    ),
}


LEVELS = {
    'vera': ['8–9 класс', '10–11 класс'],
    'maksim': ['7–9 класс', '10–11 класс'],
    'alina': ['5–9 класс', 'Взрослые'],
    'maria': ['8–9 класс', '10–11 класс'],
}


class Command(BaseCommand):
    help = 'Добавляет локальные тестовые аккаунты и вымышленные анкеты'

    def add_arguments(self, parser):
        parser.add_argument('--refresh-profiles', action='store_true', help='Обновить описание и портреты существующих демо-анкет')

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.PILOT_MODE:
            raise CommandError('Для тестовых пользователей включите DEBUG=1 и PILOT_MODE=1')

        credentials = []

        def account(login, name, role):
            email = f'{login}@pilot.example.test'
            user = User.objects.filter(email=email).first()
            if user:
                legacy_name = role == 'tutor' and user.name == f'{name} · демо'
                if user.role != role or (user.name != name and not legacy_name):
                    raise CommandError(f'Адрес {email} уже занят другим аккаунтом')
                if legacy_name:
                    user.name = name
                    user.save(update_fields=['name'])
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
            headline, intro_text, approach, experience, achievements = PROFILE_TEXT[login]
            profile = {
                'headline': headline,
                'photo': f'/images/pilot/{login}.webp',
                'photo_srcset': '',
                'intro': intro_text,
                'approach': approach,
                'experience': experience,
                'achievements': [{'title': title, 'text': text} for title, text in achievements],
                'levels': LEVELS[login],
                'help_topics': topics,
            }
            tutor, created = Tutor.objects.get_or_create(user=user, defaults={
                **profile,
                'name': name,
                'subjects': subjects,
                'card_subjects': ' / '.join(subjects),
                'price': price,
                'intro_minutes': intro,
                'durations': [45, 60],
                'status': 'published',
                'week': [{'weekday': day, 'intervals': [{'from': '09:00', 'to': '21:00'}]} for day in range(1, 8)],
                'sort_order': index + 1,
            })
            if not created and options['refresh_profiles']:
                Tutor.objects.filter(pk=tutor.pk).update(**profile)
            if not created and tutor.name == f'{name} · демо':
                Tutor.objects.filter(pk=tutor.pk).update(name=name)

        for role, email, password in credentials:
            self.stdout.write(f'{role}	{email}	{password}')
        self.stderr.write(f'Новых аккаунтов: {len(credentials)}. Существующие аккаунты сохранены.')
