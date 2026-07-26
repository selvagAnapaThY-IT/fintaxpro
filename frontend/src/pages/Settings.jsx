import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Lock, 
  Mail, 
  Phone, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  User as UserIcon, 
  FileText, 
  Building2, 
  MapPin, 
  RefreshCw,
  Edit3,
  ShieldAlert
} from 'lucide-react';

export default function Settings() {
  const profile = useStore((state) => state.profile);
  const user = useStore((state) => state.user);

  const requestEmailChange = useStore((state) => state.requestEmailChange);
  const verifyEmailChange = useStore((state) => state.verifyEmailChange);
  const requestPasswordChange = useStore((state) => state.requestPasswordChange);
  const verifyPasswordChange = useStore((state) => state.verifyPasswordChange);
  const requestPhoneChange = useStore((state) => state.requestPhoneChange);
  const verifyPhoneChange = useStore((state) => state.verifyPhoneChange);

  const loading = useStore((state) => state.loading);

  // Success / Error Banners
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Email Change Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState(1); // 1: Enter New Email, 2: Enter OTP
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailDemoOtp, setEmailDemoOtp] = useState('');
  const [emailModalError, setEmailModalError] = useState('');

  // Phone Change Modal State
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneStep, setPhoneStep] = useState(1); // 1: Enter New Phone, 2: Enter OTP
  const [newPhone, setNewPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneDemoOtp, setPhoneDemoOtp] = useState('');
  const [phoneModalError, setPhoneModalError] = useState('');

  // Password Change Modal State
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [passStep, setPassStep] = useState(1); // 1: Passwords Form, 2: Enter OTP
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passOtp, setPassOtp] = useState('');
  const [passDemoOtp, setPassDemoOtp] = useState('');
  const [passModalError, setPassModalError] = useState('');

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg('');
  };

  // ==========================================
  // HANDLERS: EMAIL CHANGE FLOW
  // ==========================================
  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    setEmailModalError('');
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      setEmailModalError('Please enter a valid email address.');
      return;
    }

    const res = await requestEmailChange(newEmail.trim());
    if (res.success) {
      if (res.demoOtp) setEmailDemoOtp(res.demoOtp);
      setEmailStep(2);
    } else {
      setEmailModalError(res.error || 'Failed to request email change.');
    }
  };

  const handleVerifyEmailChange = async (e) => {
    e.preventDefault();
    setEmailModalError('');
    if (!emailOtp || emailOtp.trim().length !== 6) {
      setEmailModalError('Please enter a 6-digit OTP verification code.');
      return;
    }

    const res = await verifyEmailChange(newEmail.trim(), emailOtp.trim());
    if (res.success) {
      setEmailModalOpen(false);
      setEmailStep(1);
      setNewEmail('');
      setEmailOtp('');
      showSuccess('Primary email address updated and verified successfully!');
    } else {
      setEmailModalError(res.error || 'Invalid or expired verification code.');
    }
  };

  // ==========================================
  // HANDLERS: PHONE CHANGE FLOW
  // ==========================================
  const handleRequestPhoneChange = async (e) => {
    e.preventDefault();
    setPhoneModalError('');
    if (!newPhone || !/^[6-9]\d{9}$/.test(newPhone.trim())) {
      setPhoneModalError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const res = await requestPhoneChange(newPhone.trim());
    if (res.success) {
      if (res.demoOtp) setPhoneDemoOtp(res.demoOtp);
      setPhoneStep(2);
    } else {
      setPhoneModalError(res.error || 'Failed to request phone change.');
    }
  };

  const handleVerifyPhoneChange = async (e) => {
    e.preventDefault();
    setPhoneModalError('');
    if (!phoneOtp || phoneOtp.trim().length !== 6) {
      setPhoneModalError('Please enter a 6-digit OTP verification code.');
      return;
    }

    const res = await verifyPhoneChange(user.email, phoneOtp.trim());
    if (res.success) {
      setPhoneModalOpen(false);
      setPhoneStep(1);
      setNewPhone('');
      setPhoneOtp('');
      showSuccess('Mobile phone number updated successfully!');
    } else {
      setPhoneModalError(res.error || 'Invalid or expired verification code.');
    }
  };

  // ==========================================
  // HANDLERS: PASSWORD CHANGE FLOW
  // ==========================================
  const handleRequestPasswordChange = async (e) => {
    e.preventDefault();
    setPassModalError('');

    if (!currentPassword) {
      setPassModalError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPassModalError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassModalError('New password and confirmation do not match.');
      return;
    }

    const res = await requestPasswordChange(currentPassword, newPassword, confirmPassword);
    if (res.success) {
      if (res.demoOtp) setPassDemoOtp(res.demoOtp);
      setPassStep(2);
    } else {
      setPassModalError(res.error || 'Failed to authorize password change.');
    }
  };

  const handleVerifyPasswordChange = async (e) => {
    e.preventDefault();
    setPassModalError('');
    if (!passOtp || passOtp.trim().length !== 6) {
      setPassModalError('Please enter a 6-digit OTP verification code.');
      return;
    }

    const res = await verifyPasswordChange(user.email, passOtp.trim());
    if (res.success) {
      setPassModalOpen(false);
      setPassStep(1);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPassOtp('');
      showSuccess(res.message || 'Password changed successfully! Please log in again.');
    } else {
      setPassModalError(res.error || 'Invalid or expired verification code.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-navy-800/80 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans">Account Settings &amp; Profile</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage your verified identity, update contact details, and adjust account security.
          </p>
        </div>
      </div>

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

      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-navy-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 z-10 relative">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center text-3xl font-black font-sans shadow-xl shadow-teal-500/20 flex-shrink-0 border-2 border-white/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 className="text-2xl font-extrabold font-sans tracking-tight">{user?.name}</h3>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold flex items-center gap-1 self-center sm:self-auto">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Profile
              </span>
            </div>
            <p className="text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="h-4 w-4 text-teal-400" /> {user?.email}
            </p>
            <p className="text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-2">
              <Phone className="h-4 w-4 text-teal-400" /> {profile?.mobile}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* SECTION 1: PERSONAL & TAX IDENTITY (PERMANENTLY LOCKED) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800/80 pb-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-lg font-bold font-sans">Personal &amp; Tax Identity</h3>
              </div>
              <span className="px-3 py-1 bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-navy-800 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-500" /> Permanently Locked
              </span>
            </div>

            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 text-amber-500" />
              <span>Identity verification details (Name, PAN, Aadhaar, GSTIN, Business Type, City, State) are locked after onboarding for legal compliance.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={user?.name || ''}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed outline-none"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Business Classification</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={profile?.businessType || ''}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed outline-none"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">PAN Number</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={profile?.pan || ''}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400 font-bold font-mono uppercase cursor-not-allowed outline-none"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Aadhaar Number</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={profile?.aadhaar || ''}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400 font-bold font-mono cursor-not-allowed outline-none"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">GSTIN Registration</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={profile?.gstin || 'Not Registered'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400 font-bold font-mono uppercase cursor-not-allowed outline-none"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Location (City &amp; State)</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={`${profile?.city || ''}, ${profile?.state || ''}`}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed outline-none"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 2 & 3: EDITABLE CONTACT INFO & SECURITY */}
        <div className="space-y-6">
          
          {/* SECTION 2: CONTACT INFORMATION */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-800/80 pb-3">
              <Mail className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-base font-bold font-sans">Contact Information</h3>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Verified
                </span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 font-semibold text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    setEmailModalOpen(true);
                    setEmailStep(1);
                    setNewEmail('');
                    setEmailOtp('');
                    setEmailModalError('');
                  }}
                  className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5 flex-shrink-0"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-850">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={profile?.mobile || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 font-semibold text-xs text-slate-800 dark:text-slate-200 outline-none font-mono"
                  />
                </div>
                <button
                  onClick={() => {
                    setPhoneModalOpen(true);
                    setPhoneStep(1);
                    setNewPhone('');
                    setPhoneOtp('');
                    setPhoneModalError('');
                  }}
                  className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5 flex-shrink-0"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: SECURITY & PASSWORD */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-800/80 pb-3">
              <KeyRound className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-base font-bold font-sans">Account Security</h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Update your password. Changing your password requires verifying your current password and entering a 6-digit OTP code sent to your email.
            </p>

            <button
              onClick={() => {
                setPassModalOpen(true);
                setPassStep(1);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPassOtp('');
                setPassModalError('');
              }}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-navy-800 dark:hover:bg-navy-700 text-white rounded-2xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4 text-teal-400" /> Change Account Password
            </button>
          </div>

        </div>

      </div>

      {/* ========================================== */}
      {/* MODAL 1: EMAIL CHANGE OTP VERIFICATION */}
      {/* ========================================== */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-navy-800/80">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-teal-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Email Address</h3>
              </div>
              <button 
                onClick={() => setEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {emailModalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
                {emailModalError}
              </div>
            )}

            {emailDemoOtp && emailStep === 2 && (
              <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-semibold text-center">
                Demo OTP Code: <strong className="text-amber-200 font-mono tracking-widest text-sm underline">{emailDemoOtp}</strong>
              </div>
            )}

            {emailStep === 1 ? (
              <form onSubmit={handleRequestEmailChange} className="p-6 space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your new email address. We will send a 6-digit verification code to the new address.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="newemail@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !newEmail}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20 flex items-center gap-1.5"
                  >
                    {loading ? 'Sending Code...' : 'Send Verification OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailChange} className="p-6 space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter the 6-digit OTP code sent to <strong className="text-teal-400">{newEmail}</strong>:
                </p>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3.5 px-4 text-center font-mono text-2xl font-bold tracking-[8px] rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 focus:ring-2 focus:ring-teal-500 outline-none text-teal-400"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setEmailStep(1)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || emailOtp.length !== 6}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20 flex items-center gap-1.5"
                  >
                    {loading ? 'Verifying...' : 'Verify & Update Email'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: PHONE CHANGE OTP VERIFICATION */}
      {/* ========================================== */}
      {phoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-navy-800/80">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-teal-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Mobile Number</h3>
              </div>
              <button 
                onClick={() => setPhoneModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {phoneModalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
                {phoneModalError}
              </div>
            )}

            {phoneDemoOtp && phoneStep === 2 && (
              <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-semibold text-center">
                Demo OTP Code: <strong className="text-amber-200 font-mono tracking-widest text-sm underline">{phoneDemoOtp}</strong>
              </div>
            )}

            {phoneStep === 1 ? (
              <form onSubmit={handleRequestPhoneChange} className="p-6 space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your new 10-digit mobile number. For security, a 6-digit verification code will be sent to your registered email (<strong className="text-slate-200">{user?.email}</strong>).
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit mobile number"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-mono"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setPhoneModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !newPhone}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20 flex items-center gap-1.5"
                  >
                    {loading ? 'Sending Code...' : 'Send Verification OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneChange} className="p-6 space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter the 6-digit OTP code sent to your registered email (<strong className="text-teal-400">{user?.email}</strong>):
                </p>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3.5 px-4 text-center font-mono text-2xl font-bold tracking-[8px] rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 focus:ring-2 focus:ring-teal-500 outline-none text-teal-400"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setPhoneStep(1)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || phoneOtp.length !== 6}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20 flex items-center gap-1.5"
                  >
                    {loading ? 'Verifying...' : 'Verify & Update Phone'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: PASSWORD CHANGE OTP VERIFICATION */}
      {/* ========================================== */}
      {passModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-navy-800/80">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-teal-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h3>
              </div>
              <button 
                onClick={() => setPassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {passModalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
                {passModalError}
              </div>
            )}

            {passDemoOtp && passStep === 2 && (
              <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-semibold text-center">
                Demo OTP Code: <strong className="text-amber-200 font-mono tracking-widest text-sm underline">{passDemoOtp}</strong>
              </div>
            )}

            {passStep === 1 ? (
              <form onSubmit={handleRequestPasswordChange} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setPassModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !currentPassword || !newPassword}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20 flex items-center gap-1.5"
                  >
                    {loading ? 'Authorizing...' : 'Request OTP Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyPasswordChange} className="p-6 space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current password verified! Enter the 6-digit OTP code sent to <strong className="text-teal-400">{user?.email}</strong> to finalize your new password:
                </p>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={passOtp}
                    onChange={(e) => setPassOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3.5 px-4 text-center font-mono text-2xl font-bold tracking-[8px] rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 focus:ring-2 focus:ring-teal-500 outline-none text-teal-400"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setPassStep(1)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || passOtp.length !== 6}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20 flex items-center gap-1.5"
                  >
                    {loading ? 'Updating Password...' : 'Verify & Change Password'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
