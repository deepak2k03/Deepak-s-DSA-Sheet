import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Code2, AlertCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { apiUrl } from '../config';
import { setAuthSession } from '../utils/auth';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const requestPasswordReset = async () => {
    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');
    try {
      const res = await fetch(apiUrl('/api/auth/request-password-reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() || formData.email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Unable to request password reset');
      if (data.token) setResetToken(data.token);
      setForgotMessage(data.msg || 'Reset instructions generated.');
    } catch (err: any) {
      setForgotError(err.message || 'Unable to request password reset');
    } finally {
      setForgotLoading(false);
    }
  };

  const submitPasswordReset = async () => {
    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');
    try {
      const email = forgotEmail.trim() || formData.email.trim();
      const res = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: resetToken.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Unable to reset password');
      setForgotMessage(data.msg || 'Password reset successful. Please sign in.');
      setShowForgot(false);
      setFormData(current => ({ ...current, password: '' }));
    } catch (err: any) {
      setForgotError(err.message || 'Unable to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Login failed');
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
          {!showForgot ? (
            <>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center">Welcome back</h2>
              <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">Enter your details to sign in.</p>
              {error && (
                <div className="mt-6 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              {forgotMessage && (
                <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400">
                  {forgotMessage}
                </div>
              )}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Email address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-base)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--text-primary)] focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Password</label>
                    <button type="button" onClick={() => { setShowForgot(true); setForgotMessage(''); setForgotError(''); setResetToken(''); }} className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-base)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--text-primary)] focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="button-primary mt-6 w-full justify-center py-2.5">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign in <ArrowRight size={16} /></>}
                </button>
                
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border-strong)]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-[var(--bg-surface)] px-2 text-[var(--text-muted)]">Or continue with</span>
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
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center">Reset Password</h2>
              <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
                {!resetToken ? "Enter your email to receive a reset link." : "Enter your new password below."}
              </p>
              {forgotError && (
                <div className="mt-6 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400">
                  <AlertCircle size={16} />
                  {forgotError}
                </div>
              )}
              {forgotMessage && (
                <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400">
                  {forgotMessage}
                </div>
              )}
              <div className="mt-8 space-y-5">
                {!resetToken ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[var(--text-secondary)]">Email address</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                          type="email"
                          value={forgotEmail || formData.email}
                          onChange={e => setForgotEmail(e.target.value)}
                          className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-base)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--text-primary)] focus:outline-none"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <button onClick={requestPasswordReset} disabled={forgotLoading || (!forgotEmail && !formData.email)} className="button-primary w-full justify-center py-2.5">
                      {forgotLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send reset link'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[var(--text-secondary)]">New Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-base)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--text-primary)] focus:outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Reset Token (Dev Mode Only)</label>
                        <input
                          type="text"
                          value={resetToken}
                          readOnly
                          className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-base)] py-2.5 px-4 text-sm text-[var(--text-muted)] cursor-not-allowed"
                        />
                      </div>
                    )}
                    <button onClick={submitPasswordReset} disabled={forgotLoading || !newPassword} className="button-primary w-full justify-center py-2.5">
                      {forgotLoading ? <Loader2 size={18} className="animate-spin" /> : 'Update password'}
                    </button>
                  </>
                )}
                <div className="text-center">
                  <button type="button" onClick={() => setShowForgot(false)} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    Back to login
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[var(--text-primary)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
