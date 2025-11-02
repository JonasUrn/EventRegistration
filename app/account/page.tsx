'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Message from '../components/Message';
import Card from '../components/Card';
import { getCurrentUser, setCurrentUser, users, teamMemberships, teams } from '../data';

const AccountPage = () => {
  const router = useRouter();
  const currentUser = getCurrentUser();

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNo: '',
    birthDate: '',
    sex: '',
    country: '',
    city: '',
  });

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setFormData({
      name: currentUser.name,
      surname: currentUser.surname,
      email: currentUser.email,
      phoneNo: currentUser.phoneNo,
      birthDate: currentUser.birthDate,
      sex: currentUser.sex,
      country: currentUser.country,
      city: currentUser.city,
    });
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  const userTeams = teamMemberships
    .filter(tm => tm.userId === currentUser.id)
    .map(tm => {
      const team = teams.find(t => t.id === tm.teamId);
      return { membership: tm, team };
    })
    .filter(item => item.team);

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...formData };
      setCurrentUser(users[userIndex]);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
        setCurrentUser(null);
        router.push('/login');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser.name,
      surname: currentUser.surname,
      email: currentUser.email,
      phoneNo: currentUser.phoneNo,
      birthDate: currentUser.birthDate,
      sex: currentUser.sex,
      country: currentUser.country,
      city: currentUser.city,
    });
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-white">My Account</h1>

        {message && (
          <div className="mb-4">
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <div className="border border-gray-700 bg-gray-800 rounded-2xl shadow-2xl p-10 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Profile Information</h2>
            {!isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleEdit}>Edit</Button>
                <Button variant="danger" onClick={handleDelete}>Delete Account</Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(val) => setFormData({ ...formData, name: val })}
                  required
                />
                <Input
                  label="Surname"
                  value={formData.surname}
                  onChange={(val) => setFormData({ ...formData, surname: val })}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(val) => setFormData({ ...formData, email: val })}
                required
              />

              <Input
                label="Phone Number"
                value={formData.phoneNo}
                onChange={(val) => setFormData({ ...formData, phoneNo: val })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Birth Date"
                  type="date"
                  value={formData.birthDate}
                  onChange={(val) => setFormData({ ...formData, birthDate: val })}
                  required
                />
                <Select
                  label="Sex"
                  value={formData.sex}
                  onChange={(val) => setFormData({ ...formData, sex: val })}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                  ]}
                  required
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
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-300">{currentUser.name} {currentUser.surname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-medium text-gray-300">{currentUser.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-300">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-300">{currentUser.phoneNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Birth Date</p>
                <p className="font-medium text-gray-300">{currentUser.birthDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sex</p>
                <p className="font-medium text-gray-300">{currentUser.sex}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium text-gray-300">{currentUser.city}, {currentUser.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-300">
                  {currentUser.isAdministrator ? 'Administrator' : currentUser.isOrganizer ? 'Organizer' : 'User'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6 text-white">My Teams</h2>
          {userTeams.length === 0 ? (
            <p className="text-gray-400">You are not part of any teams yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {userTeams.map(({ membership, team }) => (
                <Card key={membership.id} onClick={() => router.push(`/teams/${team!.id}`)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white">{team!.name}</h3>
                      <p className="text-sm text-gray-400">{membership.role} since {membership.memberSince}</p>
                    </div>
                    <p className="text-sm text-gray-400">{team!.city}, {team!.country}</p>
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

export default AccountPage;
