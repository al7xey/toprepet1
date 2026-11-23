import { ApiError, type Api } from './contract';
import type { Page, Slot, Tutor, TutorFilter } from './types';

const portrait = (name: string) => `${import.meta.env.BASE_URL}images/pilot/${name}.webp`;

const tutors: Tutor[] = [
  {
    id: 'preview-vera', name: 'Вера', photo: portrait('vera'), headline: 'Информатика и математика для 8–11 классов',
    subjects: ['Информатика', 'Математика'], cardSubjects: 'Информатика / Математика',
    helpTopics: ['ЕГЭ по информатике', 'Python', 'Алгоритмы', 'Системы счисления', 'Логика'],
    experience: '5 лет индивидуальных занятий. Работаю со школьниками, которые только начинают писать код, и с теми, кто решает вторую часть ЕГЭ.',
    intro: 'Готовлю к ЕГЭ по информатике и помогаю освоить Python с нуля. Сложные алгоритмы разбираем на небольших задачах.',
    approach: 'Начинаем с разбора одной задачи, затем решаем похожую вместе. В конце фиксируем, что повторить к следующему уроку.',
    achievements: [
      { title: 'Бакалавриат по прикладной информатике', text: 'Программирование, дискретная математика и анализ алгоритмов.' },
      { title: 'Методика подготовки к ЕГЭ', text: 'Практика по задачам с кодом и разбор типичных ошибок.' },
    ], price: 1250, studentPrice: 1375, introMinutes: 20, rating: null, reviewsCount: 0, status: 'published', timezone: 'Europe/Moscow', documentsVerified: false, durations: [45, 60], levels: ['8–9 класс', '10–11 класс'],
  },
  {
    id: 'preview-maksim', name: 'Максим', photo: portrait('maksim'), headline: 'Математика и физика для 7–11 классов',
    subjects: ['Математика', 'Физика'], cardSubjects: 'Математика / Физика',
    helpTopics: ['ОГЭ по математике', 'Геометрия', 'Механика', 'Уравнения', 'Электричество'],
    experience: '7 лет преподавания. Веду школьную математику и физику, в том числе подготовку к устным ответам и письменным работам.',
    intro: 'Объясняю, откуда берутся формулы и как выбирать метод решения. Помогаю подготовиться к ОГЭ и контрольным.',
    approach: 'Рисуем схему, составляем уравнение и проверяем ответ. После урока остаётся конспект с одним разобранным примером.',
    achievements: [
      { title: 'Педагогическое образование', text: 'Два профиля подготовки: математика и физика.' },
      { title: 'Курс по подготовке к ОГЭ', text: 'Разбор задач второй части и проверка оформления решений.' },
    ], price: 1850, studentPrice: 2035, introMinutes: 0, rating: null, reviewsCount: 0, status: 'published', timezone: 'Europe/Moscow', documentsVerified: false, durations: [45, 60], levels: ['7–9 класс', '10–11 класс'],
  },
  {
    id: 'preview-alina', name: 'Алина', photo: portrait('alina'), headline: 'Английский для школьников и взрослых',
    subjects: ['Английский язык'], cardSubjects: 'Английский язык',
    helpTopics: ['Разговорный английский', 'Школьная программа', 'Грамматика', 'Аудирование', 'Английский для поездок', 'Подготовка к собеседованию'],
    experience: '4 года индивидуальных занятий. Работаю с уровнями A2–B2, помогаю освоиться перед поездкой или собеседованием.',
    intro: 'Помогаю перейти от учебника к разговору: обсуждаем знакомые темы, исправляем типичные ошибки и расширяем словарь.',
    approach: 'На каждом уроке есть короткий диалог, упражнение на грамматику и задание, которое можно повторить самостоятельно.',
    achievements: [
      { title: 'Бакалавриат по английской филологии', text: 'Лингвистика, перевод и методика преподавания.' },
      { title: 'Курс разговорной практики A2–B2', text: 'Уроки с диалогами и заданиями на понимание речи.' },
    ], price: 950, studentPrice: 1045, introMinutes: 15, rating: null, reviewsCount: 0, status: 'published', timezone: 'Europe/Moscow', documentsVerified: false, durations: [45, 60], levels: ['5–9 класс', 'Взрослые'],
  },
  {
    id: 'preview-maria', name: 'Мария', photo: portrait('maria'), headline: 'Русский язык и литература для 8–11 классов',
    subjects: ['Русский язык', 'Литература'], cardSubjects: 'Русский язык / Литература',
    helpTopics: ['ЕГЭ по русскому языку', 'Сочинение', 'Анализ текста', 'Орфография', 'Пунктуация'],
    experience: '6 лет подготовки школьников. Проверяю тексты по критериям экзамена и подбираю задания по типичным ошибкам.',
    intro: 'Разбираю с учениками структуру сочинения, аргументацию и задания ЕГЭ. Показываю, как редактировать собственный текст.',
    approach: 'Читаем фрагмент, собираем план, пишем один абзац и проверяем его по критериям. Дорабатываем текст по обратной связи.',
    achievements: [
      { title: 'Магистратура по русской филологии', text: 'Анализ художественных текстов и практика редактирования.' },
      { title: 'Методика работы с сочинением', text: 'План, аргументация и проверка по критериям экзамена.' },
    ], price: 1450, studentPrice: 1595, introMinutes: 20, rating: null, reviewsCount: 0, status: 'published', timezone: 'Europe/Moscow', documentsVerified: false, durations: [45, 60], levels: ['8–9 класс', '10–11 класс'],
  },
];

const previewOnly = () => new ApiError('В публичном превью доступны каталог и анкеты. Для входа, чатов и записи нужен работающий сервер TopRepet.', 503, 'preview_read_only');

function filterTutors(filter: TutorFilter): Tutor[] {
  const query = filter.query?.trim().toLocaleLowerCase('ru-RU');
  const result = tutors.filter((tutor) => {
    const searchText = [tutor.name, tutor.headline, ...tutor.subjects, ...tutor.helpTopics].join(' ').toLocaleLowerCase('ru-RU');
    return (!query || searchText.includes(query))
      && (!filter.subject || tutor.subjects.includes(filter.subject))
      && (filter.priceMin == null || tutor.studentPrice >= filter.priceMin)
      && (filter.priceMax == null || tutor.studentPrice <= filter.priceMax)
      && (!filter.hasIntro || tutor.introMinutes > 0);
  });
  if (filter.sort === 'price_asc') result.sort((a, b) => a.studentPrice - b.studentPrice);
  if (filter.sort === 'price_desc') result.sort((a, b) => b.studentPrice - a.studentPrice);
  return result;
}

export function createStaticPreviewApi(httpApi: Api): Api {
  return new Proxy(httpApi, {
    get(target, property, receiver) {
      if (property === 'features') return async () => ({ pilotMode: true, testPayments: true });
      if (property === 'me') return async () => null;
      if (property === 'listTutors') return async (filter: TutorFilter = {}) => {
        const result = filterTutors(filter);
        const offset = Math.max(0, Number(filter.cursor) || 0);
        const limit = Math.max(1, Math.min(50, filter.limit ?? 8));
        const page: Page<Tutor> = { items: result.slice(offset, offset + limit), total: result.length, nextCursor: offset + limit < result.length ? String(offset + limit) : null };
        return page;
      };
      if (property === 'getTutor') return async (id: string) => {
        const tutor = tutors.find((item) => item.id === id);
        if (!tutor) throw new ApiError('Анкета не найдена', 404, 'not_found');
        return tutor;
      };
      if (property === 'getTutorReviews') return async () => [];
      if (property === 'getTutorSlots') return async (_id: string, from: string, days: number): Promise<Slot[]> => {
        const start = new Date(from);
        const now = Date.now();
        const slots: Slot[] = [];
        for (let day = 0; day < Math.min(days, 30); day += 1) {
          const date = new Date(start);
          date.setDate(date.getDate() + day);
          for (const hour of [10, 13, 16, 19]) {
            const slot = new Date(date);
            slot.setHours(hour, 0, 0, 0);
            slots.push({ start: slot.toISOString(), available: slot.getTime() > now });
          }
        }
        return slots;
      };
      if (['toString', 'valueOf', 'then'].includes(String(property))) return Reflect.get(target, property, receiver);
      const original = Reflect.get(target, property, receiver);
      if (typeof original !== 'function') return original;
      return async () => { throw previewOnly(); };
    },
  });
}
