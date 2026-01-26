import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Code2, AlertCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Login failed');
      }

      // Success: Save token & Redirect
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Force reload/redirect to update Header state instantly
      window.location.href = '/'; 

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
        <div className="p-8 md:p-12 flex flex-col justify-center relative">
          <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg group">
             <div className="p-1.5 rounded-lg bg-blue-600 text-white group-hover:scale-105 transition-transform">
                <Code2 size={20} />
             </div>
             DSA Sheet
          </Link>

          <div className="mt-8">
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
                   <a href="#" className="text-xs text-blue-600 hover:text-blue-500 font-medium">Forgot?</a>
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