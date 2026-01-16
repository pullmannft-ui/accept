import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '../utils/firebase';

interface AdminLoginScreenProps {
  onLoggedIn: () => void;
}

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
      onLoggedIn();
    } catch (e: any) {
      setError(e?.message || 'LOGIN_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#111] text-red-500 font-mono p-6 space-y-6 overflow-y-auto">
      <div className="border-b border-red-900 pb-2">
        <h2 className="text-2xl font-black uppercase tracking-tighter">ADMIN_LOGIN</h2>
        <p className="text-[10px] opacity-50 uppercase">Authenticate with Firebase to continue.</p>
      </div>

      <div className="bg-black border border-red-900 p-4 space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase">Email</label>
          <input
            type="email"
            className="w-full bg-[#111] border border-red-900 p-3 text-sm outline-none text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@email.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase">Password</label>
          <input
            type="password"
            className="w-full bg-[#111] border border-red-900 p-3 text-sm outline-none text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="text-[10px] text-red-400 uppercase break-words border border-red-900/50 p-2 bg-red-950/10">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 font-black text-xs hover:bg-red-400 disabled:opacity-50"
        >
          {loading ? 'AUTHENTICATING...' : 'LOGIN'}
        </button>
      </div>
    </div>
  );
};

export default AdminLoginScreen;
