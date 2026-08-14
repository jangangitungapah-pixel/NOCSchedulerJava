import { Button, Card, FormField, Input, LoadingState } from '@nocscheduler/ui';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from './auth-provider';

function safeNextPath(search: string): string {
  const requested = new URLSearchParams(search).get('next');

  if (requested === null || !requested.startsWith('/') || requested.startsWith('//')) {
    return '/';
  }

  return requested;
}

export function LoginPage() {
  const location = useLocation();
  const { state, signIn, signOutCurrentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (state.status === 'authenticated') {
    return <Navigate replace to={safeNextPath(location.search)} />;
  }

  if (state.status === 'loading') {
    return (
      <div className="auth-layout">
        <LoadingState
          description="Menyiapkan identitas dan status akses internal."
          title="Memeriksa sesi…"
        />
      </div>
    );
  }

  if (state.status === 'denied') {
    return (
      <div className="auth-layout">
        <Card className="auth-card">
          <div className="auth-brand">
            <span aria-hidden="true" className="auth-brand__mark">
              NS
            </span>
            <div>
              <p className="auth-brand__eyebrow">NOCScheduler</p>
              <h1 className="auth-title">Akses aplikasi belum aktif</h1>
            </div>
          </div>
          <p className="auth-description">
            Identitas Firebase berhasil dikenali, tetapi akun ini belum memiliki akses aplikasi
            aktif. Hubungi administrator internal.
          </p>
          <Button
            onClick={() => {
              void signOutCurrentUser();
            }}
            variant="secondary"
          >
            Kembali ke login
          </Button>
        </Card>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login gagal.');
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <Card className="auth-card">
        <div className="auth-brand">
          <span aria-hidden="true" className="auth-brand__mark">
            NS
          </span>
          <div>
            <p className="auth-brand__eyebrow">Internal NOC Operations</p>
            <h1 className="auth-title">Masuk ke NOCScheduler</h1>
          </div>
        </div>

        <p className="auth-description">
          Gunakan akun internal yang sudah dibuat dan diaktifkan oleh administrator.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <FormField htmlFor="login-email" label="Email">
            <Input
              autoComplete="username"
              id="login-email"
              inputMode="email"
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
              type="email"
              value={email}
            />
          </FormField>

          <FormField htmlFor="login-password" label="Password">
            <Input
              autoComplete="current-password"
              id="login-password"
              minLength={1}
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
              type="password"
              value={password}
            />
          </FormField>

          {error !== null ? (
            <p aria-live="polite" className="auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <Button loading={submitting} loadingLabel="Masuk…" type="submit" variant="primary">
            Masuk
          </Button>
        </form>

        <p className="auth-footnote">
          Tidak ada pendaftaran publik. Akses aplikasi ditentukan oleh Firebase Authentication dan
          record akses Firestore yang dikelola operator.
        </p>
      </Card>
    </div>
  );
}
