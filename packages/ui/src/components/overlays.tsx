import {
  Dialog as DialogPrimitive,
  DropdownMenu as DropdownMenuPrimitive,
  Popover as PopoverPrimitive,
  Tooltip as TooltipPrimitive,
} from 'radix-ui';
import { MoreHorizontalIcon, XIcon } from 'lucide-react';
import { type ReactNode } from 'react';

import { Button, IconButton } from './button';

export type TooltipProps = Readonly<{
  children: ReactNode;
  content: ReactNode;
}>;

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={350}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="ui-tooltip-content" sideOffset={6}>
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export type PopoverProps = Readonly<{
  children: ReactNode;
  content: ReactNode;
}>;

export function Popover({ children, content }: PopoverProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="start" className="ui-popover-content" sideOffset={6}>
          {content}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export type DropdownItem = Readonly<{
  danger?: boolean;
  disabled?: boolean;
  label: string;
  onSelect?: () => void;
  separatorBefore?: boolean;
}>;

export type DropdownMenuProps = Readonly<{
  ariaLabel?: string;
  items: readonly DropdownItem[];
  trigger?: ReactNode;
}>;

export function DropdownMenu({ ariaLabel = 'Open actions', items, trigger }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger ?? (
          <IconButton
            aria-label={ariaLabel}
            icon={<MoreHorizontalIcon size={18} />}
            variant="ghost"
          />
        )}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content align="end" className="ui-dropdown-content" sideOffset={6}>
          {items.map((item) => (
            <div key={item.label}>
              {item.separatorBefore ? (
                <DropdownMenuPrimitive.Separator className="ui-dropdown-separator" />
              ) : null}
              <DropdownMenuPrimitive.Item
                className="ui-dropdown-item"
                data-danger={item.danger ? 'true' : 'false'}
                disabled={item.disabled ?? false}
                {...(item.onSelect === undefined ? {} : { onSelect: item.onSelect })}
              >
                {item.label}
              </DropdownMenuPrimitive.Item>
            </div>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

export type DialogProps = Readonly<{
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  title: string;
  trigger: ReactNode;
}>;

export function Dialog({ children, description, footer, title, trigger }: DialogProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="ui-dialog-overlay" />
        <DialogPrimitive.Content className="ui-dialog-content">
          <div style={{ paddingRight: '2.5rem' }}>
            <DialogPrimitive.Title className="ui-dialog-title">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="ui-dialog-description">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close asChild>
            <IconButton
              aria-label="Close dialog"
              icon={<XIcon size={18} />}
              style={{ position: 'absolute', right: '1rem', top: '1rem' }}
              variant="ghost"
            />
          </DialogPrimitive.Close>
          <div style={{ marginTop: '1.25rem' }}>{children}</div>
          {footer ? <div className="ui-dialog-actions">{footer}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export type SheetProps = Readonly<{
  children: ReactNode;
  description?: string;
  side?: 'right' | 'bottom';
  title: string;
  trigger: ReactNode;
}>;

export function Sheet({ children, description, side = 'right', title, trigger }: SheetProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="ui-dialog-overlay" />
        <DialogPrimitive.Content className="ui-sheet-content" data-side={side}>
          <DialogPrimitive.Title className="ui-dialog-title">{title}</DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="ui-dialog-description">
              {description}
            </DialogPrimitive.Description>
          ) : null}
          <DialogPrimitive.Close asChild>
            <IconButton
              aria-label="Close sheet"
              icon={<XIcon size={18} />}
              style={{ position: 'absolute', right: '1rem', top: '1rem' }}
              variant="ghost"
            />
          </DialogPrimitive.Close>
          <div style={{ marginTop: '1.25rem' }}>{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function DialogCloseButton({ children = 'Close' }: Readonly<{ children?: ReactNode }>) {
  return (
    <DialogPrimitive.Close asChild>
      <Button variant="secondary">{children}</Button>
    </DialogPrimitive.Close>
  );
}
