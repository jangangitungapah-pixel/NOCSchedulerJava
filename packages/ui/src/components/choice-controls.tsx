import {
  Checkbox as CheckboxPrimitive,
  RadioGroup as RadioGroupPrimitive,
  Switch as SwitchPrimitive,
} from 'radix-ui';
import { CheckIcon } from 'lucide-react';
import { type ReactNode } from 'react';

export type CheckboxProps = Readonly<{
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange?: (checked: boolean) => void;
}>;

export function Checkbox({
  checked,
  defaultChecked,
  disabled,
  label,
  onCheckedChange,
}: CheckboxProps) {
  const rootProps = {
    ...(checked === undefined ? {} : { checked }),
    ...(defaultChecked === undefined ? {} : { defaultChecked }),
    ...(disabled === undefined ? {} : { disabled }),
    ...(onCheckedChange === undefined
      ? {}
      : {
          onCheckedChange: (value: boolean | 'indeterminate') => {
            onCheckedChange(value === true);
          },
        }),
  };

  return (
    <label className="ui-choice-row">
      <CheckboxPrimitive.Root className="ui-checkbox" {...rootProps}>
        <CheckboxPrimitive.Indicator>
          <CheckIcon size={14} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span>{label}</span>
    </label>
  );
}

export type RadioOption = Readonly<{
  label: string;
  value: string;
}>;

export type RadioGroupProps = Readonly<{
  ariaLabel: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: readonly RadioOption[];
  value?: string;
}>;

export function RadioGroup({
  ariaLabel,
  defaultValue,
  onValueChange,
  options,
  value,
}: RadioGroupProps) {
  const rootProps = {
    ...(defaultValue === undefined ? {} : { defaultValue }),
    ...(onValueChange === undefined ? {} : { onValueChange }),
    ...(value === undefined ? {} : { value }),
  };

  return (
    <RadioGroupPrimitive.Root aria-label={ariaLabel} className="ui-radio-group" {...rootProps}>
      {options.map((option) => (
        <label className="ui-choice-row" key={option.value}>
          <RadioGroupPrimitive.Item className="ui-radio" value={option.value}>
            <RadioGroupPrimitive.Indicator className="ui-radio__dot" />
          </RadioGroupPrimitive.Item>
          <span>{option.label}</span>
        </label>
      ))}
    </RadioGroupPrimitive.Root>
  );
}

export type SwitchProps = Readonly<{
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  label: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}>;

export function Switch({ checked, defaultChecked, disabled, label, onCheckedChange }: SwitchProps) {
  const rootProps = {
    ...(checked === undefined ? {} : { checked }),
    ...(defaultChecked === undefined ? {} : { defaultChecked }),
    ...(disabled === undefined ? {} : { disabled }),
    ...(onCheckedChange === undefined ? {} : { onCheckedChange }),
  };

  return (
    <label className="ui-choice-row">
      <SwitchPrimitive.Root className="ui-switch" {...rootProps}>
        <SwitchPrimitive.Thumb className="ui-switch__thumb" />
      </SwitchPrimitive.Root>
      <span>{label}</span>
    </label>
  );
}
