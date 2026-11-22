# TopRepet

TopRepet связывает учеников и частных репетиторов. Ученик ищет преподавателя, отправляет заявку или записывается на бесплатное знакомство. Репетитор ведёт анкету и расписание, отвечает на заявки и подтверждает записи. Администратор проверяет анкеты, документы и отзывы, разбирает споры.

Интерфейс — React, TypeScript и Vite. Данные и сессии — Django REST Framework. Для локального запуска используется SQLite, для рабочего окружения — PostgreSQL.

## Запуск на Windows

Нужны Python 3.12+, Node.js 22.13+ и pnpm 10. Выполните команды из корня проекта в первом окне PowerShell.

```powershell
python -m venv backend/.venv
& ./backend/.venv/Scripts/python.exe -m pip install -r backend/requirements-dev.txt tzdata
$env:DEBUG = '1'
$env:SITE_URL = 'http://127.0.0.1:5199'
& ./backend/.venv/Scripts/python.exe backend/manage.py migrate
& ./backend/.venv/Scripts/python.exe backend/manage.py runserver 127.0.0.1:8011
```

Во втором окне PowerShell выполните:

```powershell
pnpm install --frozen-lockfile
pnpm dev --strictPort
```

Откройте [сайт](http://127.0.0.1:5199/) или [регистрацию](http://127.0.0.1:5199/signup). Vite передаёт запросы `/api` в локальный Django. В пустом каталоге появятся опубликованные анкеты, созданные через сервис. Без SMTP письмо с кодом регистрации и ссылка восстановления выводятся в окне Django. Без платёжного провайдера доступны бесплатные знакомства.

## Локальный пилот без оплаты

В первом окне PowerShell из корня проекта включите пилот и подготовьте отдельные учебные аккаунты.

```powershell
$env:DEBUG = '1'
$env:PILOT_MODE = '1'
$env:SITE_URL = 'http://127.0.0.1:5199'
$env:LOCAL_EMAIL_DIR = Join-Path (Get-Location) 'work/mail'
$env:SEND_EVENT_EMAILS = '1'
New-Item -ItemType Directory -Force work | Out-Null
& ./backend/.venv/Scripts/python.exe backend/manage.py migrate
& ./backend/.venv/Scripts/python.exe backend/manage.py seed_pilot > work/pilot-accounts-new.tsv
& ./backend/.venv/Scripts/python.exe backend/manage.py runserver 127.0.0.1:8011
```

Письма о записи и напоминания сохраняются в `work/mail`. Команда `seed_pilot` печатает пароли только при создании аккаунтов. Храните первый файл с паролями локально. Анкеты видны в каталоге сразу. Портреты синтетические, из [sigils people, Ariel Bravo Ayala](https://ambravo.github.io/sigils-people/) ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)). Файлы `kz-01`, `ru-08`, `uz-01`, `ge-01` уменьшены и преобразованы в WebP. Чтобы обновить тексты и портреты уже созданных демо-анкет, запустите `seed_pilot --refresh-profiles`. Пилот пропускает проверку почты при входе и регистрации. Привязка карты и выплаты в пилоте отключены. Новые записи сразу подтверждаются и отображаются в кабинетах.

Для напоминаний запустите `python manage.py run_jobs --watch` из `backend` в отдельном окне с теми же переменными окружения. Для реальной почты администратор может задать `EMAIL_URL` и `DEFAULT_FROM_EMAIL`. При настроенном SMTP рассылка событий пропускает адреса с доменом `.test`. Репетитор может добавить свою HTTPS-ссылку в карточке урока. Если настроен `MEETING_ROOM_BASE_URL`, для каждой новой подтверждённой записи будет отдельный адрес комнаты на этом сервере.

## Сборка и проверка

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test` проверяют фронтенд.
- `cd backend; python -m pytest` проверяет Django. Запускайте из активного виртуального окружения.
- `pnpm build` собирает приложение из версии блога, сохранённой в репозитории. `pnpm sync:blog` обновляет снимок отдельно.
- `bash backend/scripts/contract.sh` и `bash backend/scripts/e2e.sh` поднимают сервер с отдельными тестовыми данными. Подробности в [инструкции по тестированию](docs/testing.md).

Для развёртывания задайте `VITE_API_URL` с адресом Django, если он работает на отдельном домене. См. [настройки сервера](docs/backend.md) и [аудит MVP](docs/mvp-audit.md).
