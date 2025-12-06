'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import Card from '../components/Card';
import { authStorage } from '../lib/auth';
import { api } from '../lib/api';

const GamesPage = () => {
  const router = useRouter();
  const [games, setGames] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [gamesData, tournamentsData] = await Promise.all([
          api.games.getAll(),
          api.tournaments.getAll()
        ]);
        setGames(gamesData);
        setTournaments(tournamentsData);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (!authStorage.isAuthenticated()) {
    return null;
  }

  const sortedGames = [...games].sort((a, b) =>
    new Date(a.pradžia).getTime() - new Date(b.pradžia).getTime()
  );

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-white">Upcoming Games</h1>

        {isLoading ? (
          <p className="text-gray-400">Loading games...</p>
        ) : sortedGames.length === 0 ? (
          <p className="text-gray-400">No games available.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedGames.map(game => {
              const tournament = tournaments.find(t => t.id_Turnyras === game.fk_Turnyrasid_Turnyras);
              return (
                <Card key={game.id_Varzybos} onClick={() => router.push(`/games/${game.id_Varzybos}`)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-white">{game.pavadinimas}</h3>
                      <p className="text-sm text-gray-400 mb-1">
                        Tournament: {tournament?.pavadinimas || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-400">Start: {formatDateTime(game.pradžia)}</p>
                      <p className="text-sm text-gray-400">End: {formatDateTime(game.pabaiga)}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesPage;
