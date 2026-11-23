# Карта переработки экранов

Белая тема, Manrope, оранжевый акцент. Мобильная шапка и карточки преподавателей сохранены.

Варианты композиции подключены явно на каждой странице через `view`, а не определяются глобально по URL. Общие API, валидация и бизнес-правила сохранены.

| Файл страницы | Новая композиция |
| --- | --- |
| `src/new-design/pages/public/home.tsx` | `landing` |
| `src/new-design/pages/public/catalog.tsx` | `catalog` |
| `src/new-design/pages/public/profile.tsx` | `profile` |
| `src/new-design/pages/public/tutors.tsx` | `recruit` |
| `src/new-design/pages/public/help.tsx` | `support` |
| `src/new-design/pages/public/blog.tsx` | `editorial` |
| `src/new-design/pages/public/legal.tsx` | `reading` |
| `src/new-design/pages/public/notfound.tsx` | `result` |
| `src/new-design/pages/auth/login.tsx` | `signin` |
| `src/new-design/pages/auth/signup.tsx` | `signup` |
| `src/new-design/pages/auth/reset.tsx` | `recovery` |
| `src/new-design/pages/auth/verify.tsx` | `verification` |
| `src/new-design/pages/auth/onboarding.tsx` | `onboarding` |
| `src/new-design/pages/student/account.tsx` | `account` |
| `src/new-design/pages/student/settings.tsx` | `settings` |
| `src/new-design/pages/student/lessons.tsx` | `lessons` |
| `src/new-design/pages/student/lesson.tsx` | `lesson-detail` |
| `src/new-design/pages/student/book.tsx` | `booking` |
| `src/new-design/pages/student/done.tsx` | `receipt` |
| `src/new-design/pages/student/tutors.tsx` | `directory` |
| `src/new-design/pages/student/payments.tsx` | `ledger` |
| `src/new-design/pages/student/review.tsx` | `feedback` |
| `src/new-design/pages/student/problem.tsx` | `report` |
| `src/new-design/pages/tutor/account.tsx` | `account` |
| `src/new-design/pages/tutor/settings.tsx` | `settings` |
| `src/new-design/pages/tutor/lessons.tsx` | `lessons` |
| `src/new-design/pages/tutor/lesson.tsx` | `lesson-detail` |
| `src/new-design/pages/tutor/schedule.tsx` | `calendar` |
| `src/new-design/pages/tutor/finance.tsx` | `finance` |
| `src/new-design/pages/tutor/students.tsx` | `directory` |
| `src/new-design/pages/tutor/reviews.tsx` | `reviews` |
| `src/new-design/pages/tutor/profile.tsx` | `profile-editor` |
| `src/new-design/pages/tutor/documents.tsx` | `documents` |
| `src/new-design/pages/tutor/wizard.tsx` | `wizard` |
| `src/new-design/pages/requests/feed.tsx` | `requests` |
| `src/new-design/pages/requests/mine.tsx` | `requests` |
| `src/new-design/pages/requests/detail.tsx` | `request-detail` |
| `src/new-design/pages/requests/new.tsx` | `wizard` |
| `src/new-design/pages/requests/tutor.tsx` | `responses` |
| `src/new-design/pages/shared/dispute.tsx` | `case` |
| `src/new-design/pages/shared/notifications.tsx` | `notifications` |
| `src/new-design/pages/chats/messenger.tsx` | `messenger` |
| `src/new-design/pages/admin/profiles.tsx` | `moderation` |
| `src/new-design/pages/admin/reviews.tsx` | `moderation` |
| `src/new-design/pages/admin/disputes.tsx` | `cases` |
| `src/new-design/pages/admin/documents.tsx` | `moderation` |
| `src/new-design/pages/admin/cancellations.tsx` | `ledger` |

## Изменения сценариев

- Запись: выбор времени и сводка разделены на две области на ПК, в естественном порядке на телефоне.
- Результат записи: факты и следующие действия в отдельных областях.
- Заявка: предмет, бюджет и задача ученика первыми; автор и расписание вторичны.
- Онбординг: заголовок перед прогрессом; «Дальше» доступна без ответа; отдельного «Пропустить» нет.
- Мастера: именованный доступный progress и пронумерованные этапы вместо безымянных сегментов.
- Главная: быстрый переход в каталог по предметам.
- Справочники людей, чтение, настройки, расписание, модерация, отзывы и история операций используют разные композиции в screens.css.

## Motion и скиллы

К ранее подключённым Tab Pill / Spring Dropdown добавлены адаптации визуальных состояний Step Progress и Checkbox List из https://designbookmark.com/motion. Код примеров получен через Copy code; autoplay галереи не переносится. Системное уменьшение движения поддерживается. Не все анимации интерфейса являются дословными копиями: сохранённые анимации и адаптации обозначены в исходниках.

Использованы frontend-design, better-interface, better-ui, better-layout, better-colors, apple-design и ui-ux-pro-max. Отдельные отсутствующие better-accessibility / better-writing / better-typography / better-motion не выдаются за пройденные самостоятельные аудиты.

## Проверки

- Типы, линтер, демо-сборка и 37 модульных тестов.
- Матрица основных страниц всех ролей: 320, 768, 1920 px.
- Качество: 15 пройденных проверок, 3 условно пропущены; axe, заголовки, размеры контролов, ссылки, мобильная шапка.
- Браузерные сценарии: поиск, чат, клавиатурные вкладки, запись и отмена, восстановление пароля, отзывы, споры, публикация анкеты, заявка → отклик → запись.
- Старые тесты удаления сообщения обновлены под меню действий; тест нескольких слотов дожидается загрузки и выбирает день с двумя окнами. Утверждения о результате сохранены.

## Ограничения

Чистые re-export файлы и серверные модули не переписывались ради количества изменений. Редкие серверные ошибки и реальные платежи этим фронтендным проходом не проверены. Проверка доступности автоматизирована; она не доказывает отсутствие всех возможных проблем интерфейса.

## Визуальный проход

Просмотрены контактные листы 35 загруженных экранов: 10 публичных, 10 ученика, 10 репетитора, 5 администратора. Исправлены чрезмерно крупное фото в редакторе, растяжение статуса и положение кнопки «Поделиться» на ПК. Это проход по загруженным состояниям; все возможные ошибки API на этих снимках не представлены.
