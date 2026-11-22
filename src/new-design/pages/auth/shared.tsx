import { type ReactNode } from 'react';
import { Card } from '../../ui';
import { homeFor } from '../../api/session';
import type { User } from '../../api/types';
import { safeNext } from '../../lib/safeNext';

/** Рамка форм входа и регистрации: карточка по центру. */
export function AuthCard({ children }: { children: ReactNode }) {
  return <Card className="trk-auth-card" pad="lg">{children}</Card>;
}

export const emailValid = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

export const afterRegistration = (user: Pick<User, 'role' | 'onboarded'>, next?: string | null) => {
  if (!user.onboarded && user.role === 'tutor') return '/tutor/profile/edit';
  const destination = safeNext(next, '');
  if (!user.onboarded && user.role === 'student') return '/onboarding' + (destination && !destination.startsWith('/onboarding') ? `?next=${encodeURIComponent(destination)}` : '');
  return destination || homeFor(user.role);
};
