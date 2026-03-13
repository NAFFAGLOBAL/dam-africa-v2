'use client';

import { useEffect, type ReactNode } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const setTheme = useUIStore((s) => s.setTheme);

  useEffect(() => {
    const saved = localStorage.getItem('dam_theme') as 'light' | 'dark' | 'system' | null;
    if (saved) {
      setTheme(saved);
    } else {
      setTheme('light');
    }
  }, [setTheme]);

  return <>{children}</>;
}
