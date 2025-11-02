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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md p-10 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold mb-8 text-white text-center">Login</h1>

        {message && (
          <div className="mb-6">
            <Message type={message.type}>{message.text}</Message>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

          <div className="flex gap-3 mt-6">
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
