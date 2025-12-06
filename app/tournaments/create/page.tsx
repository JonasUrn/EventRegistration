'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Message from '../../components/Message';
import { authStorage } from '../../lib/auth';
import { api, ApiError } from '../../lib/api';

const CreateTournamentPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!authStorage.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const userData = await api.users.getCurrentUser();
        setCurrentUser(userData);

        if (!userData.organizatorius && !userData.administratorius) {
          router.push('/tournaments');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        authStorage.logout();
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  if (!currentUser) {
    return null;
  }

  if (!currentUser.organizatorius && !currentUser.administratorius) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (formData.minParticipants > formData.maxParticipants) {
      setMessage({ type: 'error', text: 'Minimum participants cannot exceed maximum participants' });
      setIsLoading(false);
      return;
    }

    try {
      const newTournament = await api.tournaments.create({
        pavadinimas: formData.name,
        aprasas: formData.description,
        sporto_saka: formData.typeOfSport,
        pradzia: formData.start,
        pabaiga: formData.end,
        minimalus_nariu_skacius: formData.minParticipants,
        maksimalus_nariu_skaicius: formData.maxParticipants,
        turnyro_formatas: formData.format,
        fk_Klientasid_Klientas: currentUser.id_Klientas,
      });

      setMessage({ type: 'success', text: 'Tournament created successfully!' });
      setTimeout(() => router.push(`/tournaments/${newTournament.id_Turnyras}`), 1500);
    } catch (error: any) {
      console.error('Tournament creation error:', error);
      let errorMessage = 'Failed to create tournament';

      if (typeof error.message === 'string') {
        errorMessage = error.message;
      } else if (error.detail) {
        if (typeof error.detail === 'string') {
          errorMessage = error.detail;
        } else if (Array.isArray(error.detail)) {
          errorMessage = error.detail.map((e: any) => e.msg).join(', ');
        }
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
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

        <form onSubmit={handleSubmit} className="border border-gray-700 bg-gray-800 rounded-2xl shadow-2xl p-10 flex flex-col gap-6">
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Tournament'}
            </Button>
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
