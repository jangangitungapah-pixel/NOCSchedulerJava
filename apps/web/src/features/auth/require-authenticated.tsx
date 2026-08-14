import { Button, Card, ErrorState, LoadingState } from '@nocscheduler/ui';
import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from './auth-provider';

export function RequireAuthenticated() {
  const location = useLocation();
  const { state, refreshAccess, signOutCurrentUser } = useAuth();

  if (state.status === 'loading') {
    return (
      <div className="auth-layout">
        <LoadingState
          description="Memastikan akun dan role masih aktif."
          title="Memeriksa akses…"
        />
      </div>
    );
  }

  if (state.status === 'signed-out') {
    const next = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);

    return <Navigate replace to={`/login?next=${next}`} />;
  }

  if (state.status === 'denied') {
    return (
      <div className="auth-layout">
        <Card className="auth-card">
          <ErrorState
            description="Akun Firebase ini tidak memiliki record akses aktif yang valid."
            title="Akses ditolak"
          />
          <div className="auth-actions">
            <Button
              onClick={() => {
                void refreshAccess();
              }}
              variant="secondary"
            >
              Periksa ulang akses
            </Button>
            <Button
              onClick={() => {
                void signOutCurrentUser();
              }}
              variant="ghost"
            >
              Keluar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="auth-layout">
        <Card className="auth-card">
          <ErrorState
            description="Status akses tidak dapat diverifikasi. Sistem gagal tertutup dan tidak membuka aplikasi."
            title="Tidak dapat memverifikasi akses"
          />
          <Button
            onClick={() => {
              void refreshAccess();
            }}
            variant="secondary"
          >
            Coba lagi
          </Button>
        </Card>
      </div>
    );
  }

  return <Outlet />;
}
