'use client';

import * as React from 'react';
import { useTheme } from '@teispace/next-themes';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';

export function ThemeMenuItems() {
  const { setTheme } = useTheme();
  const t = useTranslations('Navbar');

  return (
    <>
      <DropdownMenuItem onClick={() => setTheme('light')}>
        {t('light')}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme('dark')}>
        {t('dark')}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme('system')}>
        {t('system')}
      </DropdownMenuItem>
    </>
  );
}
