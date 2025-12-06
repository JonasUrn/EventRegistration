'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Message from '../../components/Message';
import { authStorage } from '../../lib/auth';
import { api } from '../../lib/api';

const CreateTeamPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    city: '',
    logoUrl: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!authStorage.isAuthenticated()) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const currentUser = authStorage.getCurrentUser();

      if (!currentUser || !currentUser.id) {
        throw new Error('Please log in again to create a team');
      }

      const newTeam = await api.teams.create({
        pavadinimas: formData.name,
        aprasymas: formData.description,
        salis: formData.country,
        miestas: formData.city,
        logo_url: formData.logoUrl || null,
        fk_Klientasid_Klientas: currentUser.id,
      });

      await api.teams.addMember({
        fk_Komandaid_Komanda: newTeam.id_Komanda,
        fk_Klientasid_Klientas: currentUser.id,
        role: 'Captain',
      });

      setMessage({ type: 'success', text: 'Team created successfully!' });
      setTimeout(() => router.push(`/teams/${newTeam.id_Komanda}`), 1500);
    } catch (error: any) {
      console.error('Team creation error:', error);
      let errorMessage = 'Failed to create team';

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
        <h1 className="text-3xl font-bold mb-8 text-white">Create Team</h1>

        {message && (
          <div className="mb-4">
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <form onSubmit={handleSubmit} className="border border-gray-700 bg-gray-800 rounded-2xl shadow-2xl p-10 flex flex-col gap-6">
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
            <p></p>
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
            <Button type="submit">{isLoading ? 'Creating...' : 'Create Team'}</Button>
            <Button variant="secondary" onClick={() => router.push('/teams')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamPage;
