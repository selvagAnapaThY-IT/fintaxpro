import Logo from './Logo';

export default function AuthCard({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-slate-100 font-sans relative overflow-hidden">
      {/* Background blobs for modern fintech look */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-accentOrange-500/10 blur-[150px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center">
          <Logo size="lg" textColor="light" showTagline={true} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
