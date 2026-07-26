import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import AuthCard from '../components/AuthCard';
import { ArrowRight, ArrowLeft, CheckCircle2, User, Mail, Lock, Phone, FileText, MapPin } from 'lucide-react';

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
  const [step, setStep] = useState(1);
  const registerUser = useStore((state) => state.register);
  const error = useStore((state) => state.error);
  const loading = useStore((state) => state.loading);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  const nextStep = async () => {
    // Validate current step fields before progressing
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

  const onSubmit = async (data) => {
    const success = await registerUser(data);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <AuthCard 
      title="Create Account" 
      subtitle={`Step ${step} of 2 - ${step === 1 ? 'Credentials' : 'Tax Onboarding'}`}
    >
      {/* Progress Bars */}
      <div className="flex gap-2 mb-6">
        <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-teal-500' : 'bg-slate-700'}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-teal-500' : 'bg-slate-700'}`} />
      </div>

      {error && (
        <div className="p-4 mb-6 bg-rose-950/40 border border-rose-800 text-rose-200 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Step 1: Credential Details */}
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

        {/* Step 2: Financial/Business details */}
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
                <CheckCircle2 className="h-5 w-5" />
                {loading ? 'Submitting...' : 'Register Profile'}
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
    </AuthCard>
  );
}
