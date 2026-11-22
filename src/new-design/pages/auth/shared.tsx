import { type ReactNode } from 'react';
import { Card } from '../../ui';

/** Рамка форм входа и регистрации: карточка по центру. */
export function AuthCard({ children }: { children: ReactNode }) {
  return <Card className="trk-auth-card" pad="lg">{children}</Card>;
}

export const emailValid = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());
