import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowRight, Code2, AlertCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { apiUrl } from '../config';
import { setAuthSession } from '../utils/auth';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="page-shell flex min-h-screen items-center justify-center">
      <AnimatedBackground />
      
      <div className="surface z-10 m-4 grid h-[700px] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[28px] shadow-2xl shadow-teal-950/10 md:h-[600px] md:grid-cols-2">
        
        {/* RIGHT: FEATURE SECTION (Swapped for variety) */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#123b36] p-12 text-white md:flex">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-white/[0.04] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
          
          <div className="relative z-10">
             <h3 className="mb-2 text-2xl font-bold text-white">Join the Community</h3>
             <p className="text-teal-100">
               Build consistency, track your streak, and master data structures with us.
             </p>
          </div>
          
          {/* Decorative Code Block */}
          <div className="relative z-10 rounded-2xl border border-white/10 bg-white/[.06] p-5 shadow-2xl transition-transform duration-500 hover:rotate-0 -rotate-2">
            <div className="flex gap-1.5 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-20 bg-purple-500/50 rounded"></div>
              <div className="h-2 w-32 bg-blue-500/50 rounded ml-4"></div>
              <div className="h-2 w-24 bg-slate-700 rounded ml-4"></div>
              <div className="h-2 w-10 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>

        {/* LEFT: FORM SECTION */}
        <div className="p-8 md:p-12 flex flex-col justify-center relative">
          <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg group">
             <div className="rounded-lg bg-[#123b36] p-1.5 text-white transition-transform group-hover:scale-105 dark:bg-teal-400 dark:text-[#08241f]">
                <Code2 size={20} />
             </div>
             DSA Sheet
          </Link>

          <div className="mt-10 md:mt-0">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Start your journey today. It's free.
            </p>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-[#fbfcfa] py-2.5 pl-10 pr-4 transition focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-white/10 dark:bg-white/[.04] dark:text-white"
                    placeholder="deepak_singh"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-[#fbfcfa] py-2.5 pl-10 pr-4 transition focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-white/10 dark:bg-white/[.04] dark:text-white"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-[#fbfcfa] py-2.5 pl-10 pr-4 transition focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-white/10 dark:bg-white/[.04] dark:text-white"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="button-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-teal-700 transition-colors hover:text-teal-600 dark:text-teal-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
