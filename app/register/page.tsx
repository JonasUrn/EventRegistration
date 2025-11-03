'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/Input';
import Button from '../components/Button';
import Select from '../components/Select';
import Message from '../components/Message';
import { users } from '../data';
import styles from '../layout.module.css';

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNo: '',
    birthDate: '',
    sex: '',
    username: '',
    password: '',
    country: '',
    city: '',
    isOrganizer: false,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const existingUser = users.find(u => u.username === formData.username || u.email === formData.email);

    if (existingUser) {
      setMessage({ type: 'error', text: 'Username or email already exists' });
      return;
    }

    const newUser = {
      id: String(users.length + 1),
      ...formData,
      isAdministrator: false,
      emailWasVerified: false,
    };

    users.push(newUser);
    setMessage({ type: 'success', text: 'Registration successful! Redirecting to login...' });
    setTimeout(() => router.push('/login'), 2000);
  };

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} ${styles.authCardWide}`}>
        <h1 className={styles.authTitle}>Register</h1>

        {message && (
          <div className={styles.messageWrapper}>
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.gridTwoColumns}>
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

          <div className={styles.gridTwoColumns}>
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

          <Input
            label="Username"
            value={formData.username}
            onChange={(val) => setFormData({ ...formData, username: val })}
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(val) => setFormData({ ...formData, password: val })}
            required
          />

          <div className={styles.gridTwoColumns}>
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

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.isOrganizer}
              onChange={(e) => setFormData({ ...formData, isOrganizer: e.target.checked })}
            />
            Register as Organizer
          </label>

          <div className={styles.buttonGroup}>
            <Button type="submit">Register</Button>
            <Button variant="secondary" onClick={() => router.push('/login')}>
              Back to Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
