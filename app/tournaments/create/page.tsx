'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Message from '../../components/Message';
import { getCurrentUser, tournaments } from '../../data';

const CreateTournamentPage = () => {
  const router = useRouter();
  const currentUser = getCurrentUser();

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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!currentUser.isOrganizer && !currentUser.isAdministrator) {
      router.push('/tournaments');
    }
  }, [currentUser, router]);

  if (!currentUser || (!currentUser.isOrganizer && !currentUser.isAdministrator)) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.minParticipants > formData.maxParticipants) {
      setMessage({ type: 'error', text: 'Minimum participants cannot exceed maximum participants' });
      return;
    }

    const newTournament = {
      id: String(tournaments.length + 1),
      ...formData,
      creatorId: currentUser.id,
    };

    tournaments.push(newTournament);

    setMessage({ type: 'success', text: 'Tournament created successfully!' });
    setTimeout(() => router.push(`/tournaments/${newTournament.id}`), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-white">Create Tournament</h1>

        {message && (
          <div className="mb-4">
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <form onSubmit={handleSubmit} className="border border-gray-700 bg-gray-800 rounded-2xl shadow-2xl p-10 flex flex-col gap-4">
          <Input
            label="Tournament Name"
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
            <Button type="submit">Create Tournament</Button>
            <Button variant="secondary" onClick={() => router.push('/tournaments')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTournamentPage;
