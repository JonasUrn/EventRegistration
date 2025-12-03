'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authStorage } from '../lib/auth';
import { api } from '../lib/api';
import Button from './Button';
import styles from './Navigation.module.css';

const Navigation = () => {
  const router = useRouter();
  const currentUser = authStorage.getCurrentUser();

  const handleLogout = () => {
    api.auth.logout();
    router.push('/login');
  };

  if (!authStorage.isAuthenticated()) {
    return null;
  }

  return (
    <nav className={styles.navigation}>
      <div className={styles.container}>
        <div className={styles.navContent}>
          <Link href="/" className={styles.logo}>
            Game Portal
          </Link>

          <div className={styles.navLinks}>
            <Link href="/account" className={styles.navLink}>
              Account
            </Link>
            <Link href="/teams" className={styles.navLink}>
              Teams
            </Link>
            <Link href="/games" className={styles.navLink}>
              Games
            </Link>
            <Link href="/tournaments" className={styles.navLink}>
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
