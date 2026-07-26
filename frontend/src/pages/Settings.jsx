import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { 
  Save, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  ShieldAlert, 
  KeyRound, 
  X, 
  Sparkles, 
  Lock, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  FileText, 
  Edit3, 
  Loader2,
  Eye,
  Building2
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  mobile: z.string().regex(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit mobile number' }),
  businessType: z.string().min(1, { message: 'Select your business type' }),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, { message: 'Enter a valid 10-character PAN (e.g., ABCDE1234F)' }),
  aadhaar: z.string().regex(/^\d{12}$/, { message: 'Enter a valid 12-digit Aadhaar number' }),
  gstin: z.string().optional().refine((val) => !val || /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[\d|A-Z]{1}[Z|A-Z]{1}[\d|A-Z]{1}$/i.test(val), {
    message: 'Enter a valid 15-character GSTIN (e.g., 27ABCDE1234F1Z5)',
  }),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
  financialYear: z.string().min(4, { message: 'Financial year is required' }),
});

export default function Settings() {
  const profile = useStore((state) => state.profile);
  const user = useStore((state) => state.user);
  const updateProfile = useStore((state) => state.updateProfile);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);

  const [activeMode, setActiveMode] = useState('view'); // 'view' or 'edit'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successText, setSuccessText] = useState('');

  // OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpInfo, setOtpInfo] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  // Pre-populate forms on mount or state reload
  useEffect(() => {
    if (profile || user) {
      reset({
        name: user?.name || '',
        email: user?.email || '',
        mobile: profile?.mobile || '',
        businessType: profile?.businessType || 'IT Consultant / Developer',
        pan: profile?.pan || '',
        aadhaar: profile?.aadhaar || '',
        gstin: profile?.gstin || '',
        city: profile?.city || '',
        state: profile?.state || '',
        financialYear: profile?.financialYear || '2025-2026',
      });
    }
  }, [profile, user, reset]);

  // Request OTP from Backend for sensitive changes
  const requestOtpCode = async () => {
    setOtpLoading(true);
    setOtpError('');
    setOtpInfo('');
    try {
      const res = await api.post('/users/profile/request-otp');
      setOtpInfo(res.data.message || 'OTP verification code generated! Check your code below.');
    } catch (err) {
      console.error('Request OTP failed', err);
      setOtpError('Failed to generate verification OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSavedSuccess(false);
    setOtpError('');

    // Check if Mobile or Email changed
    const mobileChanged = data.mobile !== profile?.mobile;
    const emailChanged = data.email?.toLowerCase() !== user?.email?.toLowerCase();

    if (mobileChanged || emailChanged) {
      // Require OTP verification for Mobile or Email changes
      setPendingFormData(data);
      setOtpInput('');
      setOtpModalOpen(true);
      requestOtpCode();
    } else {
      // Direct update for general details
      const res = await updateProfile(data);
      if (res.success) {
        setSuccessText('Profile information updated successfully!');
        setSavedSuccess(true);
        setActiveMode('view'); // Return to read-only view mode
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    }
  };

  // Submit OTP and save sensitive contact updates
  const handleVerifyOtpAndSave = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length < 6) {
      setOtpError('Enter a valid 6-digit OTP verification code.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    const updatedPayload = {
      ...pendingFormData,
      otp: otpInput.trim()
    };

    const res = await updateProfile(updatedPayload);
    setOtpLoading(false);

    if (res.success) {
      setOtpModalOpen(false);
      setSuccessText('Contact details (Mobile / Email) & settings updated successfully!');
      setSavedSuccess(true);
      setActiveMode('view'); // Return to read-only view mode
      setTimeout(() => setSavedSuccess(false), 4000);
    } else {
      setOtpError(res.error || 'Invalid OTP verification code.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header & Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-navy-800/80 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans">User Settings &amp; Profile</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            View your verified profile details or switch to the edit section to make updates.
          </p>
        </div>

        {/* Section Toggle Buttons */}
        <div className="flex bg-slate-200/80 dark:bg-navy-900 p-1.5 rounded-2xl border border-slate-300/50 dark:border-navy-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveMode('view')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'view'
                ? 'bg-white dark:bg-navy-800 text-teal-600 dark:text-teal-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveMode('edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'edit'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          {successText || 'Settings details saved successfully!'}
        </div>
      )}

      {error && !otpModalOpen && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* READ-ONLY VIEW MODE SECTION */}
      {activeMode === 'view' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Main User Overview Banner Card */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 z-10 relative">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center text-4xl font-black font-sans shadow-2xl shadow-teal-500/30 flex-shrink-0 border-2 border-white/20">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h3 className="text-2xl font-extrabold font-sans tracking-tight">{user?.name}</h3>
                  <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-semibold self-center sm:self-auto">
                    Verified Professional
                  </span>
                </div>
                <p className="text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="h-4 w-4 text-teal-400" /> {user?.email}
                </p>
                <p className="text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-2">
                  <Phone className="h-4 w-4 text-teal-400" /> {profile?.mobile}
                </p>
              </div>

              <button
                onClick={() => setActiveMode('edit')}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/30 transition-all self-center sm:self-start"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile Section
              </button>
            </div>
          </div>

          {/* Details Read-Only Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Tax Identification & Registration */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-800/80 pb-3">
                <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h4 className="text-base font-bold font-sans">Tax Identifiers</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">PAN Number</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-100 uppercase">{profile?.pan || 'N/A'}</span>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Aadhaar Number</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-100">{profile?.aadhaar || 'N/A'}</span>
                </div>

                <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-navy-850">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">GSTIN Registration</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-100 uppercase">{profile?.gstin || 'Not Registered'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Business & Residency Details */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-800/80 pb-3">
                <Building2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h4 className="text-base font-bold font-sans">Business &amp; Location</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Business Classification</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{profile?.businessType || 'N/A'}</span>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">City / District</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{profile?.city || 'N/A'}</span>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">State / Territory</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{profile?.state || 'N/A'}</span>
                </div>

                <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-navy-850">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Active Financial Year</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{profile?.financialYear || '2025-2026'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* EDIT PROFILE SECTION */}
      {activeMode === 'edit' && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-lg font-bold font-sans">Edit Profile Section</h3>
            </div>
            <button
              onClick={() => setActiveMode('view')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 bg-slate-100 dark:bg-navy-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800"
            >
              <X className="h-4 w-4" /> Cancel Editing
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-850 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                  {...register('name')}
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1.5">{errors.name.message}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" /> OTP Required
                  </span>
                </div>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-850 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1.5">{errors.email.message}</p>}
              </div>
            </div>

            {/* Mobile & Business Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                  <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" /> OTP Required
                  </span>
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-850 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                  {...register('mobile')}
                />
                {errors.mobile && <p className="text-xs text-rose-500 mt-1.5">{errors.mobile.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Business Type</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-850 bg-white dark:bg-navy-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                  {...register('businessType')}
                >
                  <option value="IT Consultant / Developer">IT Consultant / Developer</option>
                  <option value="Creative Creator / Writer">Creative Creator / Writer</option>
                  <option value="Design Agency / Consultant">Design Agency / Consultant</option>
                  <option value="E-commerce Seller">E-commerce Seller</option>
                  <option value="Other Professional">Other Professional</option>
                </select>
                {errors.businessType && <p className="text-xs text-rose-500 mt-1.5">{errors.businessType.message}</p>}
              </div>
            </div>

            {/* PAN, Aadhaar, GSTIN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PAN</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-850 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm uppercase font-mono"
                  {...register('pan')}
                />
                {errors.pan && <p className="text-xs text-rose-500 mt-1.5">{errors.pan.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Aadhaar No</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-850 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm font-mono"
                  {...register('aadhaar')}
                />
                {errors.aadhaar && <p className="text-xs text-rose-500 mt-1.5">{errors.aadhaar.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">GSTIN (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-850 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm uppercase font-mono"
                  {...register('gstin')}
                />
                {errors.gstin && <p className="text-xs text-rose-500 mt-1.5">{errors.gstin.message}</p>}
              </div>
            </div>

            {/* City, State, Financial Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-850 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                  {...register('city')}
                />
                {errors.city && <p className="text-xs text-rose-500 mt-1.5">{errors.city.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-850 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                  {...register('state')}
                />
                {errors.state && <p className="text-xs text-rose-500 mt-1.5">{errors.state.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Financial Year</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-850 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                  {...register('financialYear')}
                />
                {errors.financialYear && <p className="text-xs text-rose-500 mt-1.5">{errors.financialYear.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-navy-800/80">
              <button
                type="button"
                onClick={() => setActiveMode('view')}
                className="px-5 py-3 rounded-2xl text-xs font-semibold border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-teal-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* OTP Verification Modal for Sensitive Contact Info Updates */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-navy-800/80">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">OTP Verification Required</h3>
              </div>
              <button 
                onClick={() => setOtpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyOtpAndSave} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                You are updating your <strong className="text-slate-800 dark:text-slate-200">Mobile Number</strong> or <strong className="text-slate-800 dark:text-slate-200">Email Address</strong>. Please enter the 6-digit verification OTP code to confirm this change.
              </p>

              {otpInfo && (
                <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 flex-shrink-0 text-teal-400" />
                  <span>{otpInfo}</span>
                </div>
              )}

              {otpError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
                  {otpError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  6-Digit Verification OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-mono tracking-widest text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-navy-800/80">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpLoading || !otpInput}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20 flex items-center gap-1.5"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify &amp; Save Changes</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
