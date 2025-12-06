'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Message from '../../components/Message';
import Card from '../../components/Card';
import { authStorage } from '../../lib/auth';
import { api, ApiError } from '../../lib/api';
import layoutStyles from '../../layout.module.css';

const TournamentDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [allSponsors, setAllSponsors] = useState<any[]>([]);
  const [allReferees, setAllReferees] = useState<any[]>([]);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    participant1: '',
    participant2: '',
    addReferee: false,
    refereeMode: 'existing' as 'existing' | 'new',
    existingReferee: '',
    refereeFirstName: '',
    refereeLastName: '',
    refereeEmail: '',
    refereePhone: '',
    refereeCountry: '',
    refereeCity: '',
    refereeLicense: '',
    addSponsor: false,
    sponsorMode: 'existing' as 'existing' | 'new',
    existingSponsor: '',
    sponsorName: '',
    sponsorEmail: '',
    sponsorWebsite: '',
    sponsorClass: 'Auksinis',
    addLocation: false,
    locationMode: 'existing' as 'existing' | 'new',
    existingLocation: '',
    locationCountry: '',
    locationCity: '',
    locationAddress: '',
    locationCoordinates: '',
    locationSeats: '',
    locationFacilityType: '',
    locationDescription: '',
  });

  const [joinFormData, setJoinFormData] = useState({
    participantType: 'User' as 'User' | 'Team',
    teamId: '',
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

        const tournamentData = await api.tournaments.getById(parseInt(resolvedParams.id));
        setTournament(tournamentData);

        const participantsData = await api.tournaments.getParticipants(parseInt(resolvedParams.id));
        setParticipants(participantsData);

        // Get all games and filter by tournament
        const allGames = await api.games.getAll();
        const tournamentGames = allGames.filter((g: any) => g.fk_Turnyrasid_Turnyras === parseInt(resolvedParams.id));
        setGames(tournamentGames);

        // Get user's teams
        const allTeams = await api.teams.getAll();
        const myTeams = allTeams.filter((t: any) => t.fk_Klientasid_Klientas === userData.id_Klientas);
        setUserTeams(myTeams);

        try {
          const sponsorsData = await api.games.getAllSponsors();
          setAllSponsors(sponsorsData);
          console.log('Loaded sponsors:', sponsorsData);
        } catch (error) {
          console.error('Failed to fetch sponsors:', error);
        }

        try {
          const refereesData = await api.games.getAllReferees();
          setAllReferees(refereesData);
          console.log('Loaded referees:', refereesData);
        } catch (error) {
          console.error('Failed to fetch referees:', error);
        }

        try {
          const locationsData = await api.games.getAllLocations();
          setAllLocations(locationsData);
          console.log('Loaded locations:', locationsData);
        } catch (error) {
          console.error('Failed to fetch locations:', error);
        }

        setFormData({
          name: tournamentData.pavadinimas,
          description: tournamentData.aprasas,
          typeOfSport: tournamentData.sporto_saka,
          start: tournamentData.pradzia,
          end: tournamentData.pabaiga,
          minParticipants: tournamentData.minimalus_nariu_skacius,
          maxParticipants: tournamentData.maksimalus_nariu_skaicius,
          format: tournamentData.turnyro_formatas,
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push('/tournaments');
      }
    };

    fetchData();
  }, [resolvedParams.id, router]);

  if (!currentUser || !tournament) {
    return null;
  }

  const canManage = tournament.fk_Klientasid_Klientas === currentUser.id_Klientas || currentUser.administratorius;

  // Check if current user is already a participant in this tournament
  const isUserParticipant = participants.some(p => 
    p.dalyvio_tipas === 'User' && p.fk_Klientasid_Klientas === currentUser.id_Klientas
  );

  // Check if any of user's teams are already participants
  const isTeamParticipant = participants.some(p => 
    p.dalyvio_tipas === 'Team' && userTeams.some(t => t.id_Komanda === p.fk_Komandaid_Komanda)
  );

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await api.tournaments.update(tournament.id_Turnyras, {
        pavadinimas: formData.name,
        aprasas: formData.description,
        sporto_saka: formData.typeOfSport,
        pradzia: formData.start,
        pabaiga: formData.end,
        minimalus_nariu_skacius: formData.minParticipants,
        maksimalus_nariu_skaicius: formData.maxParticipants,
        turnyro_formatas: formData.format,
        fk_Klientasid_Klientas: tournament.fk_Klientasid_Klientas,
      });

      const updatedTournament = await api.tournaments.getById(tournament.id_Turnyras);
      setTournament(updatedTournament);
      setMessage({ type: 'success', text: 'Tournament updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update tournament:', error);
      setMessage({ type: 'error', text: 'Failed to update tournament' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this tournament? This cannot be undone.')) {
      try {
        await api.tournaments.delete(tournament.id_Turnyras);
        router.push('/tournaments');
      } catch (error) {
        console.error('Failed to delete tournament:', error);
        setMessage({ type: 'error', text: 'Failed to delete tournament' });
      }
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const newGame = await api.games.create({
        pavadinimas: gameFormData.name,
        pradžia: gameFormData.start,
        pabaiga: gameFormData.end,
        fk_Turnyrasid_Turnyras: tournament.id_Turnyras,
      });

      // Add participants if selected
      if (gameFormData.participant1) {
        await api.games.addParticipant({
          taskai: 0,
          yra_laimėtojas: null,
          fk_Varzybosid_Varzybos: newGame.id_Varzybos,
          fk_Turnyro_dalyvisid_Turnyro_dalyvis: parseInt(gameFormData.participant1),
        });
      }

      if (gameFormData.participant2) {
        await api.games.addParticipant({
          taskai: 0,
          yra_laimėtojas: null,
          fk_Varzybosid_Varzybos: newGame.id_Varzybos,
          fk_Turnyro_dalyvisid_Turnyro_dalyvis: parseInt(gameFormData.participant2),
        });
      }

      if (gameFormData.addReferee) {
        if (gameFormData.refereeMode === 'existing') {
          await api.games.addReferee({
            vardas: '',
            pavarde: '',
            el_pastas: '',
            tel_numeris: '',
            salis: '',
            miestas: '',
            licenzijos_id: '',
            fk_Varzybosid_Varzybos: newGame.id_Varzybos,
            id_Teisejas: parseInt(gameFormData.existingReferee),
          });
        } else {
          await api.games.addReferee({
            vardas: gameFormData.refereeFirstName,
            pavarde: gameFormData.refereeLastName,
            el_pastas: gameFormData.refereeEmail,
            tel_numeris: gameFormData.refereePhone,
            salis: gameFormData.refereeCountry,
            miestas: gameFormData.refereeCity,
            licenzijos_id: gameFormData.refereeLicense,
            fk_Varzybosid_Varzybos: newGame.id_Varzybos,
          });
        }
      }

      if (gameFormData.addSponsor) {
        let sponsorId;
        if (gameFormData.sponsorMode === 'existing') {
          sponsorId = parseInt(gameFormData.existingSponsor);
        } else {
          const newSponsor = await api.games.createSponsor({
            pavadinimas: gameFormData.sponsorName,
            el_pastas: gameFormData.sponsorEmail,
            el_puslapis: gameFormData.sponsorWebsite || null,
            remejo_klase: gameFormData.sponsorClass,
          });
          sponsorId = newSponsor.id_Remejas;
        }

        await api.games.addMatchSponsor({
          fk_Varzybosid_Varzybos: newGame.id_Varzybos,
          fk_Remejasid_Remejas: sponsorId,
        });
      }

      if (gameFormData.addLocation) {
        if (gameFormData.locationMode === 'existing') {
          await api.games.addLocation({
            salis: '',
            miestas: '',
            adresas: '',
            koordinates: '',
            vietu_skaicius: '',
            patalpos_tipas: '',
            aprasymas: '',
            fk_Varzybosid_Varzybos: newGame.id_Varzybos,
            id_Vieta: parseInt(gameFormData.existingLocation),
          });
        } else {
          await api.games.addLocation({
            salis: gameFormData.locationCountry,
            miestas: gameFormData.locationCity,
            adresas: gameFormData.locationAddress,
            koordinates: gameFormData.locationCoordinates,
            vietu_skaicius: gameFormData.locationSeats,
            patalpos_tipas: gameFormData.locationFacilityType,
            aprasymas: gameFormData.locationDescription,
            fk_Varzybosid_Varzybos: newGame.id_Varzybos,
          });
        }
      }

      // Refresh games list
      const allGames = await api.games.getAll();
      const tournamentGames = allGames.filter((g: any) => g.fk_Turnyrasid_Turnyras === tournament.id_Turnyras);
      setGames(tournamentGames);

      setMessage({ type: 'success', text: 'Game created successfully!' });
      setGameFormData({
        name: '',
        start: '',
        end: '',
        participant1: '',
        participant2: '',
        addReferee: false,
        refereeMode: 'existing',
        existingReferee: '',
        refereeFirstName: '',
        refereeLastName: '',
        refereeEmail: '',
        refereePhone: '',
        refereeCountry: '',
        refereeCity: '',
        refereeLicense: '',
        addSponsor: false,
        sponsorMode: 'existing',
        existingSponsor: '',
        sponsorName: '',
        sponsorEmail: '',
        sponsorWebsite: '',
        sponsorClass: 'Auksinis',
        addLocation: false,
        locationMode: 'existing',
        existingLocation: '',
        locationCountry: '',
        locationCity: '',
        locationAddress: '',
        locationCoordinates: '',
        locationSeats: '',
        locationFacilityType: '',
        locationDescription: '',
      });
      setIsCreatingGame(false);
    } catch (error) {
      console.error('Failed to create game:', error);
      setMessage({ type: 'error', text: 'Failed to create game' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await api.tournaments.addParticipant({
        pozicija: 0,
        taskai: 0,
        dalyvio_tipas: joinFormData.participantType,
        fk_Klientasid_Klientas: joinFormData.participantType === 'User' ? currentUser.id_Klientas : null,
        fk_Turnyrasid_Turnyras: tournament.id_Turnyras,
        fk_Komandaid_Komanda: joinFormData.participantType === 'Team' ? parseInt(joinFormData.teamId) : null,
      });

      // Refresh participants
      const participantsData = await api.tournaments.getParticipants(tournament.id_Turnyras);
      setParticipants(participantsData);

      setMessage({ type: 'success', text: 'Successfully joined the tournament!' });
      setIsJoining(false);
    } catch (error) {
      console.error('Failed to join tournament:', error);
      setMessage({ type: 'error', text: 'Failed to join tournament' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={layoutStyles.pageContainer}>
      <Navigation />

      <div className={layoutStyles.pageContentNarrow}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className={layoutStyles.pageTitle} style={{ marginBottom: 0 }}>{tournament.pavadinimas}</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {canManage && (
              <Button onClick={() => router.push(`/tournaments/${tournament.id_Turnyras}/report`)}>Generate Report</Button>
            )}
            {canManage && !isEditing && (
              <>
                <Button variant="secondary" onClick={handleEdit}>Edit</Button>
                <Button variant="danger" onClick={handleDelete}>Delete</Button>
              </>
            )}
          </div>
        </div>

        {message && (
          <div className={layoutStyles.messageWrapper}>
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <Card style={{ padding: '1.5rem' }}>
          {isEditing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="secondary" onClick={() => { setIsEditing(false); setMessage(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Description</p>
                <p style={{ color: 'var(--text-primary)' }}>{tournament.aprasas}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Type of Sport</p>
                  <p style={{ color: 'var(--text-primary)' }}>{tournament.sporto_saka}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Format</p>
                  <p style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{tournament.turnyro_formatas}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Start Date</p>
                  <p style={{ color: 'var(--text-primary)' }}>{tournament.pradzia}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>End Date</p>
                  <p style={{ color: 'var(--text-primary)' }}>{tournament.pabaiga}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Participants</p>
                  <p style={{ color: 'var(--text-primary)' }}>{tournament.minimalus_nariu_skacius} - {tournament.maksimalus_nariu_skaicius}</p>
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
          {!isJoining && !isUserParticipant && !isTeamParticipant && (
            <Button onClick={() => setIsJoining(true)}>Join Tournament</Button>
          )}
        </div>

        {isJoining && (
          <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.25rem' }}>Join Tournament</h3>

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
                  options={userTeams.map(t => ({ value: String(t.id_Komanda), label: t.pavadinimas }))}
                  required
                />
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Joining...' : 'Join'}
                </Button>
                <Button variant="secondary" onClick={() => setIsJoining(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Games</h2>
            {canManage && !isCreatingGame && (
              <Button onClick={() => setIsCreatingGame(true)}>Create Game</Button>
            )}
          </div>

          {isCreatingGame && (
            <Card style={{ marginBottom: '2rem', padding: '2rem' }}>
              <form onSubmit={handleCreateGame} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create New Game</h3>

                <Input
                  label="Game Name"
                  value={gameFormData.name}
                  onChange={(val) => setGameFormData({ ...gameFormData, name: val })}
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <Input
                    label="Start Date"
                    type="date"
                    value={gameFormData.start}
                    onChange={(val) => setGameFormData({ ...gameFormData, start: val })}
                    required
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={gameFormData.end}
                    onChange={(val) => setGameFormData({ ...gameFormData, end: val })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <Select
                    label="Participant 1"
                    value={gameFormData.participant1}
                    onChange={(val) => setGameFormData({ ...gameFormData, participant1: val })}
                    options={[
                      { value: '', label: 'Select participant...' },
                      ...participants.map(p => {
                        const label = p.dalyvio_tipas === 'Team'
                          ? `Team: ${p.komanda_pavadinimas || 'Unknown'}`
                          : `User: ${p.klientas_vardas?.trim() || 'User'} ${(p.klientas_pavarde || '').trim()}`;
                        return { value: p.id_Turnyro_dalyvis.toString(), label };
                      })
                    ]}
                  />
                  <Select
                    label="Participant 2"
                    value={gameFormData.participant2}
                    onChange={(val) => setGameFormData({ ...gameFormData, participant2: val })}
                    options={[
                      { value: '', label: 'Select participant...' },
                      ...participants.map(p => {
                        const label = p.dalyvio_tipas === 'Team'
                          ? `Team: ${p.komanda_pavadinimas || 'Unknown'}`
                          : `User: ${p.klientas_vardas?.trim() || 'User'} ${(p.klientas_pavarde || '').trim()}`;
                        return { value: p.id_Turnyro_dalyvis.toString(), label };
                      })
                    ]}
                  />
                </div>

                {/* Referee Section */}
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={gameFormData.addReferee}
                      onChange={(e) => setGameFormData({ ...gameFormData, addReferee: e.target.checked })}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <label style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                      onClick={() => setGameFormData({ ...gameFormData, addReferee: !gameFormData.addReferee })}>
                      Add Referee
                    </label>
                  </div>

                  {gameFormData.addReferee && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <Select
                        label="Referee Selection"
                        value={gameFormData.refereeMode}
                        onChange={(val) => setGameFormData({ ...gameFormData, refereeMode: val as 'existing' | 'new' })}
                        options={[
                          { value: 'existing', label: 'Select Existing Referee' },
                          { value: 'new', label: 'Create New Referee' },
                        ]}
                      />
                      {gameFormData.refereeMode === 'existing' ? (
                        <Select
                          label={`Existing Referee (${allReferees.length} available)`}
                          value={gameFormData.existingReferee}
                          onChange={(val) => setGameFormData({ ...gameFormData, existingReferee: val })}
                          options={[
                            { value: '', label: allReferees.length === 0 ? 'No referees available - create a new one' : 'Select referee...' },
                            ...allReferees.map(r => ({
                              value: r.id_Teisejas.toString(),
                              label: `${r.vardas} ${r.pavarde} - ${r.salis}, ${r.miestas}`
                            }))
                          ]}
                          required={gameFormData.addReferee && gameFormData.refereeMode === 'existing'}
                        />
                      ) : (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <Input
                              label="First Name"
                              value={gameFormData.refereeFirstName}
                              onChange={(val) => setGameFormData({ ...gameFormData, refereeFirstName: val })}
                              required={gameFormData.addReferee && gameFormData.refereeMode === 'new'}
                            />
                            <Input
                              label="Last Name"
                              value={gameFormData.refereeLastName}
                              onChange={(val) => setGameFormData({ ...gameFormData, refereeLastName: val })}
                              required={gameFormData.addReferee && gameFormData.refereeMode === 'new'}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <Input
                              label="Email"
                              type="email"
                              value={gameFormData.refereeEmail}
                              onChange={(val) => setGameFormData({ ...gameFormData, refereeEmail: val })}
                              required={gameFormData.addReferee && gameFormData.refereeMode === 'new'}
                            />
                            <Input
                              label="Phone"
                              value={gameFormData.refereePhone}
                              onChange={(val) => setGameFormData({ ...gameFormData, refereePhone: val })}
                              required={gameFormData.addReferee && gameFormData.refereeMode === 'new'}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <Input
                              label="Country"
                              value={gameFormData.refereeCountry}
                              onChange={(val) => setGameFormData({ ...gameFormData, refereeCountry: val })}
                              required={gameFormData.addReferee && gameFormData.refereeMode === 'new'}
                            />
                            <Input
                              label="City"
                              value={gameFormData.refereeCity}
                              onChange={(val) => setGameFormData({ ...gameFormData, refereeCity: val })}
                              required={gameFormData.addReferee && gameFormData.refereeMode === 'new'}
                            />
                          </div>
                          <Input
                            label="License ID"
                            value={gameFormData.refereeLicense}
                            onChange={(val) => setGameFormData({ ...gameFormData, refereeLicense: val })}
                            required={gameFormData.addReferee && gameFormData.refereeMode === 'new'}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Sponsor Section */}
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={gameFormData.addSponsor}
                      onChange={(e) => setGameFormData({ ...gameFormData, addSponsor: e.target.checked })}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <label style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                      onClick={() => setGameFormData({ ...gameFormData, addSponsor: !gameFormData.addSponsor })}>
                      Add Sponsor
                    </label>
                  </div>

                  {gameFormData.addSponsor && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <Select
                        label="Sponsor Selection"
                        value={gameFormData.sponsorMode}
                        onChange={(val) => setGameFormData({ ...gameFormData, sponsorMode: val as 'existing' | 'new' })}
                        options={[
                          { value: 'existing', label: 'Select Existing Sponsor' },
                          { value: 'new', label: 'Create New Sponsor' },
                        ]}
                      />
                      {gameFormData.sponsorMode === 'existing' ? (
                        <Select
                          label={`Existing Sponsor (${allSponsors.length} available)`}
                          value={gameFormData.existingSponsor}
                          onChange={(val) => setGameFormData({ ...gameFormData, existingSponsor: val })}
                          options={[
                            { value: '', label: allSponsors.length === 0 ? 'No sponsors available - create a new one' : 'Select sponsor...' },
                            ...allSponsors.map(s => ({
                              value: s.id_Remejas.toString(),
                              label: `${s.pavadinimas} (${s.remejo_klase})`
                            }))
                          ]}
                          required={gameFormData.addSponsor && gameFormData.sponsorMode === 'existing'}
                        />
                      ) : (
                        <>
                          <Input
                            label="Sponsor Name"
                            value={gameFormData.sponsorName}
                            onChange={(val) => setGameFormData({ ...gameFormData, sponsorName: val })}
                            required={gameFormData.addSponsor && gameFormData.sponsorMode === 'new'}
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <Input
                              label="Sponsor Email"
                              type="email"
                              value={gameFormData.sponsorEmail}
                              onChange={(val) => setGameFormData({ ...gameFormData, sponsorEmail: val })}
                              required={gameFormData.addSponsor && gameFormData.sponsorMode === 'new'}
                            />
                            <Input
                              label="Website (optional)"
                              value={gameFormData.sponsorWebsite}
                              onChange={(val) => setGameFormData({ ...gameFormData, sponsorWebsite: val })}
                            />
                          </div>
                          <Select
                            label="Sponsor Class"
                            value={gameFormData.sponsorClass}
                            onChange={(val) => setGameFormData({ ...gameFormData, sponsorClass: val })}
                            options={[
                              { value: 'Auksinis', label: 'Gold (Auksinis)' },
                              { value: 'Sidabrinis', label: 'Silver (Sidabrinis)' },
                              { value: 'Bronzinis', label: 'Bronze (Bronzinis)' },
                            ]}
                            required={gameFormData.addSponsor && gameFormData.sponsorMode === 'new'}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={gameFormData.addLocation}
                      onChange={(e) => setGameFormData({ ...gameFormData, addLocation: e.target.checked })}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <label style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                      onClick={() => setGameFormData({ ...gameFormData, addLocation: !gameFormData.addLocation })}>
                      Add Venue
                    </label>
                  </div>

                  {gameFormData.addLocation && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <Select
                        label="Venue Selection"
                        value={gameFormData.locationMode}
                        onChange={(val) => setGameFormData({ ...gameFormData, locationMode: val as 'existing' | 'new' })}
                        options={[
                          { value: 'existing', label: 'Select Existing Venue' },
                          { value: 'new', label: 'Create New Venue' },
                        ]}
                      />
                      {gameFormData.locationMode === 'existing' ? (
                        <Select
                          label={`Existing Venue (${allLocations.length} available)`}
                          value={gameFormData.existingLocation}
                          onChange={(val) => setGameFormData({ ...gameFormData, existingLocation: val })}
                          options={[
                            { value: '', label: allLocations.length === 0 ? 'No venues available - create a new one' : 'Select venue...' },
                            ...allLocations.map(l => ({
                              value: l.id_Vieta.toString(),
                              label: `${l.adresas}, ${l.miestas}, ${l.salis}`
                            }))
                          ]}
                          required={gameFormData.addLocation && gameFormData.locationMode === 'existing'}
                        />
                      ) : (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <Input
                              label="Country"
                              value={gameFormData.locationCountry}
                              onChange={(val) => setGameFormData({ ...gameFormData, locationCountry: val })}
                              required={gameFormData.addLocation && gameFormData.locationMode === 'new'}
                            />
                            <Input
                              label="City"
                              value={gameFormData.locationCity}
                              onChange={(val) => setGameFormData({ ...gameFormData, locationCity: val })}
                              required={gameFormData.addLocation && gameFormData.locationMode === 'new'}
                            />
                          </div>
                          <Input
                            label="Address"
                            value={gameFormData.locationAddress}
                            onChange={(val) => setGameFormData({ ...gameFormData, locationAddress: val })}
                            required={gameFormData.addLocation && gameFormData.locationMode === 'new'}
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <Input
                              label="Coordinates"
                              value={gameFormData.locationCoordinates}
                              onChange={(val) => setGameFormData({ ...gameFormData, locationCoordinates: val })}
                              required={gameFormData.addLocation && gameFormData.locationMode === 'new'}
                            />
                            <Input
                              label="Number of Seats"
                              value={gameFormData.locationSeats}
                              onChange={(val) => setGameFormData({ ...gameFormData, locationSeats: val })}
                              required={gameFormData.addLocation && gameFormData.locationMode === 'new'}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <Input
                              label="Facility Type"
                              value={gameFormData.locationFacilityType}
                              onChange={(val) => setGameFormData({ ...gameFormData, locationFacilityType: val })}
                              required={gameFormData.addLocation && gameFormData.locationMode === 'new'}
                            />
                            <Input
                              label="Description"
                              value={gameFormData.locationDescription}
                              onChange={(val) => setGameFormData({ ...gameFormData, locationDescription: val })}
                              required={gameFormData.addLocation && gameFormData.locationMode === 'new'}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Game'}
                  </Button>
                  <Button variant="secondary" onClick={() => setIsCreatingGame(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {games.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No games yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {games.map(game => (
                <Card key={game.id_Varzybos} onClick={() => router.push(`/games/${game.id_Varzybos}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{game.pavadinimas}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {game.pradžia} - {game.pabaiga}
                      </p>
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
              {participants.map(participant => {
                const displayName = participant.dalyvio_tipas === 'Team'
                  ? participant.komanda_pavadinimas || 'Unknown Team'
                  : `${participant.klientas_vardas || 'Unknown'} ${participant.klientas_pavarde || ''}`;
                return (
                  <Card key={participant.id_Turnyro_dalyvis}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                          {participant.dalyvio_tipas}: {displayName}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Points: {participant.taskai}</p>
                      </div>
                      {participant.pozicija > 0 && (
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Position: {participant.pozicija}</p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailPage;
