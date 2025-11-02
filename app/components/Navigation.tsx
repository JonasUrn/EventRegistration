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
    <nav className="bg-gray-900 shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300 transition-colors">
            Game Portal
          </Link>

          <div className="flex gap-8 items-center">
            <Link href="/account" className="text-gray-300 hover:text-white transition-all hover:scale-110">
              Account
            </Link>
            <Link href="/teams" className="text-gray-300 hover:text-white transition-all hover:scale-110">
              Teams
            </Link>
            <Link href="/games" className="text-gray-300 hover:text-white transition-all hover:scale-110">
              Games
            </Link>
            <Link href="/tournaments" className="text-gray-300 hover:text-white transition-all hover:scale-110">
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
