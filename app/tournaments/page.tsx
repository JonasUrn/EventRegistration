'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import Card from '../components/Card';
import Button from '../components/Button';
import { authStorage } from '../lib/auth';
import { api } from '../lib/api';

const TournamentsPage = () => {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchTournaments = async () => {
      try {
        const data = await api.tournaments.getAll();
        setTournaments(data);
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, [router]);

  if (!authStorage.isAuthenticated()) {
    return null;
  }

  const currentUser = authStorage.getCurrentUser();
  const canCreateTournament = currentUser?.organizatorius || currentUser?.administratorius;

  const sortedTournaments = [...tournaments].sort((a, b) =>
    new Date(a.pradzia).getTime() - new Date(b.pradzia).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Tournaments</h1>
          {canCreateTournament && (
            <Button onClick={() => router.push('/tournaments/create')}>
              Create Tournament
            </Button>
          )}
        </div>

        {isLoading ? (
          <p className="text-gray-400">Loading tournaments...</p>
        ) : sortedTournaments.length === 0 ? (
          <p className="text-gray-400">No tournaments available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedTournaments.map(tournament => (
              <Card key={tournament.id_Turnyras} onClick={() => router.push(`/tournaments/${tournament.id_Turnyras}`)}>
                <h3 className="font-bold text-lg mb-2 text-white">{tournament.pavadinimas}</h3>
                <p className="text-sm text-gray-400 mb-2">{tournament.aprasas}</p>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Sport:</span>
                  <span className="text-gray-400">{tournament.sporto_saka}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Format:</span>
                  <span className="capitalize text-gray-400">{tournament.turnyro_formatas}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Participants:</span>
                  <span className="text-gray-400">{tournament.minimalus_nariu_skacius} - {tournament.maksimalus_nariu_skaicius}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dates:</span>
                  <span className="text-gray-400">{tournament.pradzia} to {tournament.pabaiga}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsPage;
