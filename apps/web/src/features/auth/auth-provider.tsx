import { can } from '@nocscheduler/domain';
import type {
  AuthorizationPrincipal,
  PermissionCode,
  PermissionScope,
} from '@nocscheduler/contracts';
import {
  browserSessionPersistence,
  onIdTokenChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { getFirebaseClientServices } from '../../lib/firebase/client';
import { resolveAccessForUid } from './access-repository';
import { authErrorMessage } from './auth-errors';

export type AuthState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'signed-out' }>
  | Readonly<{
      status: 'denied';
      user: User;
    }>
  | Readonly<{
      status: 'error';
      user: User | null;
    }>
  | Readonly<{
      status: 'authenticated';
      user: User;
      principal: AuthorizationPrincipal;
    }>;

type AuthContextValue = Readonly<{
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signOutCurrentUser: () => Promise<void>;
  refreshAccess: () => Promise<void>;
  can: (permission: PermissionCode, scope?: PermissionScope) => boolean;
}>;

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = Readonly<{
  children: ReactNode;
}>;

export function AuthProvider({ children }: AuthProviderProps) {
  const { auth, firestore } = getFirebaseClientServices();
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  const generationRef = useRef(0);

  const hydrateUser = useCallback(
    async (user: User | null) => {
      const generation = ++generationRef.current;

      if (user === null) {
        setState({ status: 'signed-out' });
        return;
      }

      try {
        const resolution = await resolveAccessForUid(firestore, user.uid);

        if (generation !== generationRef.current) {
          return;
        }

        if (resolution.status === 'denied') {
          setState({
            status: 'denied',
            user,
          });
          return;
        }

        setState({
          status: 'authenticated',
          user,
          principal: resolution.principal,
        });
      } catch {
        if (generation === generationRef.current) {
          setState({
            status: 'error',
            user,
          });
        }
      }
    },
    [firestore],
  );

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (user) => {
      void hydrateUser(user);
    });

    return unsubscribe;
  }, [auth, hydrateUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setState({ status: 'loading' });

      try {
        await setPersistence(auth, browserSessionPersistence);
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch (error) {
        setState({ status: 'signed-out' });
        throw new Error(authErrorMessage(error));
      }
    },
    [auth],
  );

  const signOutCurrentUser = useCallback(async () => {
    ++generationRef.current;
    await signOut(auth);
    setState({ status: 'signed-out' });
  }, [auth]);

  const refreshAccess = useCallback(async () => {
    setState({ status: 'loading' });
    await hydrateUser(auth.currentUser);
  }, [auth, hydrateUser]);

  const canCurrentUser = useCallback(
    (permission: PermissionCode, scope: PermissionScope = 'SELF') =>
      state.status === 'authenticated' && can(state.principal, permission, scope),
    [state],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      signIn,
      signOutCurrentUser,
      refreshAccess,
      can: canCurrentUser,
    }),
    [canCurrentUser, refreshAccess, signIn, signOutCurrentUser, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}

export function useAuthenticatedSession() {
  const { state } = useAuth();

  if (state.status !== 'authenticated') {
    throw new Error('Authenticated session requested outside a protected route.');
  }

  return state;
}
