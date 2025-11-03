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
import layoutStyles from '../layout.module.css';
import styles from './account.module.css';

const AccountPage = () => {
  const router = useRouter();
  const currentUser = getCurrentUser();

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMessage, setVerificationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

  const handleVerifyEmail = () => {
    setShowVerificationModal(true);
    setVerificationCode('');
    setVerificationMessage(null);
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode === '676767') {
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].emailWasVerified = true;
        setCurrentUser(users[userIndex]);
      }
      setVerificationMessage({ type: 'success', text: 'Email verified successfully!' });
      setTimeout(() => {
        setShowVerificationModal(false);
        setMessage({ type: 'success', text: 'Email verified successfully!' });
      }, 1500);
    } else {
      setVerificationMessage({ type: 'error', text: 'Invalid verification code. Please try again.' });
    }
  };

  const handleCloseModal = () => {
    setShowVerificationModal(false);
    setVerificationCode('');
    setVerificationMessage(null);
  };

  return (
    <div className={layoutStyles.pageContainer}>
      <Navigation />

      <div className={layoutStyles.pageContentNarrow}>
        <h1 className={layoutStyles.pageTitle}>My Account</h1>

        {message && (
          <div className={layoutStyles.messageWrapper}>
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <h2 className={styles.profileTitle}>Profile Information</h2>
            {!isEditing && (
              <div className={styles.profileActions}>
                {!currentUser.emailWasVerified && (
                  <Button onClick={handleVerifyEmail}>Verify Email</Button>
                )}
                <Button variant="secondary" onClick={handleEdit}>Edit</Button>
                <Button variant="danger" onClick={handleDelete}>Delete Account</Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className={styles.profileForm}>
              <div className={styles.profileGrid}>
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

              <div className={styles.profileGrid}>
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

              <div className={styles.profileGrid}>
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

              <div className={styles.profileFormActions}>
                <Button type="submit">Save Changes</Button>
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Name</p>
                <p className={styles.infoValue}>{currentUser.name} {currentUser.surname}</p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Username</p>
                <p className={styles.infoValue}>{currentUser.username}</p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Email</p>
                <p className={styles.infoValue}>
                  {currentUser.email}
                  {currentUser.emailWasVerified && <span style={{ color: 'var(--color-success)', marginLeft: '0.5rem' }}>✓ Verified</span>}
                </p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Phone</p>
                <p className={styles.infoValue}>{currentUser.phoneNo}</p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Birth Date</p>
                <p className={styles.infoValue}>{currentUser.birthDate}</p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Sex</p>
                <p className={styles.infoValue}>{currentUser.sex}</p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Location</p>
                <p className={styles.infoValue}>{currentUser.city}, {currentUser.country}</p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Role</p>
                <p className={styles.infoValue}>
                  {currentUser.isAdministrator ? 'Administrator' : currentUser.isOrganizer ? 'Organizer' : 'User'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.teamsSection}>
          <h2 className={styles.teamsTitle}>My Teams</h2>
          {userTeams.length === 0 ? (
            <p className={styles.emptyMessage}>You are not part of any teams yet.</p>
          ) : (
            <div className={styles.teamsList}>
              {userTeams.map(({ membership, team }) => (
                <Card key={membership.id} onClick={() => router.push(`/teams/${team!.id}`)}>
                  <div className={styles.teamCard}>
                    <div className={styles.teamInfo}>
                      <h3>{team!.name}</h3>
                      <p>{membership.role} since {membership.memberSince}</p>
                    </div>
                    <p className={styles.teamLocation}>{team!.city}, {team!.country}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Verify Email</h2>
              <p className={styles.modalDescription}>
                Please enter the 6-digit verification code sent to your email address.
              </p>
            </div>

            {verificationMessage && (
              <div className={layoutStyles.messageWrapper}>
                <Message type={verificationMessage.type}>{verificationMessage.text}</Message>
              </div>
            )}

            <form onSubmit={handleVerificationSubmit}>
              <div className={styles.modalBody}>
                <input
                  type="text"
                  className={styles.codeInput}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  autoFocus
                />
              </div>

              <div className={styles.modalFooter}>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  Verify
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
