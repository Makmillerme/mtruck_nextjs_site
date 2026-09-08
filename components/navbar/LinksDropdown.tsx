'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import type { SessionUser } from '@/utils/session';
import { useTranslations } from 'next-intl';
import { AccountTrigger } from './AccountTrigger';
import UserAccountSheet from './UserAccountSheet';
import UserProfileDropdown from './UserProfileDropdown';

function GuestDesktopMenu() {
  const t = useTranslations('Navbar');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AccountTrigger user={null} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44" align="end" sideOffset={8}>
        <DropdownMenuItem asChild>
          <Link href="/sign-in" className="w-full cursor-pointer">
            {t('login')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/sign-up" className="w-full cursor-pointer">
            {t('register')}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function LinksDropdown({
  initialUser,
}: {
  initialUser: SessionUser | null;
}) {
  const { data: session, isPending } = authClient.useSession();
  const user = isPending ? initialUser : session?.user ?? null;

  return (
    <>
      <div className="lg:hidden">
        <UserAccountSheet user={user} />
      </div>
      <div className="hidden lg:block">
        {user ? (
          <UserProfileDropdown initialUser={user} />
        ) : (
          <GuestDesktopMenu />
        )}
      </div>
    </>
  );
}
