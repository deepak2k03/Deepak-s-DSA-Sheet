import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Code2, AlertCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { apiUrl } from '../config';
import { setAuthSession } from '../utils/auth';

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

      if (!res.ok) {
        throw new Error(data.msg || 'Unable to request password reset');
      }

      // In dev, backend returns token for testing. Keep this convenience here.
      if (data.token) {
        setResetToken(data.token);
      }
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

      if (!res.ok) {
        throw new Error(data.msg || 'Unable to reset password');
      }

      setForgotMessage(data.msg || 'Password reset successful. Please sign in.');
      setShowForgot(false);
      setFormData((current) => ({ ...current, password: '' }));
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

      if (!res.ok) {
        throw new Error(data.msg || 'Login failed');
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <AnimatedBackground />
      
      <div className="w-full max-w-5xl h-[600px] grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 m-4 z-10">
        
        {/* LEFT: FORM SECTION */}
          <div className="p-8 md:p-12 flex flex-col justify-start overflow-y-auto">
           <Link to="/" className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg group mb-8">
             <div className="p-1.5 rounded-lg bg-blue-600 text-white group-hover:scale-105 transition-transform">
                <Code2 size={20} />
             </div>
             DSA Sheet
          </Link>

           <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Continue your journey to algorithmic mastery.
            </p>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white transition-all"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                   <button
                     type="button"
                     onClick={() => {
                       setShowForgot((current) => !current);
                       setForgotError('');
                       setForgotMessage('');
                       if (!forgotEmail) {
                         setForgotEmail(formData.email);
                       }
                     }}
                     className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                   >
                     Forgot?
                   </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {showForgot && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Reset Password</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Enter your email and request a reset token, then submit a new password.</p>

                  {forgotError && (
                    <p className="mt-3 text-xs text-rose-600 dark:text-rose-300">{forgotError}</p>
                  )}
                  {forgotMessage && (
                    <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-300">{forgotMessage}</p>
                  )}

                  <div className="mt-3 space-y-3">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Email for reset"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={requestPasswordReset}
                      disabled={forgotLoading || !(forgotEmail.trim() || formData.email.trim())}
                      className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
                    >
                      {forgotLoading ? 'Requesting…' : 'Request Reset Token'}
                    </button>

                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Reset token"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={submitPasswordReset}
                      disabled={forgotLoading || !(resetToken.trim() && newPassword.trim() && (forgotEmail.trim() || formData.email.trim()))}
                      className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {forgotLoading ? 'Resetting…' : 'Reset Password'}
                    </button>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT: FEATURE SECTION (Hidden on mobile) */}
        <div className="hidden md:flex flex-col justify-between bg-slate-50 dark:bg-slate-800/50 p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-white/[0.04] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Track your progress</h3>
            <p className="text-slate-500 dark:text-slate-400">
              "The only way to learn a new programming language is by writing programs in it."
            </p>
          </div>

          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xl border border-slate-100 dark:border-slate-800 transform rotate-2 hover:rotate-0 transition-transform duration-500">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                 <Code2 size={20} />
               </div>
               <div>
                 <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                 <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
               </div>
             </div>
             <div className="space-y-2">
               <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
               <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
               <div className="h-2 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;