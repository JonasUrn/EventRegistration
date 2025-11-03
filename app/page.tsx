'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCurrentUser } from './data';
import Navigation from './components/Navigation';
import Card from './components/Card';
import styles from './layout.module.css';

const Home = () => {
  const router = useRouter();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className={styles.pageContainer}>
      <Navigation />

      <div className={styles.pageContent}>
        <h1 className={styles.pageTitle}>Welcome, {currentUser.name}!</h1>

        <div className={styles.dashboardGrid}>
          <Card onClick={() => router.push('/account')}>
            <div className={styles.dashboardCard}>
              <h2>Account</h2>
              <p>Manage your profile and settings</p>
            </div>
          </Card>

          <Card onClick={() => router.push('/teams')}>
            <div className={styles.dashboardCard}>
              <h2>Teams</h2>
              <p>View and manage your teams</p>
            </div>
          </Card>

          <Card onClick={() => router.push('/games')}>
            <div className={styles.dashboardCard}>
              <h2>Games</h2>
              <p>Browse upcoming games</p>
            </div>
          </Card>

          <Card onClick={() => router.push('/tournaments')}>
            <div className={styles.dashboardCard}>
              <h2>Tournaments</h2>
              <p>View and join tournaments</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
