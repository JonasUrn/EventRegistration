'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import Card from '../components/Card';
import Button from '../components/Button';
import { authStorage } from '../lib/auth';
import { api } from '../lib/api';

const TeamsPage = () => {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchTeams = async () => {
      try {
        const data = await api.teams.getAll();
        setTeams(data);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [router]);

  if (!authStorage.isAuthenticated()) {
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

        {isLoading ? (
          <p className="text-gray-400">Loading teams...</p>
        ) : teams.length === 0 ? (
          <p className="text-gray-400">No teams available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <Card key={team.id_Komanda} onClick={() => router.push(`/teams/${team.id_Komanda}`)}>
                <h3 className="font-bold text-lg mb-2 text-white">{team.pavadinimas}</h3>
                <p className="text-sm text-gray-400 mb-2">{team.aprasymas || 'No description'}</p>
                <p className="text-sm text-gray-400">{team.miestas}, {team.salis}</p>
                <p className="text-xs text-gray-500 mt-2">Created: {team.sukurta}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
