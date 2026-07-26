import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, RefreshCcw, Landmark, Wallet, ShieldAlert, BadgeInfo } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Analytics() {
  const analytics = useStore((state) => state.analytics);
  const loading = useStore((state) => state.loading);
  const fetchAnalytics = useStore((state) => state.fetchAnalytics);

  const [period, setPeriod] = useState('year'); // 'month', 'quarter', 'year'

  useEffect(() => {
    fetchAnalytics(period);
  }, [fetchAnalytics, period]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const COLORS = ['#14b8a6', '#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#facc15', '#64748b'];

  const getPieData = () => {
    if (!analytics?.categoryBreakdown) return [];
    return analytics.categoryBreakdown.map((item) => ({
      name: item.category,
      value: parseFloat(item.amount)
    }));
  };

  const getSplitData = () => {
    if (!analytics?.businessPersonalSplit) return [];
    return analytics.businessPersonalSplit.map((item) => ({
      name: item.tag,
      value: parseFloat(item.amount)
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Title with Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans">Financial Insights & Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Drill down into your cash flow patterns, expense allocations, and business-personal ratios.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-1.5 rounded-2xl shadow-sm">
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              period === 'month'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              period === 'quarter'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            This Quarter
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              period === 'year'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Financial Year
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Period Income"
          value={analytics?.summary?.totalIncome || 0}
          icon={Landmark}
          theme="teal"
          loading={!analytics}
        />
        <StatCard
          title="Period Expenses"
          value={analytics?.summary?.totalExpenses || 0}
          icon={Wallet}
          theme="gray"
          loading={!analytics}
        />
        <StatCard
          title="Net Earnings"
          value={analytics?.summary?.netEarnings || 0}
          icon={Wallet}
          theme="blue"
          loading={!analytics}
        />
        <StatCard
          title="Business Profit"
          value={analytics?.summary?.businessProfit || 0}
          icon={ShieldAlert}
          theme="teal"
          loading={!analytics}
        />
      </div>

      {/* Main Analysis Chart: Income vs Expense Trend */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold font-sans mb-6">Income vs Expense Trend</h3>
        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full flex justify-center items-center">
              <RefreshCcw className="h-6 w-6 animate-spin text-teal-500" />
            </div>
          ) : analytics?.trends && analytics.trends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1}/>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11}/>
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val/1000}k`}/>
                <Tooltip 
                  formatter={(val) => [formatCurrency(val), '']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Gross Inflow" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Gross Outflow" fill="#fb923c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              No trend data available for the selected period.
            </div>
          )}
        </div>
      </div>

      {/* Pie Chart distributions grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Share */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-lg font-bold font-sans mb-6">Expense Allocation by Category</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-64 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => [formatCurrency(val), '']}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend Labels */}
            <div className="flex-1 space-y-2 w-full max-h-64 overflow-y-auto">
              {getPieData().map((entry, idx) => (
                <div key={entry.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="font-medium text-slate-600 dark:text-slate-300">{entry.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(entry.value)}</span>
                </div>
              ))}
              {getPieData().length === 0 && (
                <div className="text-center text-slate-400 text-sm py-12">No data recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Business vs Personal ratio split */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-lg font-bold font-sans mb-6">Business vs Personal Split</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-64 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getSplitData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#0d9488" />
                    <Cell fill="#ea580c" />
                  </Pie>
                  <Tooltip 
                    formatter={(val) => [formatCurrency(val), '']}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Split Legend Labels */}
            <div className="flex-1 space-y-4 w-full">
              {getSplitData().map((entry, idx) => (
                <div key={entry.name} className="p-4 rounded-2xl border border-slate-100 dark:border-navy-850 bg-slate-50/40 dark:bg-navy-950/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{entry.name}</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{formatCurrency(entry.value)}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full ${idx === 0 ? 'bg-teal-600' : 'bg-accentOrange-500'}`}
                      style={{ 
                        width: `${
                          (entry.value / (getSplitData().reduce((a, b) => a + b.value, 0) || 1)) * 100
                        }%` 
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {Math.round((entry.value / (getSplitData().reduce((a, b) => a + b.value, 0) || 1)) * 100)}% of total period transactions
                  </span>
                </div>
              ))}
              {getSplitData().length === 0 && (
                <div className="text-center text-slate-400 text-sm py-12">No data recorded.</div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
