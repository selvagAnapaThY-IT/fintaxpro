import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Sparkles, 
  FileText, 
  Building2, 
  MapPin, 
  Loader2,
  ShieldCheck
} from 'lucide-react';

export default function Settings() {
  const profile = useStore((state) => state.profile);
  const user = useStore((state) => state.user);
  const updateProfile = useStore((state) => state.updateProfile);
  const loading = useStore((state) => state.loading);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    businessType: 'Sole Proprietorship',
    pan: '',
    aadhaar: '',
    gstin: '',
    city: '',
    state: '',
    financialYear: '2024-2025'
  });

  // Success / Error Notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when user/profile loads or changes
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      mobile: profile?.mobile || '',
      businessType: profile?.businessType || 'Sole Proprietorship',
      pan: profile?.pan || '',
      aadhaar: profile?.aadhaar || '',
      gstin: profile?.gstin || '',
      city: profile?.city || '',
      state: profile?.state || '',
      financialYear: profile?.financialYear || '2024-2025'
    });
  }, [user, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsSubmitting(true);

    if (!formData.name.trim()) {
      setErrorMsg('Full Name is required.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMsg('Please provide a valid email address.');
      setIsSubmitting(false);
      return;
    }

    const res = await updateProfile(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Profile details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } else {
      setErrorMsg(res.error || 'Failed to save profile changes.');
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-navy-800/80 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans">Account Settings &amp; Profile</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            View and update your personal identity, tax details, and contact information directly.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-navy-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 z-10 relative">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center text-3xl font-black font-sans shadow-xl shadow-teal-500/20 flex-shrink-0 border-2 border-white/20">
            {formData.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 className="text-2xl font-extrabold font-sans tracking-tight">{formData.name || 'User Profile'}</h3>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold flex items-center gap-1 self-center sm:self-auto">
                <ShieldCheck className="h-3.5 w-3.5" /> Direct Edit Enabled
              </span>
            </div>
            <p className="text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="h-4 w-4 text-teal-400" /> {formData.email || 'No email set'}
            </p>
            <p className="text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-2">
              <Phone className="h-4 w-4 text-teal-400" /> {formData.mobile || 'No phone set'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Edit Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* Section 1: Basic & Contact Information */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-800/80 pb-3">
            <UserIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-lg font-bold font-sans">Basic &amp; Contact Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-semibold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-semibold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-semibold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Business Classification
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-semibold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              >
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Freelancer / Consultant">Freelancer / Consultant</option>
                <option value="Private Limited Company">Private Limited Company</option>
                <option value="Partnership / LLP">Partnership / LLP</option>
                <option value="Salaried Individual">Salaried Individual</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Tax & Government Identity IDs */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-800/80 pb-3">
            <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-lg font-bold font-sans">Tax &amp; Identification Records</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                PAN Number
              </label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-bold font-mono uppercase focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Aadhaar Number
              </label>
              <input
                type="text"
                name="aadhaar"
                value={formData.aadhaar}
                onChange={handleChange}
                placeholder="12-digit Aadhaar number"
                maxLength={12}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-bold font-mono focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                GSTIN Registration
              </label>
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-bold font-mono uppercase focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Address & Financial Year */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-800/80 pb-3">
            <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-lg font-bold font-sans">Location &amp; Assessment Settings</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-semibold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-semibold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Assessment Financial Year
              </label>
              <select
                name="financialYear"
                value={formData.financialYear}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-semibold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              >
                <option value="2024-2025">2024 - 2025 (AY 2025-26)</option>
                <option value="2023-2024">2023 - 2024 (AY 2024-25)</option>
                <option value="2025-2026">2025 - 2026 (AY 2026-27)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="px-6 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-teal-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Profile Details
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
