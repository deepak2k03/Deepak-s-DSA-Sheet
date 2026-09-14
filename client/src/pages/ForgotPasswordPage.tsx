import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, Code2, AlertCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { apiUrl } from '../config';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(apiUrl('/api/auth/request-password-reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.msg || 'Unable to request password reset');
      }
      
      // Generic success message
      setMessage(data.msg || 'If an account with that email exists, a password reset link has been sent.');
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
          <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center">Reset Password</h2>
          <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
            Enter your email to receive a reset link.
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

          {!message && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Email address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-base)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--text-primary)] focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading || !email} className="button-primary mt-6 w-full justify-center py-2.5">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send reset link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
