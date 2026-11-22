import { useState, type SyntheticEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { trackGoal } from '../../../shared/lib/analytics';
import { useMutation } from '../../api/hooks';
import { needsEmailVerification, useSession } from '../../api/session';
import { AuthLayout } from '../../layout/layouts';
import { safeNext } from '../../lib/safeNext';
import { Button, Divider, FormError, PageHeader, PasswordField, TextField } from '../../ui';
import { afterRegistration, AuthCard, emailValid } from './shared';

/** Вход: почта и пароль или Яндекс ID. После входа возвращает туда, откуда пришли (?next=). */
export default function LoginPage() {
  const [params] = useSearchParams();
  const { user, setUser } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const next = safeNext(params.get('next'), '');
  const query = next ? '?next=' + encodeURIComponent(next) : '';
  const login = useMutation((e: string, p: string) => api.login(e, p));
  const yandex = useMutation(() => api.loginWithYandex());

  if (user) return <Navigate to={needsEmailVerification(user) ? '/verify-email' + query : afterRegistration(user, next)} replace />;

  const finish = (u: Awaited<ReturnType<typeof api.login>> | undefined) => {
    if (!u) return;
    setUser(u);
    trackGoal('login_submit', { role: u.role });
  };

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const found = { email: emailValid(email) ? undefined : 'Введите почту, например name@mail.ru', password: password ? undefined : 'Введите пароль' };
    setErrors(found);
    if (found.email || found.password) return;
    finish(await login.run(email.trim(), password));
  };

  return (
    <AuthLayout>
      <PageHeader title="Вход" center />
      <AuthCard>
        <form className="trk-form" onSubmit={submit} noValidate>
          <TextField label="Почта" type="email" name="email" autoComplete="username" inputMode="email" placeholder="name@mail.ru" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
          <PasswordField label="Пароль" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} labelAction={<Link className="acc sm" to="/reset-password">Забыли пароль?</Link>} />
          <FormError error={login.error ?? yandex.error} />
          <Button type="submit" size="lg" block loading={login.pending}>Войти</Button>
        </form>
        <Divider>или</Divider>
        <Button variant="line" size="lg" block icon="user" loading={yandex.pending} onClick={async () => finish(await yandex.run())}>Войти через Яндекс ID</Button>
        <p className="muted trk-auth-foot">Нет аккаунта? <Link className="acc" to={`/signup${query}`}>Зарегистрироваться</Link></p>
      </AuthCard>
    </AuthLayout>
  );
}
