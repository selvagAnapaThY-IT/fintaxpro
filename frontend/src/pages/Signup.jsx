import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import AuthCard from '../components/AuthCard';
import { ArrowRight, ArrowLeft, CheckCircle2, User, Mail, Lock, Phone, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  mobile: z.string().regex(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit mobile number' }),
  businessType: z.string().min(1, { message: 'Please select a business category' }),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, { message: 'Enter a valid 10-character PAN (e.g., ABCDE1234F)' }),
  aadhaar: z.string().regex(/^\d{12}$/, { message: 'Enter a valid 12-digit Aadhaar number' }),
  gstin: z.string().optional().refine((val) => !val || /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[\d|A-Z]{1}[Z|A-Z]{1}[\d|A-Z]{1}$/i.test(val), {
    message: 'Enter a valid 15-character GSTIN (e.g., 27ABCDE1234F1Z5)',
  }),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
});

export default function Signup() {
  const [step, setStep] = useState(1); // 1: Credentials, 2: Financial Details, 3: Email OTP Verification
  const [formData, setFormData] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const requestSignupOtp = useStore((state) => state.requestSignupOtp);
  const verifySignupOtp = useStore((state) => state.verifySignupOtp);
  const resendSignupOtp = useStore((state) => state.resendSignupOtp);
  const storeError = useStore((state) => state.error);
  const loading = useStore((state) => state.loading);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (step === 3 && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ['name', 'email', 'password', 'mobile']
      : ['businessType', 'pan', 'aadhaar', 'gstin', 'city', 'state'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setStep((s) => s - 1);
  };

  // Step 2 Submission: Request OTP & move to Step 3
  const onSubmitForm = async (data) => {
    setFormData(data);
    setOtpError('');
    setResendMessage('');

    const res = await requestSignupOtp(data);
    if (res.success) {
      if (res.demoOtp) {
        setDemoOtpHint(res.demoOtp);
      }
      setCountdown(60);
      setCanResend(false);
      setStep(3); // Move to OTP verification view
    }
  };

  // Step 3 OTP Verification Submission
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setOtpError('Please enter a valid 6-digit verification code.');
      return;
    }

    setOtpError('');
    const res = await verifySignupOtp(formData.email, otp.trim());
    if (res.success) {
      navigate('/dashboard');
    } else {
      setOtpError(res.error || 'Invalid or expired verification code.');
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || !formData?.email) return;
    setOtpError('');
    setResendMessage('');
    setCanResend(false);
    setCountdown(60);

    const res = await resendSignupOtp(formData.email);
    if (res.success) {
      setResendMessage('A new 6-digit verification code has been sent to your email.');
      if (res.demoOtp) {
        setDemoOtpHint(res.demoOtp);
      }
    } else {
      setOtpError(res.error || 'Failed to resend code.');
      setCanResend(true);
    }
  };

  return (
    <AuthCard 
      title={step === 3 ? "Verify Your Email" : "Create Account"} 
      subtitle={
        step === 3 
          ? `Enter the 6-digit code sent to ${formData?.email || 'your email'}`
          : `Step ${step} of 2 - ${step === 1 ? 'Credentials' : 'Tax Onboarding'}`
      }
    >
      {/* Progress Bars */}
      {step !== 3 && (
        <div className="flex gap-2 mb-6">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-teal-500' : 'bg-slate-700'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-teal-500' : 'bg-slate-700'}`} />
        </div>
      )}

      {storeError && step !== 3 && (
        <div className="p-4 mb-6 bg-rose-950/40 border border-rose-800 text-rose-200 rounded-2xl text-xs font-semibold">
          {storeError}
        </div>
      )}

      {/* STEP 1 & 2 FORM */}
      {step !== 3 && (
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rohan Sharma"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-500"
                    {...register('name')}
                  />
                </div>
                {errors.name && <p className="text-xs text-rose-400 mt-1.5">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="rohan@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-500"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-400 mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-500"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-xs text-rose-400 mt-1.5">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="10-digit number"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-500"
                    {...register('mobile')}
                  />
                </div>
                {errors.mobile && <p className="text-xs text-rose-400 mt-1.5">{errors.mobile.message}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-3.5 px-4 rounded-2xl bg-teal-500 hover:bg-teal-600 font-semibold text-slate-900 hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
                >
                  Continue Onboarding
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Type</label>
                  <select
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100"
                    {...register('businessType')}
                  >
                    <option value="">Select...</option>
                    <option value="IT Consultant / Developer">IT Consultant / Dev</option>
                    <option value="Creative Creator / Writer">Creative Creator</option>
                    <option value="Design Agency / Consultant">Design agency</option>
                    <option value="E-commerce Seller">E-commerce Seller</option>
                    <option value="Other Professional">Other Professional</option>
                  </select>
                  {errors.businessType && <p className="text-xs text-rose-400 mt-1.5">{errors.businessType.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">PAN</label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-600 uppercase"
                    {...register('pan')}
                  />
                  {errors.pan && <p className="text-xs text-rose-400 mt-1.5">{errors.pan.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Aadhaar No</label>
                  <input
                    type="text"
                    placeholder="12-digit number"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-600"
                    {...register('aadhaar')}
                  />
                  {errors.aadhaar && <p className="text-xs text-rose-400 mt-1.5">{errors.aadhaar.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="27ABCDE1234F1Z5"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-600 uppercase"
                    {...register('gstin')}
                  />
                  {errors.gstin && <p className="text-xs text-rose-400 mt-1.5">{errors.gstin.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100 placeholder-slate-600"
                    {...register('city')}
                  />
                  {errors.city && <p className="text-xs text-rose-400 mt-1.5">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">State</label>
                  <select
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-slate-100"
                    {...register('state')}
                  >
                    <option value="">Select state...</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                  {errors.state && <p className="text-xs text-rose-400 mt-1.5">{errors.state.message}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3.5 px-4 rounded-2xl bg-teal-500 hover:bg-teal-600 font-semibold text-slate-900 hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="h-5 w-5" />
                  {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              </div>
            </>
          )}

          <div className="text-center pt-2">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </form>
      )}

      {/* STEP 3: EMAIL OTP VERIFICATION SCREEN */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="p-4 bg-teal-950/40 border border-teal-800/60 rounded-2xl text-center">
            <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <KeyRound className="h-6 w-6" />
            </div>
            <p className="text-xs text-slate-300">
              We sent a 6-digit verification code to:
            </p>
            <p className="text-sm font-bold text-teal-300 mt-0.5">{formData?.email}</p>
            <p className="text-[11px] text-slate-400 mt-1">Code expires in 10 minutes.</p>
          </div>

          {demoOtpHint && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-2xl text-center">
              <span className="text-xs font-semibold text-amber-300">
                Demo OTP Code: <strong className="text-amber-100 font-mono tracking-widest text-sm underline">{demoOtpHint}</strong>
              </span>
            </div>
          )}

          {otpError && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800 text-rose-200 rounded-2xl text-xs font-semibold text-center">
              {otpError}
            </div>
          )}

          {resendMessage && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800 text-emerald-200 rounded-2xl text-xs font-semibold text-center">
              {resendMessage}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full py-3.5 px-4 text-center font-mono text-2xl font-bold tracking-[8px] rounded-2xl border border-slate-700 bg-slate-900/80 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-teal-300 placeholder-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 px-4 rounded-2xl bg-teal-500 hover:bg-teal-600 font-semibold text-slate-900 hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              {loading ? 'Verifying Code...' : 'Verify Email & Create Account'}
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Edit Details
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={!canResend || loading}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 disabled:text-slate-600 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
            </button>
          </div>
        </div>
      )}
    </AuthCard>
  );
}
