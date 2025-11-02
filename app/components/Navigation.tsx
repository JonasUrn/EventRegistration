'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, setCurrentUser } from '../data';
import Button from './Button';

const Navigation = () => {
  const router = useRouter();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/login');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <nav className="border-b border-black bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Game Portal
          </Link>

          <div className="flex gap-4 items-center">
            <Link href="/account" className="hover:underline">
              Account
            </Link>
            <Link href="/teams" className="hover:underline">
              Teams
            </Link>
            <Link href="/games" className="hover:underline">
              Games
            </Link>
            <Link href="/tournaments" className="hover:underline">
              Tournaments
            </Link>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
