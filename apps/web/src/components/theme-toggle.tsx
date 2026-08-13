import { IconButton, MoonIcon, SunIcon, Tooltip } from '@nocscheduler/ui';

import { useTheme } from '../app/theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : 'light';
  const label = `Switch to ${nextTheme} theme`;

  return (
    <Tooltip content={label}>
      <IconButton
        aria-label={label}
        icon={theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
        onClick={toggleTheme}
        variant="ghost"
      />
    </Tooltip>
  );
}
