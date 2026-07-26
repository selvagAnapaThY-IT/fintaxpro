import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  RefreshCcw, 
  Briefcase, 
  User as UserIcon,
  HelpCircle,
  FileText
} from 'lucide-react';
import TransactionModal from '../components/TransactionModal';

export default function Transactions() {
  const transactions = useStore((state) => state.transactions);
  const loading = useStore((state) => state.loading);
  const fetchTransactions = useStore((state) => state.fetchTransactions);
  const createTransaction = useStore((state) => state.createTransaction);
  const updateTransaction = useStore((state) => state.updateTransaction);
  const deleteTransaction = useStore((state) => state.deleteTransaction);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [tag, setTag] = useState('');
  const [source, setSource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTransactions({ search, type, tag, source, startDate, endDate });
  }, [fetchTransactions, type, tag, source, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions({ search, type, tag, source, startDate, endDate });
  };

  const handleAdd = () => {
    setEditingTx(null);
    setModalOpen(true);
  };

  const handleEdit = (tx) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    let success;
    const activeFilters = { search, type, tag, source, startDate, endDate };
    if (editingTx) {
      success = await updateTransaction(editingTx.id, data, activeFilters);
    } else {
      success = await createTransaction(data, activeFilters);
    }
    return success;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const activeFilters = { search, type, tag, source, startDate, endDate };
      await deleteTransaction(id, activeFilters);
    }
  };

  // Toggle business vs personal tag on the fly
  const handleToggleTag = async (tx) => {
    const updatedTag = tx.tag === 'BUSINESS' ? 'PERSONAL' : 'BUSINESS';
    const data = {
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      category: tx.category,
      source: tx.source,
      tag: updatedTag,
      gstRate: updatedTag === 'PERSONAL' ? 0 : 18,
      date: tx.date
    };
    const activeFilters = { search, type, tag, source, startDate, endDate };
    await updateTransaction(tx.id, data, activeFilters);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans">Transaction Ledger</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Categorize transactions, monitor GST rates, and correct business vs personal tags.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-teal-600/20 active:scale-[0.98] transition-all"
        >
          <Plus className="h-5 w-5" />
          Add Entry
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center">
          {/* Text Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by description or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-navy-800 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 rounded-2xl bg-slate-900 dark:bg-navy-800 text-white font-semibold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-2 border-t border-slate-100 dark:border-navy-800/80">
          {/* Type Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-semibold focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tax Classification</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-semibold focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="">All Tags</option>
              <option value="BUSINESS">💼 Business</option>
              <option value="PERSONAL">🏠 Personal</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-semibold focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="">All Sources</option>
              <option value="manual">Manual Entry</option>
              <option value="UPI">UPI</option>
              <option value="bank">NetBanking</option>
              <option value="card">Credit Card</option>
              <option value="SMS">SMS Parser</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-semibold focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-semibold focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-navy-800/80">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">GST Rate</th>
                <th className="px-6 py-4">Tag</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800/80 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCcw className="h-5 w-5 animate-spin text-teal-500" />
                      Loading transactions...
                    </div>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-850/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{tx.date}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{tx.description}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{tx.category}</td>
                    <td className="px-6 py-4 text-slate-400 uppercase text-xs font-semibold whitespace-nowrap">{tx.source}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{tx.gstRate || 0}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleTag(tx)}
                        title="Click to toggle business/personal tag"
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          tx.tag === 'BUSINESS'
                            ? 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-300 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500'
                            : 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400 hover:bg-teal-500/10 hover:border-teal-500/20 hover:text-teal-600'
                        }`}
                      >
                        {tx.tag === 'BUSINESS' ? (
                          <>
                            <Briefcase className="h-3 w-3" />
                            Business
                          </>
                        ) : (
                          <>
                            <UserIcon className="h-3 w-3" />
                            Personal
                          </>
                        )}
                      </button>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${
                      tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-1.5 text-slate-400 hover:text-teal-500 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 text-sm">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        transaction={editingTx}
      />

    </div>
  );
}
