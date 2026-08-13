import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';

const buttonVariants = cva('ui-button', {
  variants: {
    variant: {
      primary: 'ui-button--primary',
      secondary: 'ui-button--secondary',
      ghost: 'ui-button--ghost',
      tonal: 'ui-button--tonal',
      destructive: 'ui-button--destructive',
    },
    size: {
      sm: 'ui-button--sm',
      md: 'ui-button--md',
      lg: 'ui-button--lg',
      icon: 'ui-button--icon',
    },
  },
  defaultVariants: {
    variant: 'secondary',
    size: 'md',
  },
});

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantProps &
  Readonly<{
    loading?: boolean;
    loadingLabel?: string;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
  }>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled,
    leadingIcon,
    loading = false,
    loadingLabel = 'Loading',
    size,
    trailingIcon,
    type = 'button',
    variant,
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      className={cn(buttonVariants({ size, variant }), className)}
      data-loading={loading ? 'true' : 'false'}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <span aria-hidden="true" className="ui-button__spinner" /> : leadingIcon}
      <span>{loading ? loadingLabel : children}</span>
      {!loading ? trailingIcon : null}
    </button>
  );
});

export type IconButtonProps = Omit<ButtonProps, 'children' | 'size'> &
  Readonly<{
    'aria-label': string;
    icon: ReactNode;
  }>;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, ...props },
  ref,
) {
  return (
    <Button {...props} ref={ref} size="icon">
      <span aria-hidden="true">{icon}</span>
    </Button>
  );
});
