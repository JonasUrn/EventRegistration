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

const TeamDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [membersWithDetails, setMembersWithDetails] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [suggestedMembers, setSuggestedMembers] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    city: '',
    logoUrl: '',
  });
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!authStorage.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const userData = await api.users.getCurrentUser();
        setCurrentUser(userData);

        const teamData = await api.teams.getById(parseInt(resolvedParams.id));
        setTeam(teamData);

        const membersData = await api.teams.getMembers(parseInt(resolvedParams.id));
        setMembers(membersData);

        const membersWithUserData = await Promise.all(
          membersData.map(async (member: any) => {
            try {
              const userDetails = await api.users.getUserById(member.fk_Klientasid_Klientas);
              return {
                ...member,
                userDetails: userDetails || null,
              };
            } catch (error) {
              console.error('Failed to fetch user details:', error);
              return {
                ...member,
                userDetails: null,
              };
            }
          })
        );
        setMembersWithDetails(membersWithUserData);

        setFormData({
          name: teamData.pavadinimas,
          description: teamData.aprasymas || '',
          country: teamData.salis,
          city: teamData.miestas,
          logoUrl: teamData.logo_url || '',
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push('/teams');
      }
    };

    fetchData();
  }, [resolvedParams.id, router]);

  if (!currentUser || !team) {
    return null;
  }

  const isOwnerOrAdmin = team.fk_Klientasid_Klientas === currentUser.id_Klientas || currentUser.administratorius;

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await api.teams.update(team.id_Komanda, {
        pavadinimas: formData.name,
        aprasymas: formData.description,
        salis: formData.country,
        miestas: formData.city,
        logo_url: formData.logoUrl || null,
        fk_Klientasid_Klientas: team.fk_Klientasid_Klientas,
      });

      const updatedTeam = await api.teams.getById(team.id_Komanda);
      setTeam(updatedTeam);
      setMessage({ type: 'success', text: 'Team updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update team:', error);
      setMessage({ type: 'error', text: 'Failed to update team' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this team? This cannot be undone.')) {
      try {
        await api.teams.delete(team.id_Komanda);
        router.push('/teams');
      } catch (error) {
        console.error('Failed to delete team:', error);
        setMessage({ type: 'error', text: 'Failed to delete team' });
      }
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Search for user by username
      const user = await api.users.getUserByUsername(newMemberUsername);

      await api.teams.addMember({
        fk_Komandaid_Komanda: team.id_Komanda,
        fk_Klientasid_Klientas: user.id_Klientas,
        role: 'Player',
      });

      const membersData = await api.teams.getMembers(team.id_Komanda);
      setMembers(membersData);

      const membersWithUserData = await Promise.all(
        membersData.map(async (member: any) => {
          try {
            const userDetails = await api.users.getUserById(member.fk_Klientasid_Klientas);
            return {
              ...member,
              userDetails: userDetails || null,
            };
          } catch (error) {
            console.error('Failed to fetch user details:', error);
            return {
              ...member,
              userDetails: null,
            };
          }
        })
      );
      setMembersWithDetails(membersWithUserData);

      setMessage({ type: 'success', text: 'Member added successfully!' });
      setNewMemberUsername('');
      setIsAddingMember(false);
    } catch (error) {
      console.error('Failed to add member:', error);
      if (error instanceof ApiError && error.status === 404) {
        setMessage({ type: 'error', text: 'User not found. Please check the username.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to add member' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (membershipId: number) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        await api.teams.removeMember(membershipId);
        const membersData = await api.teams.getMembers(team.id_Komanda);
        setMembers(membersData);

        const membersWithUserData = await Promise.all(
          membersData.map(async (member: any) => {
            try {
              const userDetails = await api.users.getUserById(member.fk_Klientasid_Klientas);
              return {
                ...member,
                userDetails: userDetails || null,
              };
            } catch (error) {
              console.error('Failed to fetch user details:', error);
              return {
                ...member,
                userDetails: null,
              };
            }
          })
        );
        setMembersWithDetails(membersWithUserData);

        setMessage({ type: 'success', text: 'Member removed successfully!' });
      } catch (error) {
        console.error('Failed to remove member:', error);
        setMessage({ type: 'error', text: 'Failed to remove member' });
      }
    }
  };

  const handleOfferMembers = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const suggestions = await api.teams.offerMembers(team.id_Komanda);
      setSuggestedMembers(suggestions);
      setShowSuggestions(true);
      setMessage({ type: 'success', text: `Found ${suggestions.length} suggested members!` });
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      setMessage({ type: 'error', text: 'Failed to get member suggestions' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestedMember = async (userId: number) => {
    setIsLoading(true);
    setMessage(null);

    try {
      await api.teams.addMember({
        fk_Komandaid_Komanda: team.id_Komanda,
        fk_Klientasid_Klientas: userId,
        role: 'Player',
      });

      const membersData = await api.teams.getMembers(team.id_Komanda);
      setMembers(membersData);

      const membersWithUserData = await Promise.all(
        membersData.map(async (member: any) => {
          try {
            const userDetails = await api.users.getUserById(member.fk_Klientasid_Klientas);
            return {
              ...member,
              userDetails: userDetails || null,
            };
          } catch (error) {
            console.error('Failed to fetch user details:', error);
            return {
              ...member,
              userDetails: null,
            };
          }
        })
      );
      setMembersWithDetails(membersWithUserData);

      setSuggestedMembers(suggestedMembers.filter(m => m.id_Klientas !== userId));
      setMessage({ type: 'success', text: 'Member added successfully!' });
    } catch (error) {
      console.error('Failed to add suggested member:', error);
      setMessage({ type: 'error', text: 'Failed to add member' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {team.logo_url && (
              <img
                src={team.logo_url}
                alt={`${team.pavadinimas} logo`}
                className="w-16 h-16 object-contain rounded-lg"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <h1 className="text-3xl font-bold text-white">{team.pavadinimas}</h1>
          </div>
          {isOwnerOrAdmin && !isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleEdit}>Edit</Button>
              <Button variant="danger" onClick={handleDelete}>Delete Team</Button>
            </div>
          )}
        </div>

        {message && (
          <div className="mb-4">
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <div className="border border-gray-700 bg-gray-800 rounded-2xl shadow-2xl p-10 mb-8">
          {isEditing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <Input
                label="Team Name"
                value={formData.name}
                onChange={(val) => setFormData({ ...formData, name: val })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Country"
                  value={formData.country}
                  onChange={(val) => setFormData({ ...formData, country: val })}
                  required
                />

                <Input
                  label="City"
                  value={formData.city}
                  onChange={(val) => setFormData({ ...formData, city: val })}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  rows={4}
                />
              </div>

              <Input
                label="Logo URL (optional)"
                value={formData.logoUrl}
                onChange={(val) => setFormData({ ...formData, logoUrl: val })}
                placeholder="https://example.com/logo.png"
              />

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
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-300">{team.aprasymas || 'No description'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-gray-300">{team.miestas}, {team.salis}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-gray-300">{team.sukurta}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Team Members ({members.length})</h2>
            {isOwnerOrAdmin && !isAddingMember && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button onClick={() => setIsAddingMember(true)}>Add Member</Button>
                <Button onClick={handleOfferMembers} disabled={isLoading}>Offer Team Members</Button>
              </div>
            )}
          </div>

          {isAddingMember && (
            <form onSubmit={handleAddMember} className="border border-gray-700 bg-gray-800 rounded-xl shadow-lg p-6 mb-4">
              <Input
                label="Username"
                value={newMemberUsername}
                onChange={setNewMemberUsername}
                placeholder="Enter username"
                type="text"
                required
              />
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add'}
                </Button>
                <Button variant="secondary" onClick={() => { setIsAddingMember(false); setNewMemberUsername(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {showSuggestions && suggestedMembers.length > 0 && (
            <div className="border-2 border-blue-500 bg-gradient-to-br from-blue-900/20 to-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-blue-500/30">
                <div>
                  <h3 className="text-xl font-bold text-white">Suggested Members</h3>
                  <p className="text-sm text-gray-400 mt-1">Based on location, age, and tournament performance</p>
                </div>
                <Button variant="secondary" onClick={() => setShowSuggestions(false)}>Close</Button>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {suggestedMembers.map((candidate) => (
                  <Card key={candidate.id_Klientas}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-lg">{candidate.vardas} {candidate.pavarde}</p>
                        <p className="text-sm text-gray-400 mt-1">@{candidate.slapyvardis}</p>
                        <p className="text-sm text-gray-400">{candidate.el_pastas}</p>
                        <p className="text-xs text-gray-500 mt-1">{candidate.miestas}, {candidate.salis}</p>
                        <p className="text-xs text-green-400 mt-2 font-semibold">Match Score: {candidate.score}</p>
                      </div>
                      <Button onClick={() => handleAddSuggestedMember(candidate.id_Klientas)} disabled={isLoading}>
                        Add to Team
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {membersWithDetails.length === 0 ? (
              <p className="text-gray-400">No members yet</p>
            ) : (
              membersWithDetails.map((membership) => (
                <Card key={membership.id_Komandos_naryste}>
                  <div className="flex justify-between items-center">
                    <div>
                      {membership.userDetails ? (
                        <>
                          <p className="font-bold text-white text-lg">{membership.userDetails.vardas} {membership.userDetails.pavarde}</p>
                          <p className="text-sm text-gray-400 mt-1">@{membership.userDetails.slapyvardis}</p>
                          <p className="text-sm text-gray-400">{membership.role}</p>
                          <p className="text-xs text-gray-500 mt-1">Member since {membership.narys_nuo}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-white">User ID: {membership.fk_Klientasid_Klientas}</p>
                          <p className="text-sm text-gray-400">{membership.role}</p>
                          <p className="text-xs text-gray-500">Member since {membership.narys_nuo}</p>
                        </>
                      )}
                    </div>
                    {isOwnerOrAdmin && membership.role !== 'Captain' && (
                      <Button variant="danger" onClick={() => handleRemoveMember(membership.id_Komandos_naryste)}>
                        Remove
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailPage;
