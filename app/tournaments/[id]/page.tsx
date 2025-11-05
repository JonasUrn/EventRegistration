'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Message from '../../components/Message';
import Card from '../../components/Card';
import { getCurrentUser, tournaments, games, registrations, tournamentParticipants, teams, gameParticipants, users } from '../../data';
import layoutStyles from '../../layout.module.css';

const TournamentDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const currentUser = getCurrentUser();

  const [tournament, setTournament] = useState(tournaments.find(t => t.id === resolvedParams.id));
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
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
    participant1Id: '',
    participant2Id: '',
  });
  const [selectedGameId, setSelectedGameId] = useState('');
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

  // Only the creator can edit/delete tournaments
  const canManage = tournament.creatorId === currentUser.id;

  // Get only added games for display
  const tournamentGames = games.filter(g => g.tournamentId === tournament.id && g.isAdded);

  // Get unadded games for the add game dropdown
  const unaddedGames = games.filter(g => g.tournamentId === tournament.id && !g.isAdded);

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

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that 2 participants are selected
    if (!gameFormData.participant1Id || !gameFormData.participant2Id) {
      setMessage({ type: 'error', text: 'Please select 2 participants for the game' });
      return;
    }

    if (gameFormData.participant1Id === gameFormData.participant2Id) {
      setMessage({ type: 'error', text: 'Please select 2 different participants' });
      return;
    }

    const newGameId = String(games.length + 1);

    const newGame = {
      id: newGameId,
      tournamentId: tournament.id,
      name: gameFormData.name,
      start: gameFormData.start,
      end: gameFormData.end,
      winnerPts: gameFormData.winnerPts,
      loserPts: gameFormData.loserPts,
      creatorId: currentUser.id,
      isAdded: false, // Created but not added yet
    };

    games.push(newGame);

    // Add participants to the game
    gameParticipants.push({
      id: String(gameParticipants.length + 1),
      gameId: newGameId,
      participantId: gameFormData.participant1Id,
    });

    gameParticipants.push({
      id: String(gameParticipants.length + 1),
      gameId: newGameId,
      participantId: gameFormData.participant2Id,
    });

    setMessage({ type: 'success', text: 'Game created successfully with 2 participants! Use "Add Game" to add it to the tournament.' });
    setGameFormData({
      name: '',
      start: '',
      end: '',
      winnerPts: 3,
      loserPts: 0,
      participant1Id: '',
      participant2Id: '',
    });
    setIsCreatingGame(false);
  };

  const handleAddGameToTournament = (e: React.FormEvent) => {
    e.preventDefault();

    const gameIndex = games.findIndex(g => g.id === selectedGameId);
    if (gameIndex !== -1) {
      games[gameIndex].isAdded = true;
      setMessage({ type: 'success', text: 'Game added to tournament successfully!' });
      setSelectedGameId('');
      setIsAddingGame(false);
    }
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
    <div className={layoutStyles.pageContainer}>
      <Navigation />

      <div className={layoutStyles.pageContentNarrow}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className={layoutStyles.pageTitle} style={{ marginBottom: 0 }}>{tournament.name}</h1>
          {canManage && !isEditing && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" onClick={handleEdit}>Edit</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
          )}
        </div>

        {message && (
          <div className={layoutStyles.messageWrapper}>
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <Card>
          {isEditing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Tournament Name"
                value={formData.name}
                onChange={(val) => setFormData({ ...formData, name: val })}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem',
                    transition: 'all var(--transition-fast)',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  rows={4}
                />
              </div>

              <Input
                label="Type of Sport"
                value={formData.typeOfSport}
                onChange={(val) => setFormData({ ...formData, typeOfSport: val })}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
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

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Button type="submit">Save Changes</Button>
                <Button variant="secondary" onClick={() => { setIsEditing(false); setMessage(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Description</p>
                <p style={{ color: 'var(--text-primary)' }}>{tournament.description}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Type of Sport</p>
                  <p style={{ color: 'var(--text-primary)' }}>{tournament.typeOfSport}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Format</p>
                  <p style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{tournament.format}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Start Date</p>
                  <p style={{ color: 'var(--text-primary)' }}>{tournament.start}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>End Date</p>
                  <p style={{ color: 'var(--text-primary)' }}>{tournament.end}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Participants</p>
                  <p style={{ color: 'var(--text-primary)' }}>{tournament.minParticipants} - {tournament.maxParticipants}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Current Participants</p>
                  <p style={{ color: 'var(--text-primary)' }}>{participants.length}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          {!isJoining && (
            <Button onClick={() => setIsJoining(true)}>Join Tournament</Button>
          )}
          {canManage && (
            <Button variant="secondary" onClick={handleGenerateReport}>Generate Report</Button>
          )}
        </div>

        {isJoining && (
          <Card>
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Join Tournament</h3>

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

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button type="submit">Join</Button>
                <Button variant="secondary" onClick={() => setIsJoining(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Games</h2>
            {canManage && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!isCreatingGame && <Button onClick={() => setIsCreatingGame(true)}>Create Game</Button>}
                {!isAddingGame && unaddedGames.length > 0 && (
                  <Button variant="secondary" onClick={() => setIsAddingGame(true)}>Add Game</Button>
                )}
              </div>
            )}
          </div>

          {isCreatingGame && (
            <Card>
              <form onSubmit={handleCreateGame} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Create New Game</h3>

                <Input
                  label="Game Name"
                  value={gameFormData.name}
                  onChange={(val) => setGameFormData({ ...gameFormData, name: val })}
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <Select
                    label="Participant 1"
                    value={gameFormData.participant1Id}
                    onChange={(val) => setGameFormData({ ...gameFormData, participant1Id: val })}
                    options={participants.map(p => {
                      let participantName = '';
                      if (p.participantType === 'Team') {
                        const team = teams.find(t => t.id === p.participantId);
                        participantName = team ? team.name : `Team ${p.participantId}`;
                      } else {
                        const user = users.find(u => u.id === p.participantId);
                        participantName = user ? `${user.name} ${user.surname}` : `User ${p.participantId}`;
                      }
                      return {
                        value: p.participantId,
                        label: `${participantName} (${p.participantType})`
                      };
                    })}
                    required
                  />

                  <Select
                    label="Participant 2"
                    value={gameFormData.participant2Id}
                    onChange={(val) => setGameFormData({ ...gameFormData, participant2Id: val })}
                    options={participants.map(p => {
                      let participantName = '';
                      if (p.participantType === 'Team') {
                        const team = teams.find(t => t.id === p.participantId);
                        participantName = team ? team.name : `Team ${p.participantId}`;
                      } else {
                        const user = users.find(u => u.id === p.participantId);
                        participantName = user ? `${user.name} ${user.surname}` : `User ${p.participantId}`;
                      }
                      return {
                        value: p.participantId,
                        label: `${participantName} (${p.participantType})`
                      };
                    })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button type="submit">Create Game</Button>
                  <Button variant="secondary" onClick={() => setIsCreatingGame(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {isAddingGame && (
            <Card>
              <form onSubmit={handleAddGameToTournament} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Add Game to Tournament</h3>

                <Select
                  label="Select Game"
                  value={selectedGameId}
                  onChange={(val) => setSelectedGameId(val)}
                  options={unaddedGames.map(g => ({
                    value: g.id,
                    label: `${g.name} - ${new Date(g.start).toLocaleDateString()}`
                  }))}
                  required
                />

                {selectedGameId && (
                  <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    {(() => {
                      const game = unaddedGames.find(g => g.id === selectedGameId);
                      return game ? (
                        <>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Start: {new Date(game.start).toLocaleString()}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            End: {new Date(game.end).toLocaleString()}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Points: Winner {game.winnerPts}, Loser {game.loserPts}
                          </p>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button type="submit">Add to Tournament</Button>
                  <Button variant="secondary" onClick={() => { setIsAddingGame(false); setSelectedGameId(''); }}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {tournamentGames.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No games added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tournamentGames.map(game => (
                <Card key={game.id} onClick={() => router.push(`/games/${game.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{game.name}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {new Date(game.start).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Participants ({participants.length})
          </h2>
          {participants.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No participants yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {participants.map(participant => (
                <Card key={participant.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {participant.participantType} - ID: {participant.participantId}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Points: {participant.points}</p>
                    </div>
                    {participant.position > 0 && (
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Position: {participant.position}</p>
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
