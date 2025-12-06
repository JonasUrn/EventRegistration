'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Message from '../components/Message';
import Card from '../components/Card';
import { authStorage } from '../lib/auth';
import { api, ApiError } from '../lib/api';
import layoutStyles from '../layout.module.css';
import styles from './account.module.css';

const AccountPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [captainTeams, setCaptainTeams] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMessage, setVerificationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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
    const fetchUser = async () => {
      if (!authStorage.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const userData = await api.users.getCurrentUser();
        setCurrentUser(userData);
        setFormData({
          name: userData.vardas,
          surname: userData.pavarde,
          email: userData.el_pastas,
          phoneNo: userData.tel_numeris,
          birthDate: userData.gimimo_data,
          sex: userData.lytis,
          country: userData.salis,
          city: userData.miestas,
        });

        // Fetch teams where user is captain
        const allTeams = await api.teams.getAll();
        const teamsWithCaptainRole = [];

        for (const team of allTeams) {
          try {
            const members = await api.teams.getMembers(team.id_Komanda);
            const isCaptain = members.some(
              (member: any) =>
                member.fk_Klientasid_Klientas === userData.id_Klientas &&
                member.role === 'Captain'
            );
            if (isCaptain) {
              teamsWithCaptainRole.push(team);
            }
          } catch (error) {
            console.error(`Failed to fetch members for team ${team.id_Komanda}:`, error);
          }
        }

        setCaptainTeams(teamsWithCaptainRole);
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

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      await api.users.updateAccount({
        vardas: formData.name,
        pavarde: formData.surname,
        tel_numeris: formData.phoneNo,
        salis: formData.country,
        miestas: formData.city,
      });

      const updatedUser = await api.users.getCurrentUser();
      setCurrentUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await api.users.deleteAccount();
      authStorage.logout();
      router.push('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error instanceof ApiError) {
        setMessage({ type: 'error', text: error.message || 'Failed to delete account' });
      } else {
        setMessage({ type: 'error', text: 'An error occurred while deleting your account' });
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser.vardas,
      surname: currentUser.pavarde,
      email: currentUser.el_pastas,
      phoneNo: currentUser.tel_numeris,
      birthDate: currentUser.gimimo_data,
      sex: currentUser.lytis,
      country: currentUser.salis,
      city: currentUser.miestas,
    });
    setIsEditing(false);
    setMessage(null);
  };

  const handleVerifyEmail = async () => {
    setIsSendingCode(true);
    setVerificationMessage(null);

    try {
      await api.auth.sendVerificationCode(currentUser.el_pastas);
      setShowVerificationModal(true);
      setVerificationCode('');
      setVerificationMessage({ type: 'success', text: 'Verification code sent to your email!' });
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to send verification code' });
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationMessage(null);

    try {
      await api.auth.verifyCode(currentUser.el_pastas, verificationCode);

      // Refresh user data from backend
      const updatedUser = await api.users.getCurrentUser();
      setCurrentUser(updatedUser);

      setVerificationMessage({ type: 'success', text: 'Email verified successfully!' });
      setTimeout(() => {
        setShowVerificationModal(false);
        setMessage({ type: 'success', text: 'Email verified successfully!' });
      }, 1500);
    } catch (error) {
      if (error instanceof ApiError) {
        setVerificationMessage({ type: 'error', text: error.message });
      } else {
        setVerificationMessage({ type: 'error', text: 'Invalid verification code. Please try again.' });
      }
    } finally {
      setIsVerifying(false);
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
                {!currentUser.patvirtintas_pastas && (
                  <Button onClick={handleVerifyEmail} disabled={isSendingCode}>
                    {isSendingCode ? 'Sending...' : 'Verify Email'}
                  </Button>
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
                <p className={styles.infoValue}>{currentUser.vardas} {currentUser.pavarde}</p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Username</p>
                <p className={styles.infoValue}>{currentUser.slapyvardis}</p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Email</p>
                <p className={styles.infoValue}>
                  {currentUser.el_pastas}
                  {currentUser.patvirtintas_pastas && <span style={{ color: 'var(--color-success)', marginLeft: '0.5rem' }}>✓ Verified</span>}
                </p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Phone</p>
                <p className={styles.infoValue}>{currentUser.tel_numeris}</p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Birth Date</p>
                <p className={styles.infoValue}>{currentUser.gimimo_data}</p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Sex</p>
                <p className={styles.infoValue}>{currentUser.lytis}</p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Location</p>
                <p className={styles.infoValue}>{currentUser.miestas}, {currentUser.salis}</p>
              </div>
              <div className={styles.infoField}>
                <p className={styles.infoLabel}>Role</p>
                <p className={styles.infoValue}>
                  {currentUser.administratorius ? 'Administrator' : currentUser.organizatorius ? 'Organizer' : 'User'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Teams Section */}
        <div className={styles.profileCard}>
          <h2 className={styles.profileTitle}>My Teams (Captain)</h2>
          {captainTeams.length === 0 ? (
            <p className={styles.noTeams}>You are not a captain of any teams.</p>
          ) : (
            <div className={styles.teamsGrid}>
              {captainTeams.map((team) => (
                <Card
                  key={team.id_Komanda}
                  onClick={() => router.push(`/teams/${team.id_Komanda}`)}
                >
                  <h3 className={styles.teamName}>{team.pavadinimas}</h3>
                  <p className={styles.teamLocation}>
                    {team.miestas}, {team.salis}
                  </p>
                  {team.aprasymas && (
                    <p className={styles.teamDescription}>{team.aprasymas}</p>
                  )}
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
                <Button variant="secondary" onClick={handleCloseModal} disabled={isVerifying}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isVerifying}>
                  {isVerifying ? 'Verifying...' : 'Verify'}
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
