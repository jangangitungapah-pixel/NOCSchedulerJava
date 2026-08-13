import {
  BellIcon,
  CalendarDaysIcon,
  HomeIcon,
  IconButton,
  MoreHorizontalIcon,
  Sheet,
  UserRoundIcon,
  UsersIcon,
  WalletCardsIcon,
} from '@nocscheduler/ui';
import { Link, Outlet, useLocation } from 'react-router';

import { ThemeToggle } from '../components/theme-toggle';

const navigation = [
  { label: 'Home', icon: HomeIcon, href: '/' },
  { label: 'Schedule', icon: CalendarDaysIcon },
  { label: 'Team', icon: UsersIcon },
  { label: 'Payroll', icon: WalletCardsIcon },
] as const;

function Brand({ compact = false }: Readonly<{ compact?: boolean }>) {
  return (
    <Link aria-label="NOCScheduler home" className="app-shell__brand" to="/">
      <span aria-hidden="true" className="app-shell__brand-mark">
        NS
      </span>
      {!compact ? <span className="app-shell__brand-copy">NOCScheduler</span> : null}
    </Link>
  );
}

function NavigationList() {
  const location = useLocation();

  return (
    <ul className="app-shell__nav-list">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = item.href ? location.pathname === item.href : false;

        return (
          <li key={item.label}>
            {item.href ? (
              <Link
                className="app-shell__nav-link"
                data-active={active ? 'true' : 'false'}
                to={item.href}
              >
                <span className="app-shell__nav-icon">
                  <Icon size={18} />
                </span>
                <span className="app-shell__nav-label">{item.label}</span>
              </Link>
            ) : (
              <button
                className="app-shell__nav-link"
                disabled
                title={`${item.label} is introduced in a later product phase`}
                type="button"
              >
                <span className="app-shell__nav-icon">
                  <Icon size={18} />
                </span>
                <span className="app-shell__nav-label">{item.label}</span>
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function MoreNavigation() {
  return (
    <Sheet
      description="Navigation entries that become active as later product phases are implemented."
      side="bottom"
      title="More"
      trigger={
        <button className="app-shell__mobile-nav-item" type="button">
          <MoreHorizontalIcon size={20} />
          <span>More</span>
        </button>
      }
    >
      <div className="app-shell__sheet-nav">
        <NavigationList />
        {import.meta.env.DEV ? (
          <Link className="app-shell__nav-link" to="/__design-system">
            Design system QA
          </Link>
        ) : null}
      </div>
    </Sheet>
  );
}

export function AppShell() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside aria-label="Primary navigation" className="app-shell__sidebar">
        <div className="app-shell__sidebar-brand">
          <Brand />
        </div>
        <NavigationList />
      </aside>

      <div className="app-shell__main-column">
        <header className="app-shell__topbar">
          <Brand />

          <div className="app-shell__utility">
            <ThemeToggle />
            <IconButton
              aria-label="Notifications are introduced in a later phase"
              disabled
              icon={<BellIcon size={18} />}
              variant="ghost"
            />
            <div className="app-shell__account">
              <UserRoundIcon aria-hidden="true" size={18} />
              <div className="app-shell__account-copy">
                <span className="app-shell__account-name">Foundation QA</span>
                <span className="app-shell__account-role">Local environment</span>
              </div>
            </div>
          </div>
        </header>

        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>

      <nav aria-label="Mobile navigation" className="app-shell__mobile-nav">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.href ? location.pathname === item.href : false;

          return item.href ? (
            <Link
              className="app-shell__mobile-nav-item"
              data-active={active ? 'true' : 'false'}
              key={item.label}
              to={item.href}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          ) : (
            <button className="app-shell__mobile-nav-item" disabled key={item.label} type="button">
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <MoreNavigation />
      </nav>
    </div>
  );
}
