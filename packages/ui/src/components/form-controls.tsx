import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

import { cn } from '../lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input {...props} ref={ref} className={cn('ui-input', className)} />;
  },
);

export const DateInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function DateInput(props, ref) {
    return <Input {...props} ref={ref} type="date" />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea {...props} ref={ref} className={cn('ui-textarea', className)} />;
});

export type FormFieldProps = Readonly<{
  children: ReactNode;
  error?: string;
  helperText?: string;
  htmlFor?: string;
  label: string;
  required?: boolean;
}>;

export function FormField({
  children,
  error,
  helperText,
  htmlFor,
  label,
  required = false,
}: FormFieldProps) {
  const labelContent = (
    <>
      <span>{label}</span>
      {required ? (
        <span aria-label="required" className="ui-field__required">
          *
        </span>
      ) : null}
    </>
  );

  return (
    <div className="ui-field">
      {htmlFor ? (
        <label className="ui-field__label" htmlFor={htmlFor}>
          {labelContent}
        </label>
      ) : (
        <div className="ui-field__label">{labelContent}</div>
      )}
      {children}
      {error ? (
        <p className="ui-field__error" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="ui-field__helper">{helperText}</p>
      ) : null}
    </div>
  );
}

export type ComboboxOption = Readonly<{
  label: string;
  value: string;
}>;

export type ComboboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'list'> &
  Readonly<{
    options: readonly ComboboxOption[];
  }>;

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  { className, id, options, ...props },
  ref,
) {
  const fallbackId = useId();
  const inputId = id ?? `combobox-${fallbackId}`;
  const listId = `${inputId}-options`;

  return (
    <>
      <input
        {...props}
        ref={ref}
        className={cn('ui-combobox', className)}
        id={inputId}
        list={listId}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </datalist>
    </>
  );
});
