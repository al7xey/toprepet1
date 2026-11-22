import { useState } from 'react';
import { api, studentPriceOf } from '../../api';
import { homeFor, useSession } from '../../api/session';
import { useQuery } from '../../api/hooks';
import { PublicLayout } from '../../layout/layouts';
import { rub } from '../../lib/format';
import { Button, Faq, IconButton, Panel, Section, Steps } from '../../ui';
import { TutorShowcase } from '../../ui/tutor-showcase';
import { TUTOR_FAQ, TUTOR_STEPS } from './content';
import { publicAssetPath, publicAssetSrcSet } from '../../../shared/lib/public-assets';

/** Калькулятор: репетитор получает свою цену, ученик платит на 10% больше. */
function PriceCalc() {
  const [price, setPrice] = useState(2000);
  const student = studentPriceOf(price);
  return (
    <div className="card trk-card pad-md trk-calc">
      <label className="trk-calc-row">
        <span>Вы назначаете цену</span>
        <b className="tn trk-calc-price">{rub(price)}</b>
      </label>
      <input type="range" min={500} max={5000} step={100} value={price} onChange={(e) => setPrice(Number(e.target.value))} aria-label="Цена занятия" className="trk-range" />
      <div className="fr fb md"><span>Вы получаете</span><b className="tn">{rub(price)}</b></div>
      <div className="fr fb md"><span><span>Сервисный сбор 10%</span></span><b className="tn">{rub(student - price)}</b></div>
      <div className="fr fb trk-calc-total"><span>Ученик заплатит</span><b className="tn">{rub(student)}</b></div>
    </div>
  );
}

export default function TutorsLandingPage() {
  const { user } = useSession();
  const entryHref = user ? homeFor(user.role) : '/signup?role=tutor';
  const entryLabel = user?.role === 'tutor' ? 'Мой кабинет' : user ? 'Перейти в кабинет' : 'Создать анкету';
  const canReadRequests = user?.role === 'tutor' || user?.role === 'student';
  const features = useQuery('features', () => api.features());
  const tutors = useQuery('tutors-landing', () => api.listTutors({ limit: 6 }).then((p) => p.items));
  return (
    <PublicLayout>
      <section className="trh-hero" aria-labelledby="hero-title">
        <div className="trh-hero-text">
          <h1 id="hero-title" className="hero-h trh-hero-h">Найдите учеников для своих занятий</h1>
          <p className="trh-hero-lead">Опубликуйте анкету, назначьте цену и откройте удобные часы. Ученики смогут записаться через ваше расписание.</p>
          <div className="trh-hero-btns">
            <Button to={entryHref} size="lg" className="trh-cta">{entryLabel}</Button>
            <Button variant="line" size="lg" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}>Как всё устроено</Button>
          </div>
        </div>
        <div className="trh-hero-media">
          <img src={publicAssetPath('/images/for-repetitor-hero-1200.webp')} srcSet={publicAssetSrcSet('/images/for-repetitor-hero-640.webp 640w, /images/for-repetitor-hero-1200.webp 1200w')} sizes="(min-width:1440px) 640px, (min-width:761px) 46vw, calc(100vw - 32px)" alt="Репетиторы TopRepet" width={1200} height={900} fetchPriority="high" />
        </div>
      </section>

      <Section title="Как начать" className="trh-home-section trh-home-steps"><Steps items={TUTOR_STEPS} /></Section>

      <section id="pricing" className="trk-split trk-price" aria-labelledby="price-title">
        <div className="trh-sec" style={{ flex: '1 1 420px', minWidth: 0 }}>
          <h2 id="price-title" className="h2 trh-h2">Вы берёте столько, сколько напишете</h2>
          <p className="cap">{features.data?.pilotMode ? "Калькулятор показывает тариф после подключения оплаты." : "Ученик увидит вашу цену с сервисным сбором 10%. Вы получите сумму, указанную в анкете."}</p>
        </div>
        <div className="trk-calc-wrap"><PriceCalc /></div>
      </section>


      {canReadRequests && (
        <Panel>
          <div className="trk-split">
            <div className="trh-sec u-mw560">
              <h2 className="trh-panel-h">Заявки учеников</h2>
              <p className="muted">Смотрите, чего ищут ученики, и откликайтесь на подходящие заявки. Откликнуться можно после входа.</p>
            </div>
            <Button to="/requests" size="lg">Смотреть заявки</Button>
          </div>
        </Panel>
      )}

      <Section title={features.data?.pilotMode ? "Примеры анкет" : "Репетиторы TopRepet"} action={<IconButton icon="arrow" label="Все репетиторы" to="/teachers" />}><TutorShowcase query={tutors} /></Section>

      <Section title="Вопросы и ответы" reveal><Faq items={TUTOR_FAQ} /></Section>
    </PublicLayout>
  );
}
