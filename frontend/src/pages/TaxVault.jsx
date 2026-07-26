import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import StatCard from '../components/StatCard';
import { 
  ShieldCheck, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  AlertCircle,
  HelpCircle as HelpIcon,
  RefreshCcw,
  Sparkles
} from 'lucide-react';

export default function TaxVault() {
  const taxSummary = useStore((state) => state.taxSummary);
  const potHistory = useStore((state) => state.potHistory);
  const loading = useStore((state) => state.loading);
  const fetchTaxSummary = useStore((state) => state.fetchTaxSummary);
  const fetchPotHistory = useStore((state) => state.fetchPotHistory);
  const simulatePotTx = useStore((state) => state.simulatePotTx);

  // Simulator Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('DEPOSIT');
  const [description, setDescription] = useState('');
  const [simError, setSimError] = useState('');

  useEffect(() => {
    fetchTaxSummary();
    fetchPotHistory();
  }, [fetchTaxSummary, fetchPotHistory]);

  const handleSimulateSubmit = async (e) => {
    e.preventDefault();
    setSimError('');
    if (!amount || parseFloat(amount) <= 0) {
      setSimError('Enter a valid amount');
      return;
    }

    const success = await simulatePotTx(type, amount, description || (type === 'DEPOSIT' ? 'Custom Reserve' : 'Smoothening Payout'));
    if (success) {
      setAmount('');
      setDescription('');
    } else {
      setSimError('Simulation failed. Check pot balance limits.');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Determine user risk status
  const getRiskStatus = () => {
    if (!taxSummary) return { label: 'Analyzing', color: 'text-slate-400', bg: 'bg-slate-500/10' };
    const payable = taxSummary.gstPayable || 0;
    const estTax = taxSummary.estimatedIncomeTax || 0;
    const totalObligations = payable.add ? payable.add(estTax) : (payable + estTax);
    
    if (totalObligations > 50000) {
      return { label: 'HIGH TAX EXPOSURE', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
    } else if (totalObligations > 15000) {
      return { label: 'MODERATE TAX EXPOSURE', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    } else {
      return { label: 'OPTIMAL TAX STATUS', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    }
  };

  const risk = getRiskStatus();

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans">Tax Vault & Obligations</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Monitor real-time Indian GST outputs, presumptive income tax slabs, and cash buffers.
          </p>
        </div>

        {/* Risk Badge */}
        <div className={`px-4 py-2 rounded-2xl border text-xs font-bold ${risk.bg} ${risk.color}`}>
          {risk.label}
        </div>
      </div>

      {/* Tax Vault Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="GST Output (Collected)"
          value={taxSummary?.gstOutput || 0}
          icon={ShieldCheck}
          theme="teal"
          loading={!taxSummary}
        />
        <StatCard
          title="GST Input (Eligible Credit)"
          value={taxSummary?.gstInput || 0}
          icon={ShieldCheck}
          theme="gray"
          loading={!taxSummary}
        />
        <StatCard
          title="Net GST Payable"
          value={taxSummary?.gstPayable || 0}
          icon={AlertCircle}
          theme="orange"
          loading={!taxSummary}
        />
        <StatCard
          title="Estimated Income Tax"
          value={taxSummary?.estimatedIncomeTax || 0}
          icon={ShieldCheck}
          theme="orange"
          loading={!taxSummary}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tax Slab Presumptive relief guide */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold font-sans">Section 44ADA Presumptive Taxation relief</h3>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              For professionals and developers earning gross receipts under ₹75 Lakhs, <strong>Section 44ADA</strong> allows declaring only <strong>50% of your earnings</strong> as taxable profits, reducing bookkeeping burdens. Our tax estimates automatically compute the lower of Presumptive and Regular business calculations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-navy-850 bg-slate-50/40 dark:bg-navy-950/20">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">PAN Holder</span>
                <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1 block uppercase">{taxSummary?.pan || 'NOT PROVIDED'}</span>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 dark:border-navy-850 bg-slate-50/40 dark:bg-navy-950/20">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Eligible GSTIN</span>
                <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1 block uppercase">{taxSummary?.gstin || 'NOT REGISTERED'}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-navy-800/80">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Advance Tax Installments Targets</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Q1 - 15% (Jun 15)</span>
                <span className="text-sm font-bold block mt-1">{formatCurrency((taxSummary?.estimatedIncomeTax || 0) * 0.15)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Q2 - 45% (Sep 15)</span>
                <span className="text-sm font-bold block mt-1">{formatCurrency((taxSummary?.estimatedIncomeTax || 0) * 0.45)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Q3 - 75% (Dec 15)</span>
                <span className="text-sm font-bold block mt-1">{formatCurrency((taxSummary?.estimatedIncomeTax || 0) * 0.75)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Q4 - 100% (Mar 15)</span>
                <span className="text-sm font-bold block mt-1">{formatCurrency((taxSummary?.estimatedIncomeTax || 0) * 1.0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Obligation deadlines reminders */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold font-sans mb-4">Obligation Reminders</h3>
          <div className="flex-1 space-y-4">
            {taxSummary?.upcomingDeadlines && taxSummary.upcomingDeadlines.length > 0 ? (
              taxSummary.upcomingDeadlines.map((dl, idx) => (
                <div key={idx} className="flex gap-3.5 items-start p-3 hover:bg-slate-50/50 dark:hover:bg-navy-850/50 rounded-2xl transition-colors">
                  <div className={`p-2 rounded-xl mt-0.5 ${
                    dl.status === 'OVERDUE' 
                      ? 'bg-rose-500/10 text-rose-500' 
                      : dl.status === 'FILED' 
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-500/10 text-slate-500 dark:text-slate-300'
                  }`}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{dl.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">Due Date: {dl.dueDate}</p>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-2 border uppercase ${
                      dl.status === 'OVERDUE'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                        : dl.status === 'FILED'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                          : 'bg-slate-500/10 border-slate-500/20 text-slate-500 dark:text-slate-400'
                    }`}>
                      {dl.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 py-12 text-sm">
                No reminders found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Income Smoother Feature */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pot Simulation Form */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-bold font-sans">Income Smoother Simulator</h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Freelancers face volatile earnings. Use the Income Smoother pot to set aside money during high-paying project cycles, and withdraw buffer cash during lean periods.
            </p>

            {simError && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold">
                {simError}
              </div>
            )}

            <form onSubmit={handleSimulateSubmit} className="space-y-4">
              {/* Type Switcher tabs */}
              <div className="flex bg-slate-100 dark:bg-navy-950 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('DEPOSIT')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    type === 'DEPOSIT'
                      ? 'bg-white dark:bg-navy-800 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <ArrowUpRight className="h-3 w-3 inline mr-1" />
                  Deposit Reserve
                </button>
                <button
                  type="button"
                  onClick={() => setType('WITHDRAW')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    type === 'WITHDRAW'
                      ? 'bg-white dark:bg-navy-800 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <ArrowDownLeft className="h-3 w-3 inline mr-1" />
                  Withdraw Buffer
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Amount (INR)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Set aside Q1 Client bonus"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                  type === 'DEPOSIT'
                    ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                }`}
              >
                {loading ? 'Processing...' : type === 'DEPOSIT' ? 'Confirm Deposit' : 'Confirm Payout'}
              </button>
            </form>
          </div>
        </div>

        {/* Pot History List */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-sans mb-4">Smoother Pot Logs</h3>
            <div className="overflow-y-auto max-h-80">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-navy-800/80">
                <thead>
                  <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Activity Description</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800/80 text-xs">
                  {potHistory && potHistory.length > 0 ? (
                    potHistory.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-850/50">
                        <td className="py-3 text-slate-500 dark:text-slate-400">{tx.date}</td>
                        <td className="py-3">
                          <div className="font-semibold">{tx.description}</div>
                          <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase mt-1 ${
                            tx.type === 'DEPOSIT'
                              ? 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-300'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`py-3 text-right font-bold ${
                          tx.type === 'DEPOSIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {tx.type === 'DEPOSIT' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-slate-400">
                        No transactions simulated in Income Smoother yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
