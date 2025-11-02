'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Message from '../../components/Message';
import { getCurrentUser, teams, teamMemberships } from '../../data';

const CreateTeamPage = () => {
  const router = useRouter();
  const currentUser = getCurrentUser();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    city: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const existingTeam = teams.find(t => t.name === formData.name);

    if (existingTeam) {
      setMessage({ type: 'error', text: 'Team name already exists' });
      return;
    }

    const newTeamId = String(teams.length + 1);
    const newTeam = {
      id: newTeamId,
      name: formData.name,
      logoLink: '/logos/default.png',
      created: new Date().toISOString().split('T')[0],
      description: formData.description,
      country: formData.country,
      city: formData.city,
      captainId: currentUser.id,
    };

    teams.push(newTeam);

    const newMembership = {
      id: String(teamMemberships.length + 1),
      userId: currentUser.id,
      teamId: newTeamId,
      role: 'Captain',
      memberSince: new Date().toISOString().split('T')[0],
    };

    teamMemberships.push(newMembership);

    setMessage({ type: 'success', text: 'Team created successfully!' });
    setTimeout(() => router.push(`/teams/${newTeamId}`), 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create Team</h1>

        {message && (
          <div className="mb-4">
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <form onSubmit={handleSubmit} className="border border-black p-6 flex flex-col gap-4">
          <Input
            label="Team Name"
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
            <Button type="submit">Create Team</Button>
            <Button variant="secondary" onClick={() => router.push('/teams')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamPage;
