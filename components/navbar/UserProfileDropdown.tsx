'use client';

import { Link, useRouter } from '@/i18n/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LuLogOut, LuSettings } from 'react-icons/lu';
import { authClient } from '@/lib/auth-client';
import type { SessionUser } from '@/utils/session';
import { useTranslations } from 'next-intl';
import { AccountTrigger, isClientAdmin } from './AccountTrigger';
import { ThemeMenuItems } from './ThemeMenuItems';

export default function UserProfileDropdown({
  initialUser,
}: {
  initialUser: SessionUser;
}) {
  const tNav = useTranslations('Navbar');
  const tLinks = useTranslations('NavLinks');
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const user = session?.user ?? initialUser;
  const isAdmin = isClientAdmin(user?.email);
  const name = user?.name || 'User';
  const email = user?.email || '';

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <AccountTrigger user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        {isAdmin ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/sales" className="cursor-pointer">
                {tLinks('admin')}
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          {tNav('theme')}
        </DropdownMenuLabel>
        <ThemeMenuItems />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/user-profile" className="flex cursor-pointer items-center">
            <LuSettings className="mr-2 h-4 w-4" />
            {tNav('manageAccount')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LuLogOut className="mr-2 h-4 w-4" />
          {tNav('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
