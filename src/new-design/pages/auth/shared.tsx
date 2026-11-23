import { useState, type ReactNode } from 'react';
import { api } from '../../api';
import { Card, Note } from '../../ui';

/** Рамка форм входа и регистрации: карточка по центру. */
export function AuthCard({ children }: { children: ReactNode }) {
  return <Card className="trk-auth-card" pad="lg">{children}</Card>;
}

export const DEMO_ACCOUNTS = [
  { label: 'ученик', email: 'olga@mail.ru' },
  { label: 'репетитор', email: 'anastasia@toprepet.ru' },
  { label: 'администратор', email: 'admin@toprepet.ru' },
];

/** Быстрый вход в локальные демо-кабинеты без сервера. */
export function DemoHint({ onLogin, pending }: { onLogin: (email: string, password: string) => void; pending?: boolean }) {
  const [open] = useState(api.mode === 'mock');
  if (!open) return null;
  return (
    <Note tone="plain" icon="info">
      <span><b>Тестовый вход.</b> Откройте кабинет с демонстрационными данными — сервер не нужен.</span>
      <span className="trk-demo-list">
        {DEMO_ACCOUNTS.map((a) => <button key={a.email} type="button" className="trk-demo" disabled={pending} onClick={() => onLogin(a.email, 'demo')}>{pending ? 'Открываем…' : `Войти как ${a.label}`}</button>)}
      </span>
    </Note>
  );
}

export const emailValid = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());
