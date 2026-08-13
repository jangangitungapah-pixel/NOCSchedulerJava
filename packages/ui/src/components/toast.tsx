import { Toaster as SonnerToaster, toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      closeButton
      position="bottom-right"
      richColors
      toastOptions={{
        style: {
          background: 'var(--ui-surface-overlay)',
          border: '1px solid var(--ui-border-default)',
          color: 'var(--ui-text-primary)',
        },
      }}
    />
  );
}

export { toast };
