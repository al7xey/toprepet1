import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useQuery } from '../../api/hooks';
import { useSession } from '../../api/session';
import { PublicLayout } from '../../layout/layouts';
import { Button, Faq, Section, Steps } from '../../ui';
import { TutorShowcase } from '../../ui/tutor-showcase';
import { HOW_STEPS, STUDENT_FAQ } from './content';
import { publicAssetPath, publicAssetSrcSet } from '../../../shared/lib/public-assets';

export default function HomePage() {
  const { user } = useSession();
  const features = useQuery('features', () => api.features());
  const tutors = useQuery('home-tutors', () => api.listTutors({ limit: 6 }).then((p) => p.items));

  return (
    <PublicLayout>
      <section className="trh-hero" aria-labelledby="hero-title">
        <div className="trh-hero-text">
          <h1 id="hero-title" className="hero-h trh-hero-h">Репетитор под вашу цель</h1>
          <p className="trh-hero-lead">Подготовьтесь к экзамену или разберитесь в сложном предмете. Сравните преподавателей и выберите удобное время.</p>
          <div className="trh-hero-btns">
            <Button to="/teachers" size="lg" className="trh-cta">Найти репетитора</Button>
            {(!user || user.role === 'student') && <Link className="trh-hero-link" to="/me/requests/new">Создать заявку</Link>}
          </div>
        </div>
        <div className="trh-hero-media">
          <img src={publicAssetPath('/images/hero-slide-3-1200.webp')} srcSet={publicAssetSrcSet('/images/hero-slide-3-640.webp 640w, /images/hero-slide-3-1200.webp 1200w')} sizes="(min-width:1440px) 640px, (min-width:761px) 46vw, calc(100vw - 32px)" alt="Ученица занимается за ноутбуком" width={1200} height={900} fetchPriority="high" />
        </div>
      </section>

      <Section title="Репетиторы" className="trh-home-section" action={<Link className="trh-section-link" to="/teachers">Все репетиторы</Link>}>
        <TutorShowcase query={tutors} />
      </Section>

      <Section title="Как всё устроено" id="how" className="trh-home-section trh-home-steps">
        <Steps items={HOW_STEPS} />
      </Section>

      <Section title="Познакомьтесь до первого занятия" className="trh-home-section trh-intro">
        <p className="cap">Обсудите задачу и решите, подходит ли вам преподаватель. Длительность знакомства указана в анкете.</p>
        <Button to="/teachers?intro=1" size="lg" variant="line" block>Бесплатное знакомство</Button>
      </Section>

      <Section title="Вы репетитор? Найдём для вас учеников" className="trh-recruit trh-home-section">
        <Button to="/for-repetitor/" size="lg" block>Стать топ-репетом</Button>
      </Section>

      <Section title="Вопросы и ответы">
        <Faq items={features.data?.pilotMode ? STUDENT_FAQ.slice(0, 4).map(([question, answer], index) => [question, index === 0 ? 'Откройте анкету, выберите свободное время и подтвердите запись. Занятие появится в кабинете.' : answer]) : STUDENT_FAQ} />
      </Section>
    </PublicLayout>
  );
}
