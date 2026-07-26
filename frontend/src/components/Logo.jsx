import React from 'react';

export function LogoIcon({ className = "h-10 w-10", size = 42 }) {
  return (
    <svg 
      viewBox="0 0 150 150" 
      width={size} 
      height={size} 
      className={`inline-block flex-shrink-0 ${className}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoBubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D9488" />
          <stop offset="50%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#115E59" />
        </linearGradient>
        
        <linearGradient id="logoShieldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Speech Bubble Base */}
      <path 
        d="M 75 10 C 39.1 10 10 39.1 10 75 C 10 93.6 17.8 110.4 30.4 122.3 C 27.5 133 21 142.5 12 147.5 C 26 148.5 40 142.5 50.5 135 C 58.2 138.2 66.4 140 75 140 C 110.9 140 140 110.9 140 75 C 140 39.1 110.9 10 75 10 Z" 
        fill="url(#logoBubbleGrad)"
      />
      
      {/* Shield Outline */}
      <path 
        d="M 75 30 C 93 34 106 37 111 39 C 111 76 99 100 75 117 C 51 100 39 76 39 39 C 44 37 57 34 75 30 Z" 
        fill="#042F2C" 
        fillOpacity="0.35" 
        stroke="url(#logoShieldStroke)" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Bar Chart Columns */}
      <rect x="57" y="72" width="6" height="15" rx="2" fill="#34D399" opacity="0.7"/>
      <rect x="67" y="64" width="6" height="23" rx="2" fill="#34D399" opacity="0.7"/>
      <rect x="77" y="58" width="6" height="29" rx="2" fill="#34D399" opacity="0.7"/>

      {/* Dollar Sign */}
      <text x="75" y="52" fontFamily="'Outfit', 'Inter', sans-serif" fontWeight="900" fontSize="18" fill="#FFFFFF" textAnchor="middle">$</text>

      {/* Upward Trend Line / Arrow */}
      <path d="M 44 91 L 67 76 L 80 84 L 109 50" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 109 50 L 95 52 M 109 50 L 107 65" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Checkmark */}
      <path d="M 91 83 L 96 88 L 104 77" stroke="#34D399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function Logo({ 
  showTagline = true, 
  iconOnly = false, 
  size = "md", // sm, md, lg, xl
  textColor = "auto" // auto, light, dark
}) {
  const iconSizes = {
    sm: 32,
    md: 42,
    lg: 56,
    xl: 72
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl"
  };

  const taglineSizes = {
    sm: "text-[9px]",
    md: "text-[11px]",
    lg: "text-xs",
    xl: "text-sm"
  };

  const currentSize = iconSizes[size] || 42;

  if (iconOnly) {
    return <LogoIcon size={currentSize} />;
  }

  return (
    <div className="flex items-center gap-3 font-sans">
      <LogoIcon size={currentSize} />
      <div className="flex flex-col justify-center">
        <div className="flex items-center tracking-tight font-extrabold leading-none">
          <span className={`${titleSizes[size]} ${
            textColor === 'light' ? 'text-white' : textColor === 'dark' ? 'text-slate-900' : 'text-slate-900 dark:text-white'
          }`}>
            FinTax
          </span>
          <span className={`${titleSizes[size]} text-emerald-500 ml-1.5`}>
            PRO
          </span>
        </div>
        {showTagline && (
          <span className={`${taglineSizes[size]} text-teal-600 dark:text-teal-400 font-medium tracking-wide mt-0.5`}>
            Your AI Tax &amp; Finance Chatbot
          </span>
        )}
      </div>
    </div>
  );
}
