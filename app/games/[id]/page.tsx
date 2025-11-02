'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Message from '../../components/Message';
import Card from '../../components/Card';
import { getCurrentUser, games, tournaments, gameReferees, referees, gameSponsors, sponsors, gameParticipants } from '../../data';

const GameDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const currentUser = getCurrentUser();

  const [game, setGame] = useState(games.find(g => g.id === resolvedParams.id));
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start: '',
    end: '',
    winnerPts: 0,
    loserPts: 0,
  });

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!game) {
      router.push('/games');
      return;
    }

    setFormData({
      name: game.name,
      start: game.start,
      end: game.end,
      winnerPts: game.winnerPts,
      loserPts: game.loserPts,
    });
  }, [currentUser, game, router]);

  if (!currentUser || !game) {
    return null;
  }

  const isCreator = game.creatorId === currentUser.id;
  const tournament = tournaments.find(t => t.id === game.tournamentId);

  const gameRefs = gameReferees
    .filter(gr => gr.gameId === game.id)
    .map(gr => referees.find(r => r.id === gr.refereeId))
    .filter(Boolean);

  const gameSpons = gameSponsors
    .filter(gs => gs.gameId === game.id)
    .map(gs => sponsors.find(s => s.id === gs.sponsorId))
    .filter(Boolean);

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const gameIndex = games.findIndex(g => g.id === game.id);
    if (gameIndex !== -1) {
      games[gameIndex] = { ...games[gameIndex], ...formData };
      setGame(games[gameIndex]);
      setMessage({ type: 'success', text: 'Game updated successfully!' });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this game? This cannot be undone.')) {
      const gameIndex = games.findIndex(g => g.id === game.id);
      if (gameIndex !== -1) {
        games.splice(gameIndex, 1);
        router.push('/games');
      }
    }
  };

  const handleOfferSimilarGames = () => {
    const similarGames = games.filter(g =>
      g.id !== game.id && g.tournamentId === game.tournamentId
    );

    if (similarGames.length === 0) {
      setMessage({ type: 'error', text: 'No similar games found' });
    } else {
      setMessage({
        type: 'success',
        text: `Found ${similarGames.length} similar game(s) in the same tournament`
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">{game.name}</h1>
          {isCreator && !isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleEdit}>Edit</Button>
              <Button variant="danger" onClick={handleDelete}>Delete Game</Button>
            </div>
          )}
        </div>

        {message && (
          <div className="mb-4">
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <div className="border border-gray-700 bg-gray-800 rounded-2xl shadow-2xl p-10 mb-6">
          {isEditing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <Input
                label="Game Name"
                value={formData.name}
                onChange={(val) => setFormData({ ...formData, name: val })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date & Time"
                  type="datetime-local"
                  value={formData.start}
                  onChange={(val) => setFormData({ ...formData, start: val })}
                  required
                />

                <Input
                  label="End Date & Time"
                  type="datetime-local"
                  value={formData.end}
                  onChange={(val) => setFormData({ ...formData, end: val })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Winner Points"
                  type="number"
                  value={String(formData.winnerPts)}
                  onChange={(val) => setFormData({ ...formData, winnerPts: parseInt(val) || 0 })}
                  required
                />

                <Input
                  label="Loser Points"
                  type="number"
                  value={String(formData.loserPts)}
                  onChange={(val) => setFormData({ ...formData, loserPts: parseInt(val) || 0 })}
                  required
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button type="submit">Save Changes</Button>
                <Button variant="secondary" onClick={() => { setIsEditing(false); setMessage(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-gray-600">Tournament</p>
                <p className="font-medium text-gray-300">{tournament?.name || 'Unknown'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Start</p>
                  <p className="text-gray-300">{formatDateTime(game.start)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End</p>
                  <p className="text-gray-300">{formatDateTime(game.end)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Winner Points</p>
                  <p className="text-gray-300">{game.winnerPts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loser Points</p>
                  <p className="text-gray-300">{game.loserPts}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <Button onClick={handleOfferSimilarGames}>Offer Similar Games</Button>
        </div>

        {gameRefs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-6 text-white">Referees</h2>
            <div className="flex flex-col gap-2">
              {gameRefs.map(referee => (
                <Card key={referee!.id}>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold text-white">{referee!.name} {referee!.surname}</p>
                      <p className="text-sm text-gray-400">{referee!.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">License</p>
                      <p className="text-sm font-medium text-gray-300">{referee!.licenseNumber}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {gameSpons.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-white">Sponsors</h2>
            <div className="flex flex-col gap-2">
              {gameSpons.map(sponsor => (
                <Card key={sponsor!.id}>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold text-white">{sponsor!.name}</p>
                      <p className="text-sm text-gray-400">{sponsor!.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Class</p>
                      <p className="text-sm font-medium uppercase text-gray-300">{sponsor!.class}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetailPage;
