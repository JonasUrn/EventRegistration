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

const GameDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [game, setGame] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantsWithDetails, setParticipantsWithDetails] = useState<any[]>([]);
  const [referees, setReferees] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [allSponsors, setAllSponsors] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingReferee, setIsAddingReferee] = useState(false);
  const [isAddingSponsor, setIsAddingSponsor] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<number | null>(null);
  const [similarGames, setSimilarGames] = useState<any[]>([]);
  const [showSimilarGames, setShowSimilarGames] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    start: '',
    end: '',
  });

  const [refereeFormData, setRefereeFormData] = useState({
    vardas: '',
    pavarde: '',
    el_pastas: '',
    salis: '',
    miestas: '',
    licenzijos_id: '',
    tel_numeris: '',
  });

  const [sponsorFormData, setSponsorFormData] = useState({
    selectedSponsor: '',
  });

  const [participantEditData, setParticipantEditData] = useState<{
    [key: number]: { taskai: number; yra_laimėtojas: boolean | null }
  }>({});

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

        // Fetch tournament participants to get user/team names
        const tournamentParticipantsData = await api.tournaments.getParticipants(gameData.fk_Turnyrasid_Turnyras);

        // Enrich game participants with tournament participant details
        const enrichedParticipants = await Promise.all(
          participantsData.map(async (participant: any) => {
            const tournamentParticipant = tournamentParticipantsData.find(
              (tp: any) => tp.id_Turnyro_dalyvis === participant.fk_Turnyro_dalyvisid_Turnyro_dalyvis
            );

            if (tournamentParticipant) {
              return {
                ...participant,
                displayName: tournamentParticipant.dalyvio_tipas === 'Team'
                  ? tournamentParticipant.komanda_pavadinimas || 'Unknown Team'
                  : `${tournamentParticipant.klientas_vardas || 'Unknown'} ${tournamentParticipant.klientas_pavarde || ''}`,
                participantType: tournamentParticipant.dalyvio_tipas
              };
            }

            return {
              ...participant,
              displayName: `Participant ID: ${participant.fk_Turnyro_dalyvisid_Turnyro_dalyvis}`,
              participantType: 'Unknown'
            };
          })
        );

        setParticipantsWithDetails(enrichedParticipants);

        // Fetch referees
        try {
          const refereesData = await api.games.getReferees(parseInt(resolvedParams.id));
          setReferees(refereesData);
        } catch (error) {
          console.error('Failed to fetch referees:', error);
        }

        // Fetch sponsors
        try {
          const sponsorsData = await api.games.getMatchSponsors(parseInt(resolvedParams.id));
          setSponsors(sponsorsData);
        } catch (error) {
          console.error('Failed to fetch sponsors:', error);
        }

        // Fetch all sponsors for dropdown
        try {
          const allSponsorsData = await api.games.getAllSponsors();
          setAllSponsors(allSponsorsData);
        } catch (error) {
          console.error('Failed to fetch all sponsors:', error);
        }

        setFormData({
          name: gameData.pavadinimas,
          start: gameData.pradžia,
          end: gameData.pabaiga,
        });

        // Initialize participant edit data
        const initialEditData: any = {};
        participantsData.forEach((p: any) => {
          initialEditData[p.id_Varzybu_dalyvis] = {
            taskai: p.taskai,
            yra_laimėtojas: p.yra_laimėtojas,
          };
        });
        setParticipantEditData(initialEditData);
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

  const handleAddReferee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await api.games.addReferee({
        ...refereeFormData,
        fk_Varzybosid_Varzybos: game.id_Varzybos,
      });

      const refereesData = await api.games.getReferees(game.id_Varzybos);
      setReferees(refereesData);

      setMessage({ type: 'success', text: 'Referee added successfully!' });
      setRefereeFormData({
        vardas: '',
        pavarde: '',
        el_pastas: '',
        salis: '',
        miestas: '',
        licenzijos_id: '',
        tel_numeris: '',
      });
      setIsAddingReferee(false);
    } catch (error) {
      console.error('Failed to add referee:', error);
      setMessage({ type: 'error', text: 'Failed to add referee' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await api.games.addMatchSponsor({
        fk_Varzybosid_Varzybos: game.id_Varzybos,
        fk_Remejasid_Remejas: parseInt(sponsorFormData.selectedSponsor),
      });

      const sponsorsData = await api.games.getMatchSponsors(game.id_Varzybos);
      setSponsors(sponsorsData);

      setMessage({ type: 'success', text: 'Sponsor added successfully!' });
      setSponsorFormData({ selectedSponsor: '' });
      setIsAddingSponsor(false);
    } catch (error) {
      console.error('Failed to add sponsor:', error);
      setMessage({ type: 'error', text: 'Failed to add sponsor' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateParticipant = async (participantId: number) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const data = participantEditData[participantId];
      await api.games.updateParticipant(participantId, {
        taskai: data.taskai,
        yra_laimėtojas: data.yra_laimėtojas,
      });

      const participantsData = await api.games.getParticipants(game.id_Varzybos);
      setParticipants(participantsData);

      // Refresh enriched participants data
      const tournamentParticipantsData = await api.tournaments.getParticipants(game.fk_Turnyrasid_Turnyras);
      const enrichedParticipants = await Promise.all(
        participantsData.map(async (participant: any) => {
          const tournamentParticipant = tournamentParticipantsData.find(
            (tp: any) => tp.id_Turnyro_dalyvis === participant.fk_Turnyro_dalyvisid_Turnyro_dalyvis
          );

          if (tournamentParticipant) {
            return {
              ...participant,
              displayName: tournamentParticipant.dalyvio_tipas === 'Team'
                ? tournamentParticipant.komanda_pavadinimas || 'Unknown Team'
                : `${tournamentParticipant.klientas_vardas || 'Unknown'} ${tournamentParticipant.klientas_pavarde || ''}`,
              participantType: tournamentParticipant.dalyvio_tipas
            };
          }

          return {
            ...participant,
            displayName: `Participant ID: ${participant.fk_Turnyro_dalyvisid_Turnyro_dalyvis}`,
            participantType: 'Unknown'
          };
        })
      );
      setParticipantsWithDetails(enrichedParticipants);

      setMessage({ type: 'success', text: 'Participant updated successfully!' });
      setEditingParticipant(null);
    } catch (error) {
      console.error('Failed to update participant:', error);
      setMessage({ type: 'error', text: 'Failed to update participant' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindSimilarGames = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const similar = await api.games.findSimilar(game.id_Varzybos);
      setSimilarGames(similar);
      setShowSimilarGames(true);
      setMessage({ type: 'success', text: `Found ${similar.length} similar games!` });
    } catch (error) {
      console.error('Failed to find similar games:', error);
      setMessage({ type: 'error', text: 'Failed to find similar games' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">{game.pavadinimas}</h1>
          <div className="flex gap-2">
            <Button onClick={handleFindSimilarGames} disabled={isLoading}>Find Similar Games</Button>
            {canManage && !isEditing && (
              <>
                <Button onClick={handleEdit}>Edit</Button>
                <Button variant="danger" onClick={handleDelete}>Delete Game</Button>
              </>
            )}
          </div>
        </div>

        {message && (
          <div className="mb-4">
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        {showSimilarGames && similarGames.length > 0 && (
          <div className="border-2 border-purple-500 bg-gradient-to-br from-purple-900/20 to-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-purple-500/30">
              <div>
                <h2 className="text-xl font-bold text-white">Similar Games</h2>
                <p className="text-sm text-gray-400 mt-1">Based on sport type, tournament format, and location</p>
              </div>
              <Button variant="secondary" onClick={() => setShowSimilarGames(false)}>Close</Button>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              {similarGames.map((similarGame) => (
                <Card key={similarGame.id_Varzybos} onClick={() => router.push(`/games/${similarGame.id_Varzybos}`)}>
                  <div className="flex justify-between items-center cursor-pointer hover:bg-gray-700/50 transition-colors p-2 rounded">
                    <div>
                      <p className="font-bold text-white text-lg">{similarGame.pavadinimas}</p>
                      <p className="text-sm text-gray-400 mt-1">{similarGame.pradžia} - {similarGame.pabaiga}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="border border-gray-700 bg-gray-800 rounded-2xl shadow-2xl p-10 mb-6">
          {isEditing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-6">
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
              <div>
                <p className="text-sm text-gray-600">Sport Type</p>
                <p className="text-gray-300">{tournament?.sporto_saka || 'Unknown'}</p>
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
          <h2 className="text-xl font-bold mb-4 text-white">Participants ({participantsWithDetails.length})</h2>
          {participantsWithDetails.length === 0 ? (
            <p className="text-gray-400">No participants yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {participantsWithDetails.map(participant => {
                const isEditingThis = editingParticipant === participant.id_Varzybu_dalyvis;
                return (
                  <Card key={participant.id_Varzybu_dalyvis}>
                    {isEditingThis && canManage ? (
                      <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-600 block mb-2">Points</label>
                            <input
                              type="number"
                              value={participantEditData[participant.id_Varzybu_dalyvis]?.taskai || 0}
                              onChange={(e) => setParticipantEditData({
                                ...participantEditData,
                                [participant.id_Varzybu_dalyvis]: {
                                  ...participantEditData[participant.id_Varzybu_dalyvis],
                                  taskai: parseInt(e.target.value) || 0,
                                }
                              })}
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 block mb-2">Winner</label>
                            <select
                              value={participantEditData[participant.id_Varzybu_dalyvis]?.yra_laimėtojas === null ? 'null' : participantEditData[participant.id_Varzybu_dalyvis]?.yra_laimėtojas?.toString() || 'false'}
                              onChange={(e) => {
                                const value = e.target.value === 'null' ? null : e.target.value === 'true';
                                setParticipantEditData({
                                  ...participantEditData,
                                  [participant.id_Varzybu_dalyvis]: {
                                    ...participantEditData[participant.id_Varzybu_dalyvis],
                                    yra_laimėtojas: value,
                                  }
                                });
                              }}
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            >
                              <option value="null">Not decided</option>
                              <option value="true">Winner</option>
                              <option value="false">Loser</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdateParticipant(participant.id_Varzybu_dalyvis)} disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                          </Button>
                          <Button variant="secondary" onClick={() => setEditingParticipant(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white">{participant.displayName}</p>
                          <p className="text-sm text-gray-400">{participant.participantType} • Points: {participant.taskai}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {participant.yra_laimėtojas !== null && (
                            <p className={`text-sm font-medium ${participant.yra_laimėtojas ? 'text-green-400' : 'text-red-400'}`}>
                              {participant.yra_laimėtojas ? 'Winner' : 'Loser'}
                            </p>
                          )}
                          {canManage && (
                            <Button variant="secondary" onClick={() => setEditingParticipant(participant.id_Varzybu_dalyvis)}>
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Referees Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Referees ({referees.length})</h2>
            {canManage && !isAddingReferee && (
              <Button onClick={() => setIsAddingReferee(true)}>Add Referee</Button>
            )}
          </div>

          {isAddingReferee && (
            <Card style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
              <form onSubmit={handleAddReferee} className="flex flex-col gap-6">
                <h3 className="font-bold text-white text-lg">Add New Referee</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={refereeFormData.vardas}
                    onChange={(val) => setRefereeFormData({ ...refereeFormData, vardas: val })}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={refereeFormData.pavarde}
                    onChange={(val) => setRefereeFormData({ ...refereeFormData, pavarde: val })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    value={refereeFormData.el_pastas}
                    onChange={(val) => setRefereeFormData({ ...refereeFormData, el_pastas: val })}
                    required
                  />
                  <Input
                    label="Phone"
                    value={refereeFormData.tel_numeris}
                    onChange={(val) => setRefereeFormData({ ...refereeFormData, tel_numeris: val })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Country"
                    value={refereeFormData.salis}
                    onChange={(val) => setRefereeFormData({ ...refereeFormData, salis: val })}
                    required
                  />
                  <Input
                    label="City"
                    value={refereeFormData.miestas}
                    onChange={(val) => setRefereeFormData({ ...refereeFormData, miestas: val })}
                    required
                  />
                </div>
                <Input
                  label="License ID"
                  value={refereeFormData.licenzijos_id}
                  onChange={(val) => setRefereeFormData({ ...refereeFormData, licenzijos_id: val })}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Referee'}
                  </Button>
                  <Button variant="secondary" onClick={() => setIsAddingReferee(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {referees.length === 0 ? (
            <p className="text-gray-400">No referees assigned yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {referees.map(referee => (
                <Card key={referee.id_Teisejas}>
                  <div>
                    <p className="font-bold text-white">{referee.vardas} {referee.pavarde}</p>
                    <p className="text-sm text-gray-400">{referee.el_pastas} • {referee.tel_numeris}</p>
                    <p className="text-sm text-gray-400">{referee.miestas}, {referee.salis} • License: {referee.licenzijos_id}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sponsors Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Sponsors ({sponsors.length})</h2>
            {canManage && !isAddingSponsor && (
              <Button onClick={() => setIsAddingSponsor(true)}>Add Sponsor</Button>
            )}
          </div>

          {isAddingSponsor && (
            <Card style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
              <form onSubmit={handleAddSponsor} className="flex flex-col gap-6">
                <h3 className="font-bold text-white text-lg">Add Sponsor</h3>
                <Select
                  label="Select Sponsor"
                  value={sponsorFormData.selectedSponsor}
                  onChange={(val) => setSponsorFormData({ selectedSponsor: val })}
                  options={[
                    { value: '', label: 'Select a sponsor...' },
                    ...allSponsors.map(s => ({
                      value: s.id_Remejas.toString(),
                      label: `${s.pavadinimas} (${s.remejo_klase})`
                    }))
                  ]}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading || !sponsorFormData.selectedSponsor}>
                    {isLoading ? 'Adding...' : 'Add Sponsor'}
                  </Button>
                  <Button variant="secondary" onClick={() => setIsAddingSponsor(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {sponsors.length === 0 ? (
            <p className="text-gray-400">No sponsors yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sponsors.map(sponsor => (
                <Card key={sponsor.id_Remejas}>
                  <div>
                    <p className="font-bold text-white">{sponsor.pavadinimas}</p>
                    <p className="text-sm text-gray-400">Class: {sponsor.remejo_klase}</p>
                    <p className="text-sm text-gray-400">{sponsor.el_pastas}</p>
                    {sponsor.el_puslapis && (
                      <a href={sponsor.el_puslapis} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">
                        {sponsor.el_puslapis}
                      </a>
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
