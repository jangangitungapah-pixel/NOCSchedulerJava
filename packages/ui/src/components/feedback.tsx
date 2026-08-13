import { type CSSProperties, type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { Button, type ButtonProps } from './button';

export type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export function Badge({
  children,
  className,
  variant = 'neutral',
}: Readonly<{
  children: ReactNode;
  className?: string;
  variant?: BadgeVariant;
}>) {
  return <span className={cn('ui-badge', `ui-badge--${variant}`, className)}>{children}</span>;
}

export function Skeleton({
  className,
  style,
}: Readonly<{
  className?: string;
  style?: CSSProperties;
}>) {
  return <div aria-hidden="true" className={cn('ui-skeleton', className)} style={style} />;
}

type StateAction = Readonly<{
  label: string;
  onClick: () => void;
  variant?: ButtonProps['variant'];
}>;

type StateProps = Readonly<{
  action?: StateAction;
  description: string;
  title: string;
}>;

function FeedbackState({ action, description, title }: StateProps) {
  return (
    <div className="ui-feedback-state">
      <h3 className="ui-feedback-state__title">{title}</h3>
      <p className="ui-feedback-state__description">{description}</p>
      {action ? (
        <Button onClick={action.onClick} variant={action.variant ?? 'secondary'}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState(props: StateProps) {
  return <FeedbackState {...props} />;
}

export function ErrorState(props: StateProps) {
  return <FeedbackState {...props} />;
}

export function LoadingState({
  description = 'Loading the latest information…',
  title = 'Loading',
}: Readonly<Partial<Pick<StateProps, 'description' | 'title'>>>) {
  return (
    <div className="ui-feedback-state" aria-live="polite">
      <h3 className="ui-feedback-state__title">{title}</h3>
      <p className="ui-feedback-state__description">{description}</p>
      <div style={{ display: 'grid', gap: '0.5rem', width: '100%' }}>
        <Skeleton style={{ height: '0.75rem', width: '62%' }} />
        <Skeleton style={{ height: '0.75rem', width: '82%' }} />
        <Skeleton style={{ height: '0.75rem', width: '48%' }} />
      </div>
    </div>
  );
}
