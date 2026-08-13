import { useTheme } from '../app/theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <button
      className="app-surface border-app focus-ring rounded-md border px-3 py-1.5 text-sm font-medium"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
    >
      {theme === 'light' ? 'Dark' : 'Light'} mode
    </button>
  );
}
