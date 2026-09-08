'use client';

import { useToast } from '../ui/use-toast';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

function SignOutLink() {
  const { toast } = useToast();
  const handleLogout = async () => {
    await authClient.signOut();
    toast({ description: 'Logout Successful' });
  };
  return (
    <Link href="/" className="w-full text-left" onClick={handleLogout}>
      Logout
    </Link>
  );
}
export default SignOutLink;
