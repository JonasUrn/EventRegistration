'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Message from '../../components/Message';
import Card from '../../components/Card';
import { authStorage } from '../../lib/auth';
import { api, ApiError } from '../../lib/api';

const GameDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [game, setGame] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    start: '',
    end: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!authStorage.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const userData = await api.users.getCurrentUser();
        setCurrentUser(userData);

        const gameData = await api.games.getById(parseInt(resolvedParams.id));
        setGame(gameData);

        const tournamentData = await api.tournaments.getById(gameData.fk_Turnyrasid_Turnyras);
        setTournament(tournamentData);

        const participantsData = await api.games.getParticipants(parseInt(resolvedParams.id));
        setParticipants(participantsData);

        setFormData({
          name: gameData.pavadinimas,
          start: gameData.pradžia,
          end: gameData.pabaiga,
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push('/games');
      }
    };

    fetchData();
  }, [resolvedParams.id, router]);

  if (!currentUser || !game) {
    return null;
  }

  const canManage = tournament && (tournament.fk_Klientasid_Klientas === currentUser.id_Klientas || currentUser.administratorius);

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await api.games.update(game.id_Varzybos, {
        pavadinimas: formData.name,
        pradžia: formData.start,
        pabaiga: formData.end,
        fk_Turnyrasid_Turnyras: game.fk_Turnyrasid_Turnyras,
      });

      const updatedGame = await api.games.getById(game.id_Varzybos);
      setGame(updatedGame);
      setMessage({ type: 'success', text: 'Game updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update game:', error);
      setMessage({ type: 'error', text: 'Failed to update game' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this game? This cannot be undone.')) {
      try {
        await api.games.delete(game.id_Varzybos);
        router.push('/games');
      } catch (error) {
        console.error('Failed to delete game:', error);
        setMessage({ type: 'error', text: 'Failed to delete game' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">{game.pavadinimas}</h1>
          {canManage && !isEditing && (
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
                  label="Start Date"
                  type="date"
                  value={formData.start}
                  onChange={(val) => setFormData({ ...formData, start: val })}
                  required
                />

                <Input
                  label="End Date"
                  type="date"
                  value={formData.end}
                  onChange={(val) => setFormData({ ...formData, end: val })}
                  required
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="secondary" onClick={() => { setIsEditing(false); setMessage(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-gray-600">Tournament</p>
                <p className="font-medium text-gray-300 cursor-pointer hover:text-white" onClick={() => router.push(`/tournaments/${tournament.id_Turnyras}`)}>
                  {tournament?.pavadinimas || 'Unknown'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="text-gray-300">{game.pradžia}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="text-gray-300">{game.pabaiga}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-white">Participants ({participants.length})</h2>
          {participants.length === 0 ? (
            <p className="text-gray-400">No participants yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {participants.map(participant => (
                <Card key={participant.id_Varzybu_dalyvis}>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold text-white">Tournament Participant ID: {participant.fk_Turnyro_dalyvisid_Turnyro_dalyvis}</p>
                      <p className="text-sm text-gray-400">Points: {participant.taskai}</p>
                    </div>
                    {participant.yra_laimėtojas !== null && (
                      <div className="text-right">
                        <p className={`text-sm font-medium ${participant.yra_laimėtojas ? 'text-green-400' : 'text-red-400'}`}>
                          {participant.yra_laimėtojas ? 'Winner' : 'Loser'}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;
