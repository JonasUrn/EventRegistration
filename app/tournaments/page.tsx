'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import Card from '../components/Card';
import Button from '../components/Button';
import { getCurrentUser, tournaments } from '../data';

const TournamentsPage = () => {
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

  const canCreateTournament = currentUser.isOrganizer || currentUser.isAdministrator;

  const sortedTournaments = [...tournaments].sort((a, b) =>
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tournaments</h1>
          {canCreateTournament && (
            <Button onClick={() => router.push('/tournaments/create')}>
              Create Tournament
            </Button>
          )}
        </div>

        {sortedTournaments.length === 0 ? (
          <p className="text-gray-600">No tournaments available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedTournaments.map(tournament => (
              <Card key={tournament.id} onClick={() => router.push(`/tournaments/${tournament.id}`)}>
                <h3 className="font-bold text-lg mb-2">{tournament.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{tournament.description}</p>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Sport:</span>
                  <span>{tournament.typeOfSport}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Format:</span>
                  <span className="capitalize">{tournament.format}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Participants:</span>
                  <span>{tournament.minParticipants} - {tournament.maxParticipants}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dates:</span>
                  <span>{tournament.start} to {tournament.end}</span>
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
