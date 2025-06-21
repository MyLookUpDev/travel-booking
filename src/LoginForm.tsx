import React, { useState } from 'react';

const LoginForm = ({ onLogin }: { onLogin: (token: string, role: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      onLogin(data.token, data.role);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-10 p-4 border rounded">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <div className="text-red-600">{error}</div>}
      <input className="w-full border p-2 rounded" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      <input className="w-full border p-2 rounded" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Login</button>
    </form>
  );
};

export default LoginForm;
