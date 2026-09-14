import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowRight, Code2, AlertCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { apiUrl } from '../config';
import { setAuthSession } from '../utils/auth';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Google Login failed');
      setAuthSession(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(apiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Signup failed');
      }

      setAuthSession(data.token, data.user);
      navigate('/');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-72px)] items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <AnimatedBackground />
      
      <div className="z-10 w-full max-w-md">
        <Link to="/" className="mb-4 flex items-center justify-center gap-2 text-lg font-bold text-[var(--text-primary)] transition-colors hover:text-[var(--text-secondary)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-surface-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
            <Code2 size={16} />
          </div>
          DSA Sheet
        </Link>

        <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center">Create Account</h2>
          <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">Start your journey today. It's free.</p>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-base)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--text-primary)] focus:outline-none"
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Email address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-base)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--text-primary)] focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-base)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--text-primary)] focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="button-primary mt-6 w-full justify-center py-2.5"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign up <ArrowRight size={16} /></>}
            </button>
            
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-strong)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[var(--bg-surface)] px-2 text-[var(--text-muted)]">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError('Google Login Failed');
                }}
              />
            </div>
          </form>
        </div>
        
        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--text-primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
