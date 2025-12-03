'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/Input';
import Button from '../components/Button';
import Message from '../components/Message';
import { api } from '../lib/api';
import styles from '../layout.module.css';

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await api.auth.login(username, password);
      setMessage({ type: 'success', text: 'Login successful!' });
      setTimeout(() => router.push('/'), 1000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Invalid username or password'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Login</h1>

        {message && (
          <div className={styles.messageWrapper}>
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <Input
            label="Username"
            value={username}
            onChange={setUsername}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
          />

          <div className={styles.buttonGroup}>
            <Button type="submit">
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <Button variant="secondary" onClick={() => router.push('/register')}>
              Register
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
