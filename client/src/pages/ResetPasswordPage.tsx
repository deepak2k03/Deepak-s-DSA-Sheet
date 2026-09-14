import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lock, Loader2, Code2, AlertCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { apiUrl } from '../config';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(apiUrl(`/api/auth/reset-password/${token}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.msg || 'Unable to reset password');
      }
      
      setMessage(data.msg || 'Password reset successful. Please sign in.');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
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
          <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center">Set New Password</h2>
          <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
            Enter your new password below.
          </p>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          {message && (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400">
              {message}
            </div>
          )}

          {!message ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)]">New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-base)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--text-primary)] focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-base)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--text-primary)] focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading || !newPassword || !confirmPassword} className="button-primary mt-6 w-full justify-center py-2.5">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update password'}
              </button>
            </form>
          ) : (
            <div className="mt-6 text-center">
              <Link to="/login" className="button-primary inline-flex justify-center w-full py-2.5">
                Go to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
