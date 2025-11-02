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
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-12 text-white">Welcome, {currentUser.name}! 👋</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card onClick={() => router.push('/account')}>
            <h2 className="text-xl font-bold mb-2 text-white">Account</h2>
            <p className="text-gray-400">Manage your profile and settings</p>
          </Card>

          <Card onClick={() => router.push('/teams')}>
            <h2 className="text-xl font-bold mb-2 text-white">Teams</h2>
            <p className="text-gray-400">View and manage your teams</p>
          </Card>

          <Card onClick={() => router.push('/games')}>
            <h2 className="text-xl font-bold mb-2 text-white">Games</h2>
            <p className="text-gray-400">Browse upcoming games</p>
          </Card>

          <Card onClick={() => router.push('/tournaments')}>
            <h2 className="text-xl font-bold mb-2 text-white">Tournaments</h2>
            <p className="text-gray-400">View and join tournaments</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
