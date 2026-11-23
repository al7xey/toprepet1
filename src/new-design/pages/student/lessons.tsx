import { useState } from 'react';
import { api } from '../../api';
import { useQuery } from '../../api/hooks';
import { AppLayout } from '../../layout/layouts';
import { Button, EmptyState, LessonCard, LoadingList, PageHeader, QueryView, SearchInput, Tabs } from '../../ui';

type Scope = 'upcoming' | 'past';

/** Мои уроки: предстоящие и прошедшие. */
export default function LessonsPage() {
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<Scope>('upcoming');
  const lessons = useQuery(`lessons-${scope}`, () => api.listLessons(scope));
  return (
    <AppLayout role="student">
      <PageHeader title="Мои уроки" />
      <Tabs<Scope> items={[{ value: 'upcoming', label: 'Предстоящие' }, { value: 'past', label: 'Прошедшие' }]} value={scope} onChange={setScope} />
      <SearchInput label="Найти занятие" placeholder="Предмет или преподаватель" value={search} onChange={setSearch} />
      <QueryView
        query={lessons}
        loading={<LoadingList rows={3} height={132} />}
        empty={(items) => (items.length ? null : (
          scope === 'upcoming'
            ? <EmptyState icon="cal" title="Пока нет уроков" text="Выберите репетитора в каталоге и запишитесь на бесплатное знакомство или на урок." actions={<Button to="/teachers" size="lg">Найти репетитора</Button>} />
            : <EmptyState icon="cal" title="Прошедших уроков пока нет" text="Здесь появятся состоявшиеся и отменённые уроки." />
        ))}
      >
        {(items) => { const filtered = items.filter((lesson) => `${lesson.subject} ${lesson.tutorName}`.toLocaleLowerCase('ru-RU').includes(search.trim().toLocaleLowerCase('ru-RU'))); return filtered.length ? <div className="trk-list">{filtered.map((l) => <LessonCard key={l.id} lesson={l} role="student" />)}</div> : <EmptyState icon="search" title="Занятия не найдены" text="Попробуйте другое имя или предмет." actions={<Button variant="line" onClick={() => setSearch('')}>Сбросить поиск</Button>} />; }}
      </QueryView>
    </AppLayout>
  );
}
