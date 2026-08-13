import { Select as SelectPrimitive } from 'radix-ui';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';

import { cn } from '../lib/cn';

export type SelectOption = Readonly<{
  disabled?: boolean;
  label: string;
  value: string;
}>;

export type SelectProps = Readonly<{
  ariaLabel: string;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  value?: string;
}>;

export function Select({
  ariaLabel,
  className,
  defaultValue,
  disabled,
  onValueChange,
  options,
  placeholder = 'Select an option',
  value,
}: SelectProps) {
  const rootProps = {
    ...(defaultValue === undefined ? {} : { defaultValue }),
    ...(onValueChange === undefined ? {} : { onValueChange }),
    ...(value === undefined ? {} : { value }),
    ...(disabled === undefined ? {} : { disabled }),
  };

  return (
    <SelectPrimitive.Root {...rootProps}>
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn('ui-select-trigger', className)}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon aria-hidden="true">
          <ChevronDownIcon size={16} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="ui-select-content" position="popper" sideOffset={6}>
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                className="ui-select-item"
                disabled={option.disabled ?? false}
                key={option.value}
                value={option.value}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <CheckIcon size={14} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
