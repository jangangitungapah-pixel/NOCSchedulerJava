import { type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';

export type SurfaceProps = HTMLAttributes<HTMLDivElement> &
  Readonly<{
    elevation?: 'base' | 'raised' | 'sunken';
  }>;

export function Surface({ className, elevation = 'base', ...props }: SurfaceProps) {
  return (
    <div
      {...props}
      className={cn(
        'ui-surface',
        elevation === 'raised' && 'ui-surface--raised',
        elevation === 'sunken' && 'ui-surface--sunken',
        className,
      )}
    />
  );
}

export type CardProps = SurfaceProps &
  Readonly<{
    interactive?: boolean;
  }>;

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <Surface
      {...props}
      className={cn('ui-card', interactive && 'ui-card--interactive', className)}
    />
  );
}

export function PageShell({
  children,
  width = 'default',
}: Readonly<{
  children: ReactNode;
  width?: 'default' | 'narrow' | 'workspace';
}>) {
  return (
    <div className="ui-page-shell" data-width={width}>
      {children}
    </div>
  );
}

export function PageHeader({
  actions,
  description,
  eyebrow,
  title,
}: Readonly<{
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}>) {
  return (
    <header className="ui-page-header">
      <div className="ui-page-header__content">
        {eyebrow ? <p className="ui-page-header__eyebrow">{eyebrow}</p> : null}
        <h1 className="ui-page-header__title">{title}</h1>
        {description ? <p className="ui-page-header__description">{description}</p> : null}
      </div>
      {actions ? <div className="ui-page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function SectionHeader({
  actions,
  description,
  title,
}: Readonly<{
  actions?: ReactNode;
  description?: string;
  title: string;
}>) {
  return (
    <header className="ui-section-header">
      <div className="ui-section-header__content">
        <h2 className="ui-section-header__title">{title}</h2>
        {description ? <p className="ui-section-header__description">{description}</p> : null}
      </div>
      {actions}
    </header>
  );
}

export function Toolbar({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn('ui-toolbar', className)}>
      {children}
    </div>
  );
}
