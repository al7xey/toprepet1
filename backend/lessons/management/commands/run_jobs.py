from time import sleep

from django.db import close_old_connections
from django.core.management.base import BaseCommand

from lessons.jobs import run_all


class Command(BaseCommand):
    help = 'Фоновые задания: истёкшие записи, автозавершение уроков, выплаты, истёкшие заявки. Запускать раз в минуту (cron).'

    def add_arguments(self, parser):
        parser.add_argument('--watch', action='store_true', help='Повторять запуск раз в минуту')

    def handle(self, *args, **options):
        while True:
            close_old_connections()
            self.stdout.write(str(run_all()))
            if not options['watch']:
                return
            sleep(60)
