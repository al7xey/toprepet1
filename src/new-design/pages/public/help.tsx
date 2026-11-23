import { useState } from 'react';
import { PublicLayout } from '../../layout/layouts';
import { Faq, PageHeader, SearchInput, Section, EmptyState, Button } from '../../ui';
import { STUDENT_FAQ } from './content';

const MORE_FAQ: [string, string][] = [
  ['Когда списываются деньги?', 'При записи сумма замораживается на карте и списывается, когда репетитор подтвердит урок.'],
  ['Что если репетитор не подтвердит запись?', 'Запись отменится, заморозка снимется, деньги останутся на карте.'],
  ['Как перенести урок?', 'Откройте урок в разделе «Мои уроки», нажмите «Перенести» и выберите другое время. Репетитор подтвердит перенос.'],
];
const FAQ = [...STUDENT_FAQ, ...MORE_FAQ];
const FAQ_SCHEMA = {
  '@context': 'https://schema.org', '@type': 'FAQPage', '@id': 'https://toprepet.ru/help/#faq',
  mainEntity: FAQ.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })),
};

/** Помощь: ответы на частые вопросы про запись, оплату, отмену и переносы. */
export default function HelpPage() {
  const [search, setSearch] = useState('');
  const filtered = FAQ.filter(([question, answer]) => `${question} ${answer}`.toLocaleLowerCase('ru-RU').includes(search.trim().toLocaleLowerCase('ru-RU')));
  return (
    <PublicLayout tight>
      <PageHeader title="Помощь" />
      <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA).replace(/</g, '\\u003c')}</script>
      <div className="studio-help-search"><SearchInput label="Поиск по помощи" placeholder="Запись, перенос или оплата" value={search} onChange={setSearch} /></div>
      <Section title="Вопросы и ответы">{filtered.length ? <Faq items={filtered} /> : <EmptyState icon="search" title="Ответ не найден" text="Попробуйте сформулировать вопрос иначе." actions={<Button variant="line" onClick={() => setSearch('')}>Все вопросы</Button>} />}</Section>
    </PublicLayout>
  );
}
