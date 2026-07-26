import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trendText, 
  trendDirection = 'up', // 'up', 'down', 'neutral'
  theme = 'teal', // 'teal', 'orange', 'blue', 'gray'
  loading = false 
}) {
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const themes = {
    teal: 'border-l-4 border-teal-500 hover:shadow-teal-500/5',
    orange: 'border-l-4 border-accentOrange-500 hover:shadow-accentOrange-500/5',
    blue: 'border-l-4 border-blue-500 hover:shadow-blue-500/5',
    gray: 'border-l-4 border-slate-400 hover:shadow-slate-400/5'
  };

  const iconBackgrounds = {
    teal: 'bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300',
    orange: 'bg-accentOrange-500/10 text-accentOrange-600 dark:bg-accentOrange-400/10 dark:text-accentOrange-300',
    blue: 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300',
    gray: 'bg-slate-500/10 text-slate-600 dark:bg-slate-400/10 dark:text-slate-300'
  };

  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-slate-500 dark:text-slate-400'
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800/80 rounded-2xl p-6 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-slate-200 dark:bg-navy-800 rounded w-1/3"></div>
          <div className="h-8 w-8 bg-slate-200 dark:bg-navy-800 rounded-full"></div>
        </div>
        <div className="h-8 bg-slate-200 dark:bg-navy-800 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-navy-800 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800/80 rounded-2xl p-6 shadow-sm glass-panel-hover ${themes[theme]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">{title}</p>
          <h3 className="text-2xl md:text-3xl font-extrabold font-sans mt-2 tracking-tight">
            {typeof value === 'number' ? formatCurrency(value) : value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBackgrounds[theme]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      
      {trendText && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className={`text-xs font-semibold ${trendColors[trendDirection]}`}>
            {trendText}
          </span>
        </div>
      )}
    </div>
  );
}
