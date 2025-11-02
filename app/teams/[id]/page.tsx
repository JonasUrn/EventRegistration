'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Message from '../../components/Message';
import Card from '../../components/Card';
import { getCurrentUser, teams, teamMemberships, users } from '../../data';

const TeamDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const currentUser = getCurrentUser();

  const [team, setTeam] = useState(teams.find(t => t.id === resolvedParams.id));
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    city: '',
  });
  const [newMemberUsername, setNewMemberUsername] = useState('');

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!team) {
      router.push('/teams');
      return;
    }

    setFormData({
      name: team.name,
      description: team.description,
      country: team.country,
      city: team.city,
    });
  }, [currentUser, team, router]);

  if (!currentUser || !team) {
    return null;
  }

  const isCaptain = team.captainId === currentUser.id;

  const members = teamMemberships
    .filter(tm => tm.teamId === team.id)
    .map(tm => {
      const user = users.find(u => u.id === tm.userId);
      return { membership: tm, user };
    })
    .filter(item => item.user);

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const teamIndex = teams.findIndex(t => t.id === team.id);
    if (teamIndex !== -1) {
      teams[teamIndex] = { ...teams[teamIndex], ...formData };
      setTeam(teams[teamIndex]);
      setMessage({ type: 'success', text: 'Team updated successfully!' });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this team? This cannot be undone.')) {
      const teamIndex = teams.findIndex(t => t.id === team.id);
      if (teamIndex !== -1) {
        teams.splice(teamIndex, 1);

        const membershipIndicesToRemove: number[] = [];
        teamMemberships.forEach((tm, index) => {
          if (tm.teamId === team.id) {
            membershipIndicesToRemove.push(index);
          }
        });

        for (let i = membershipIndicesToRemove.length - 1; i >= 0; i--) {
          teamMemberships.splice(membershipIndicesToRemove[i], 1);
        }

        router.push('/teams');
      }
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();

    const userToAdd = users.find(u => u.username === newMemberUsername);

    if (!userToAdd) {
      setMessage({ type: 'error', text: 'User not found' });
      return;
    }

    const existingMembership = teamMemberships.find(
      tm => tm.teamId === team.id && tm.userId === userToAdd.id
    );

    if (existingMembership) {
      setMessage({ type: 'error', text: 'User is already a member of this team' });
      return;
    }

    const newMembership = {
      id: String(teamMemberships.length + 1),
      userId: userToAdd.id,
      teamId: team.id,
      role: 'Player',
      memberSince: new Date().toISOString().split('T')[0],
    };

    teamMemberships.push(newMembership);
    setMessage({ type: 'success', text: 'Member added successfully!' });
    setNewMemberUsername('');
    setIsAddingMember(false);
  };

  const handleRemoveMember = (membershipId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      const membershipIndex = teamMemberships.findIndex(tm => tm.id === membershipId);
      if (membershipIndex !== -1) {
        teamMemberships.splice(membershipIndex, 1);
        setMessage({ type: 'success', text: 'Member removed successfully!' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">{team.name}</h1>
          {isCaptain && !isEditing && (
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

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  rows={4}
                />
              </div>

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
                <p className="text-gray-300">{team.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-gray-300">{team.city}, {team.country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-gray-300">{team.created}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Team Members</h2>
            {isCaptain && !isAddingMember && (
              <Button onClick={() => setIsAddingMember(true)}>Add Member</Button>
            )}
          </div>

          {isAddingMember && (
            <form onSubmit={handleAddMember} className="border border-gray-700 bg-gray-800 rounded-xl shadow-lg p-6 mb-4">
              <Input
                label="Username"
                value={newMemberUsername}
                onChange={setNewMemberUsername}
                placeholder="Enter username"
                required
              />
              <div className="flex gap-2 mt-4">
                <Button type="submit">Add</Button>
                <Button variant="secondary" onClick={() => { setIsAddingMember(false); setNewMemberUsername(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="flex flex-col gap-4">
            {members.map(({ membership, user }) => (
              <Card key={membership.id}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white">{user!.name} {user!.surname}</p>
                    <p className="text-sm text-gray-400">@{user!.username} - {membership.role}</p>
                    <p className="text-xs text-gray-500">Member since {membership.memberSince}</p>
                  </div>
                  {isCaptain && membership.role !== 'Captain' && (
                    <Button variant="danger" onClick={() => handleRemoveMember(membership.id)}>
                      Remove
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailPage;
