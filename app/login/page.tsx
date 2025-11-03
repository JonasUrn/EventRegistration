'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/Input';
import Button from '../components/Button';
import Message from '../components/Message';
import { users, setCurrentUser } from '../data';
import styles from '../layout.module.css';

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      setCurrentUser(user);
      setMessage({ type: 'success', text: 'Login successful!' });
      setTimeout(() => router.push('/'), 1000);
    } else {
      setMessage({ type: 'error', text: 'Invalid username or password' });
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
            <Button type="submit">Login</Button>
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
