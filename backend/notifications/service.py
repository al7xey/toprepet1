from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.contrib.auth import get_user_model

from .models import Notification


def notify(user, kind: str, title: str, text: str = '', link: str | None = None, *, email_preference: str | None = None):
    """Положить уведомление пользователю (user — объект или None, например у демо-репетитора без аккаунта)."""
    if user is None:
        return None
    notice = Notification.objects.create(user=user, kind=kind, title=title, text=text, link=link)
    preference = email_preference or {'lesson': 'lessons', 'message': 'messages'}.get(kind)
    if (preference and settings.SEND_EVENT_EMAILS and user.email_verified
            and (user.notify_prefs or {}).get(preference, True)
            and not (settings.EXTERNAL_EMAIL and user.email.endswith('.test'))):
        body = ('Откройте диалог, чтобы прочитать сообщение.' if kind == 'message' else text) + (f'\n\n{settings.SITE_URL}{link}' if link else '')
        transaction.on_commit(lambda: send_mail(title, body, settings.DEFAULT_FROM_EMAIL, [user.email]), robust=True)
    return notice


def notify_admins(kind: str, title: str, text: str = '', link: str | None = None):
    for admin in get_user_model().objects.filter(role='admin', is_active=True):
        notify(admin, kind, title, text, link)


def tutor_user(tutor):
    return tutor.user
