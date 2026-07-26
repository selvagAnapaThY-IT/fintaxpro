import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import StatCard from '../components/StatCard';
import TransactionModal from '../components/TransactionModal';
import { 
  Plus, 
  TrendingUp, 
  ArrowRight, 
  Coins, 
  Calculator, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download,
  AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const summary = useStore((state) => state.summary);
  const loading = useStore((state) => state.loading);
  const fetchSummary = useStore((state) => state.fetchSummary);
  const createTransaction = useStore((state) => state.createTransaction);
  const user = useStore((state) => state.user);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleAddTransaction = async (data) => {
    const success = await createTransaction(data);
    if (success) {
      fetchSummary(); // refresh dashboard stats
    }
    return success;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const mockTrends = [
    { label: 'Apr', income: 120000, expense: 55000 },
    { label: 'May', income: 150000, expense: 78000 },
    { label: 'Jun', income: 220000, expense: 95000 },
    { label: 'Jul', income: 95000, expense: 48000 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans">
            Hello, {user?.name || 'Freelancer'}! 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Here is your real-time tax liability and cash flow summary for FY 2025-26.
          </p>
        </div>

        {/* Quick actions panel */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-teal-600/20 active:scale-[0.98] transition-all"
          >
            <Plus className="h-5 w-5" />
            Add Transaction
          </button>
          
          <button
            onClick={() => navigate('/exports')}
            className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-navy-800 active:scale-[0.98] transition-all"
          >
            <Download className="h-5 w-5 text-slate-500" />
            Export CA Data
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Income"
          value={summary?.totalIncome || 0}
          icon={TrendingUp}
          trendText="Business + Personal Inflow"
          theme="teal"
          loading={!summary}
        />
        
        <StatCard
          title="Net Business Income"
          value={summary?.netBusinessIncome || 0}
          icon={Coins}
          trendText="Excludes personal transfers"
          theme="blue"
          loading={!summary}
        />

        <StatCard
          title="Income Smoother Pot"
          value={summary?.potBalance || 0}
          icon={Coins}
          trendText=" Irregular cash reserve pot"
          theme="teal"
          loading={!summary}
        />

        <StatCard
          title="Estimated GST Payable"
          value={summary?.gstPayable || 0}
          icon={Calculator}
          trendText="Quarterly GST obligation"
          theme="orange"
          loading={!summary}
        />

        <StatCard
          title="Estimated Income Tax"
          value={summary?.estimatedTax || 0}
          icon={Calculator}
          trendText="Presumptive slab calculations"
          theme="orange"
          loading={!summary}
        />

        <StatCard
          title="Total Outflow / Expenses"
          value={summary?.totalExpenses || 0}
          icon={TrendingUp}
          trendText="Business deductions + Personal"
          theme="gray"
          loading={!summary}
        />
      </div>

      {/* Charts & AI Insights panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Flow Mini Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-sans">Cash Flow Trend</h3>
            <button 
              onClick={() => navigate('/analytics')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
            >
              Detailed Analytics
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1}/>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11}/>
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val/1000}k`}/>
                <Tooltip 
                  formatter={(val) => [formatCurrency(val), '']} 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="income" name="Income" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Smart Insights */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold font-sans">Smart Financial Advice</h3>
          </div>

          <div className="flex-1 space-y-4">
            {summary?.insights && summary.insights.length > 0 ? (
              summary.insights.map((insight) => (
                <div 
                  key={insight.id} 
                  className={`p-4 rounded-2xl border text-sm ${
                    insight.priority === 'HIGH'
                      ? 'bg-rose-500/5 border-rose-200 dark:border-rose-950/80 text-slate-700 dark:text-slate-200'
                      : 'bg-teal-500/5 border-teal-200 dark:border-teal-950/80 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5 font-bold">
                    <AlertCircle className={`h-4.5 w-4.5 ${insight.priority === 'HIGH' ? 'text-rose-500' : 'text-teal-500'}`} />
                    <span>{insight.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm py-12">
                No active recommendations. Keep adding transactions!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Ledger Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800/80 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold font-sans font-semibold">Recent Ledger Entries</h3>
            <p className="text-xs text-slate-500 mt-1">Showing latest transaction uploads</p>
          </div>
          
          <button 
            onClick={() => navigate('/transactions')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
          >
            View All Ledger Entries
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-navy-800/80">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Date</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Source</th>
                <th className="pb-3">Tag</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800/80 text-sm">
              {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
                summary.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-850/50 transition-colors">
                    <td className="py-4 text-slate-500 dark:text-slate-400">{tx.date}</td>
                    <td className="py-4 font-medium">{tx.description}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">{tx.category}</td>
                    <td className="py-4 text-slate-400 uppercase text-xs font-semibold">{tx.source}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        tx.tag === 'BUSINESS'
                          ? 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-300'
                          : 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400'
                      }`}>
                        {tx.tag}
                      </span>
                    </td>
                    <td className={`py-4 text-right font-bold ${
                      tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                    No transactions added yet. Click 'Add Transaction' to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddTransaction}
      />
    </div>
  );
}
