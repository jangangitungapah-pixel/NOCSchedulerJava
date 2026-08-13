import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '../app/theme-provider';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  it('switches between light and dark theme state', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggle = screen.getByRole('button', {
      name: 'Switch to dark theme',
    });

    expect(document.documentElement).not.toHaveClass('dark');

    await user.click(toggle);

    expect(document.documentElement).toHaveClass('dark');
    expect(
      screen.getByRole('button', {
        name: 'Switch to light theme',
      }),
    ).toBeInTheDocument();
  });
});
