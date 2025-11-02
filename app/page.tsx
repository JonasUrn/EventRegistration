'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCurrentUser } from './data';
import Navigation from './components/Navigation';
import Card from './components/Card';

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
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome, {currentUser.name}!</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card onClick={() => router.push('/account')}>
            <h2 className="text-xl font-bold mb-2">Account</h2>
            <p>Manage your profile and settings</p>
          </Card>

          <Card onClick={() => router.push('/teams')}>
            <h2 className="text-xl font-bold mb-2">Teams</h2>
            <p>View and manage your teams</p>
          </Card>

          <Card onClick={() => router.push('/games')}>
            <h2 className="text-xl font-bold mb-2">Games</h2>
            <p>Browse upcoming games</p>
          </Card>

          <Card onClick={() => router.push('/tournaments')}>
            <h2 className="text-xl font-bold mb-2">Tournaments</h2>
            <p>View and join tournaments</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
