import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import AuthCard from '../components/AuthCard';
import { ShieldCheck, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function Login() {
  const login = useStore((state) => state.login);
  const error = useStore((state) => state.error);
  const loading = useStore((state) => state.loading);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const success = await login(data.email, data.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <AuthCard 
      title="Welcome Back" 
      subtitle="Access your Indian GST, Income Tax & Smoother Pot panel"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-200 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-500"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-xs text-rose-400 mt-1.5">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-teal-400 hover:text-teal-300 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-500"
              {...register('password')}
            />
          </div>
          {errors.password && <p className="text-xs text-rose-400 mt-1.5">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-teal-500 hover:bg-teal-600 font-semibold text-slate-900 hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-5 w-5" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-400">
            New to FinTax Pro?{' '}
            <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-semibold hover:underline">
              Create a free account
            </Link>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
