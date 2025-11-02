'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/Input';
import Button from '../components/Button';
import Message from '../components/Message';
import { users, setCurrentUser } from '../data';

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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 border border-black">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        {message && (
          <div className="mb-4">
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <div className="flex gap-2 mt-4">
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
