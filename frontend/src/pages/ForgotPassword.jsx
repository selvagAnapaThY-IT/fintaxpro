import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import api from '../services/api';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
});

const resetSchema = z.object({
  otp: z.string().min(6, { message: 'Verification code must be 6 digits' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const navigate = useNavigate();

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    setValue: setResetValue,
    formState: { errors: errorsReset },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSendOtp = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      const res = await api.post('/auth/forgot-password', { email: data.email });
      setEmail(data.email);
      setInfoMsg(res.data.message || 'Verification OTP code generated. Please enter your 6-digit code below.');
      setStep(2);
    } catch (err) {
      console.error('Forgot password error', err);
      const serverMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || err.response?.data?.error;
      setErrorMsg(serverMsg || 'No registered account found with this email address. Please check your email or sign up.');
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      const res = await api.post('/auth/reset-password', {
        email: email,
        otp: data.otp,
        newPassword: data.newPassword
      });
      setInfoMsg(res.data.message || 'Password reset successfully!');
      setStep(3);
    } catch (err) {
      console.error('Reset password error', err);
      const serverMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || err.response?.data?.error;
      setErrorMsg(serverMsg || 'Invalid verification OTP code. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Recover access to your FinTax PRO account"
    >
      <div className="space-y-6 font-sans">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
          <span className="text-xs text-slate-500 font-medium">Step {step} of 3</span>
        </div>

        {/* Banners */}
        {errorMsg && (
          <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-200 rounded-2xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {infoMsg && step !== 3 && (
          <div className="p-4 bg-teal-500/10 border border-teal-500/20 text-teal-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 flex-shrink-0 text-teal-400" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSubmitForgot(onSendOtp)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-500"
                  {...registerForgot('email')}
                />
              </div>
              {errorsForgot.email ? (
                <p className="text-xs text-rose-400 mt-1.5">{errorsForgot.email.message}</p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Enter your registered account email (e.g. <span className="text-teal-400 font-medium font-mono">demo@fintaxpro.in</span>)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-teal-500 hover:bg-teal-600 font-semibold text-slate-900 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <KeyRound className="h-5 w-5" />
              {loading ? 'Sending Code...' : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: Verification Code & New Password */}
        {step === 2 && (
          <form onSubmit={handleSubmitReset(onResetPassword)} className="space-y-4">
            
            {/* OTP Code */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  6-Digit Verification OTP Code
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-500 font-mono tracking-widest"
                  {...registerReset('otp')}
                />
              </div>
              {errorsReset.otp && (
                <p className="text-xs text-rose-400 mt-1">{errorsReset.otp.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-500"
                  {...registerReset('newPassword')}
                />
              </div>
              {errorsReset.newPassword && (
                <p className="text-xs text-rose-400 mt-1">{errorsReset.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-500"
                  {...registerReset('confirmPassword')}
                />
              </div>
              {errorsReset.confirmPassword && (
                <p className="text-xs text-rose-400 mt-1">{errorsReset.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-teal-500 hover:bg-teal-600 font-semibold text-slate-900 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-4"
            >
              <ShieldCheck className="h-5 w-5" />
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="text-center py-4 space-y-4">
            <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-sans">Password Updated!</h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Your password has been successfully reset. You can now log into your FinTax PRO account using your new credentials.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 px-4 rounded-2xl bg-teal-500 hover:bg-teal-600 font-semibold text-slate-900 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all text-sm mt-4"
            >
              Go to Login Page
            </button>
          </div>
        )}

      </div>
    </AuthCard>
  );
}
