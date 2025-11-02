'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Message from '../../components/Message';
import Card from '../../components/Card';
import { getCurrentUser, tournaments, games, registrations, tournamentParticipants, teams } from '../../data';

const TournamentDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const currentUser = getCurrentUser();

  const [tournament, setTournament] = useState(tournaments.find(t => t.id === resolvedParams.id));
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    typeOfSport: '',
    start: '',
    end: '',
    minParticipants: 2,
    maxParticipants: 16,
    format: 'regular' as 'regular' | 'playoffs' | 'finals',
  });
  const [gameFormData, setGameFormData] = useState({
    name: '',
    start: '',
    end: '',
    winnerPts: 3,
    loserPts: 0,
  });
  const [joinFormData, setJoinFormData] = useState({
    participantType: 'User' as 'User' | 'Team',
    teamId: '',
  });

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!tournament) {
      router.push('/tournaments');
      return;
    }

    setFormData({
      name: tournament.name,
      description: tournament.description,
      typeOfSport: tournament.typeOfSport,
      start: tournament.start,
      end: tournament.end,
      minParticipants: tournament.minParticipants,
      maxParticipants: tournament.maxParticipants,
      format: tournament.format,
    });
  }, [currentUser, tournament, router]);

  if (!currentUser || !tournament) {
    return null;
  }

  const canManage = currentUser.isOrganizer || currentUser.isAdministrator || tournament.creatorId === currentUser.id;

  const tournamentGames = games.filter(g => g.tournamentId === tournament.id);

  const participants = tournamentParticipants.filter(tp => tp.tournamentId === tournament.id);

  const userTeams = teams.filter(t => t.captainId === currentUser.id);

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const tournamentIndex = tournaments.findIndex(t => t.id === tournament.id);
    if (tournamentIndex !== -1) {
      tournaments[tournamentIndex] = { ...tournaments[tournamentIndex], ...formData };
      setTournament(tournaments[tournamentIndex]);
      setMessage({ type: 'success', text: 'Tournament updated successfully!' });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this tournament? This cannot be undone.')) {
      const tournamentIndex = tournaments.findIndex(t => t.id === tournament.id);
      if (tournamentIndex !== -1) {
        tournaments.splice(tournamentIndex, 1);
        router.push('/tournaments');
      }
    }
  };

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();

    const newGame = {
      id: String(games.length + 1),
      tournamentId: tournament.id,
      ...gameFormData,
      creatorId: currentUser.id,
    };

    games.push(newGame);
    setMessage({ type: 'success', text: 'Game added successfully!' });
    setGameFormData({
      name: '',
      start: '',
      end: '',
      winnerPts: 3,
      loserPts: 0,
    });
    setIsAddingGame(false);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();

    const participantId = joinFormData.participantType === 'Team' ? joinFormData.teamId : currentUser.id;

    const existingRegistration = registrations.find(
      r => r.tournamentId === tournament.id &&
           r.participantType === joinFormData.participantType &&
           r.participantId === participantId
    );

    if (existingRegistration) {
      setMessage({ type: 'error', text: 'Already registered for this tournament' });
      return;
    }

    const newRegistration = {
      id: String(registrations.length + 1),
      participantType: joinFormData.participantType,
      participantId: participantId,
      tournamentId: tournament.id,
      date: new Date().toISOString().split('T')[0],
    };

    registrations.push(newRegistration);

    const newParticipant = {
      id: String(tournamentParticipants.length + 1),
      tournamentId: tournament.id,
      participantType: joinFormData.participantType,
      participantId: participantId,
      position: 0,
      points: 0,
    };

    tournamentParticipants.push(newParticipant);

    setMessage({ type: 'success', text: 'Successfully joined the tournament!' });
    setIsJoining(false);
  };

  const handleGenerateReport = () => {
    const reportData = {
      tournament: tournament.name,
      games: tournamentGames.length,
      participants: participants.length,
      format: tournament.format,
    };

    setMessage({
      type: 'success',
      text: `Report generated: ${reportData.games} games, ${reportData.participants} participants`
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          {canManage && !isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleEdit}>Edit</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
          )}
        </div>

        {message && (
          <div className="mb-4">
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <div className="border border-black p-6 mb-6">
          {isEditing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <Input
                label="Tournament Name"
                value={formData.name}
                onChange={(val) => setFormData({ ...formData, name: val })}
                required
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="px-3 py-2 border border-black bg-white"
                  rows={4}
                />
              </div>

              <Input
                label="Type of Sport"
                value={formData.typeOfSport}
                onChange={(val) => setFormData({ ...formData, typeOfSport: val })}
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

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Participants"
                  type="number"
                  value={String(formData.minParticipants)}
                  onChange={(val) => setFormData({ ...formData, minParticipants: parseInt(val) || 2 })}
                  required
                />

                <Input
                  label="Max Participants"
                  type="number"
                  value={String(formData.maxParticipants)}
                  onChange={(val) => setFormData({ ...formData, maxParticipants: parseInt(val) || 16 })}
                  required
                />
              </div>

              <Select
                label="Format"
                value={formData.format}
                onChange={(val) => setFormData({ ...formData, format: val as 'regular' | 'playoffs' | 'finals' })}
                options={[
                  { value: 'regular', label: 'Regular' },
                  { value: 'playoffs', label: 'Playoffs' },
                  { value: 'finals', label: 'Finals' },
                ]}
                required
              />

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
                <p className="text-sm text-gray-600">Description</p>
                <p>{tournament.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type of Sport</p>
                  <p>{tournament.typeOfSport}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Format</p>
                  <p className="capitalize">{tournament.format}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p>{tournament.start}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p>{tournament.end}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p>{tournament.minParticipants} - {tournament.maxParticipants}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Participants</p>
                  <p>{participants.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {!isJoining && (
            <Button onClick={() => setIsJoining(true)}>Join Tournament</Button>
          )}
          {canManage && (
            <Button onClick={handleGenerateReport}>Generate Report</Button>
          )}
        </div>

        {isJoining && (
          <form onSubmit={handleJoin} className="border border-black p-6 mb-6">
            <h3 className="font-bold mb-4">Join Tournament</h3>
            <div className="flex flex-col gap-4">
              <Select
                label="Join as"
                value={joinFormData.participantType}
                onChange={(val) => setJoinFormData({ ...joinFormData, participantType: val as 'User' | 'Team' })}
                options={[
                  { value: 'User', label: 'Individual' },
                  { value: 'Team', label: 'Team' },
                ]}
                required
              />

              {joinFormData.participantType === 'Team' && (
                <Select
                  label="Select Team"
                  value={joinFormData.teamId}
                  onChange={(val) => setJoinFormData({ ...joinFormData, teamId: val })}
                  options={userTeams.map(t => ({ value: t.id, label: t.name }))}
                  required
                />
              )}

              <div className="flex gap-2">
                <Button type="submit">Join</Button>
                <Button variant="secondary" onClick={() => setIsJoining(false)}>Cancel</Button>
              </div>
            </div>
          </form>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Games</h2>
            {canManage && !isAddingGame && (
              <Button onClick={() => setIsAddingGame(true)}>Add Game</Button>
            )}
          </div>

          {isAddingGame && (
            <form onSubmit={handleAddGame} className="border border-black p-4 mb-4">
              <h3 className="font-bold mb-4">Add New Game</h3>
              <div className="flex flex-col gap-4">
                <Input
                  label="Game Name"
                  value={gameFormData.name}
                  onChange={(val) => setGameFormData({ ...gameFormData, name: val })}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Date & Time"
                    type="datetime-local"
                    value={gameFormData.start}
                    onChange={(val) => setGameFormData({ ...gameFormData, start: val })}
                    required
                  />

                  <Input
                    label="End Date & Time"
                    type="datetime-local"
                    value={gameFormData.end}
                    onChange={(val) => setGameFormData({ ...gameFormData, end: val })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Winner Points"
                    type="number"
                    value={String(gameFormData.winnerPts)}
                    onChange={(val) => setGameFormData({ ...gameFormData, winnerPts: parseInt(val) || 0 })}
                    required
                  />

                  <Input
                    label="Loser Points"
                    type="number"
                    value={String(gameFormData.loserPts)}
                    onChange={(val) => setGameFormData({ ...gameFormData, loserPts: parseInt(val) || 0 })}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Add Game</Button>
                  <Button variant="secondary" onClick={() => setIsAddingGame(false)}>Cancel</Button>
                </div>
              </div>
            </form>
          )}

          {tournamentGames.length === 0 ? (
            <p className="text-gray-600">No games scheduled yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {tournamentGames.map(game => (
                <Card key={game.id} onClick={() => router.push(`/games/${game.id}`)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{game.name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(game.start).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>Winner: {game.winnerPts} pts</p>
                      <p>Loser: {game.loserPts} pts</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Participants ({participants.length})</h2>
          {participants.length === 0 ? (
            <p className="text-gray-600">No participants yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {participants.map(participant => (
                <Card key={participant.id}>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold">
                        {participant.participantType} - ID: {participant.participantId}
                      </p>
                      <p className="text-sm text-gray-600">Points: {participant.points}</p>
                    </div>
                    {participant.position > 0 && (
                      <p className="text-sm font-medium">Position: {participant.position}</p>
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

export default TournamentDetailPage;
