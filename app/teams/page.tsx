'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import Card from '../components/Card';
import Button from '../components/Button';
import { getCurrentUser, teams } from '../data';

const TeamsPage = () => {
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Teams</h1>
          <Button onClick={() => router.push('/teams/create')}>Create Team</Button>
        </div>

        {teams.length === 0 ? (
          <p className="text-gray-400">No teams available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <Card key={team.id} onClick={() => router.push(`/teams/${team.id}`)}>
                <h3 className="font-bold text-lg mb-2 text-white">{team.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{team.description}</p>
                <p className="text-sm text-gray-400">{team.city}, {team.country}</p>
                <p className="text-xs text-gray-500 mt-2">Created: {team.created}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
