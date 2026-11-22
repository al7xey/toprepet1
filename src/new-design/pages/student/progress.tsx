import { api } from '../../api';
import { useQuery } from '../../api/hooks';
import type { Lesson } from '../../api/types';
import { AppLayout } from '../../layout/layouts';
import { count, minutes, whenLabel } from '../../lib/format';
import { Button, Card, EmptyState, PageHeader, QueryView, Rows, Section } from '../../ui';

function Topics({ lessons }: { lessons: Lesson[] }) {
  const subjects = new Map<string, Lesson[]>();
  for (const lesson of lessons) {
    const group = subjects.get(lesson.subject);
    if (group) group.push(lesson);
    else subjects.set(lesson.subject, [lesson]);
  }
  return [...subjects.entries()].map(([subject, lessons]) => (
    <Section key={subject} title={subject}>
      <Card>
        <p className="muted">{count(lessons.length, 'занятие', 'занятия', 'занятий')} · {minutes(lessons.reduce((sum, lesson) => sum + lesson.durationMin, 0))}</p>
        <Rows rows={lessons.map(lesson => [whenLabel(lesson.start), <Button key={lesson.id} to={`/me/lessons/${lesson.id}`} variant="line" size="s">{lesson.topic || 'Открыть занятие'}</Button>])} />
      </Card>
    </Section>
  ));
}

export default function ProgressPage() {
  const history = useQuery('study-progress', () => api.listLessons('past').then(lessons => lessons.filter(lesson => lesson.status === 'completed' && lesson.kind === 'regular')));
  return (
    <AppLayout role="student" narrow>
      <PageHeader title="Учебный прогресс" back={{ to: '/me/account', label: 'Профиль' }} />
      <QueryView query={history} empty={lessons => lessons.length ? null : <EmptyState icon="book" title="Здесь появятся пройденные темы" text="После завершения первого урока мы добавим его в учебную историю." actions={<Button to="/me/lessons" variant="line">Мои уроки</Button>} />}>
        {lessons => <Topics lessons={lessons} />}
      </QueryView>
    </AppLayout>
  );
}
