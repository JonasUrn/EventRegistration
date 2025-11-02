'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import Card from '../components/Card';
import { getCurrentUser, games, tournaments } from '../data';

const GamesPage = () => {
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

  const sortedGames = [...games].sort((a, b) =>
    new Date(a.start).getTime() - new Date(b.start).getTime()
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

        {sortedGames.length === 0 ? (
          <p className="text-gray-400">No games available.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedGames.map(game => {
              const tournament = tournaments.find(t => t.id === game.tournamentId);
              return (
                <Card key={game.id} onClick={() => router.push(`/games/${game.id}`)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-white">{game.name}</h3>
                      <p className="text-sm text-gray-400 mb-1">
                        Tournament: {tournament?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-400">Start: {formatDateTime(game.start)}</p>
                      <p className="text-sm text-gray-400">End: {formatDateTime(game.end)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="text-sm text-gray-400">Winner: {game.winnerPts}</p>
                      <p className="text-sm text-gray-400">Loser: {game.loserPts}</p>
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
