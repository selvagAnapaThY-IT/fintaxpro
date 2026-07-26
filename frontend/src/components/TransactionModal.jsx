import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Sparkles, Loader2 } from 'lucide-react';
import api from '../services/api';

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.preprocess(
    (val) => parseFloat(val),
    z.number().positive({ message: 'Amount must be a positive number' })
  ),
  description: z.string().min(3, { message: 'Description must be at least 3 characters' }),
  category: z.string().min(2, { message: 'Category is required' }),
  source: z.enum(['UPI', 'bank', 'SMS', 'card', 'manual']),
  tag: z.enum(['BUSINESS', 'PERSONAL']),
  gstRate: z.preprocess(
    (val) => (val === '' || val === undefined ? 0 : parseFloat(val)),
    z.number().min(0).max(100)
  ),
  date: z.string().min(1, { message: 'Date is required' }),
});

export default function TransactionModal({ isOpen, onClose, onSave, transaction = null }) {
  const [aiCategorizing, setAiCategorizing] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'INCOME',
      amount: '',
      description: '',
      category: '',
      source: 'manual',
      tag: 'BUSINESS',
      gstRate: 18,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchTag = watch('tag');
  const watchType = watch('type');
  const watchDescription = watch('description');
  const watchAmount = watch('amount');

  // AI Auto Categorization call
  const handleAiCategorize = async () => {
    if (!watchDescription || watchDescription.trim().length < 3) return;
    setAiCategorizing(true);
    setAiReasoning('');
    try {
      const response = await api.post('/ai/categorize', {
        description: watchDescription,
        amount: watchAmount ? parseFloat(watchAmount) : null,
        type: watchType
      });
      const data = response.data;
      if (data) {
        if (data.type) setValue('type', data.type);
        if (data.category) setValue('category', data.category);
        if (data.tag) setValue('tag', data.tag);
        if (data.gstRate !== undefined) setValue('gstRate', data.gstRate);
        if (data.reasoning) setAiReasoning(data.reasoning);
      }
    } catch (err) {
      console.error('Error during AI categorization:', err);
    } finally {
      setAiCategorizing(false);
    }
  };

  // Automatically adjust GST Rate in form based on Business vs Personal selection
  useEffect(() => {
    if (watchTag === 'PERSONAL') {
      setValue('gstRate', 0);
    } else if (watchTag === 'BUSINESS' && watchTag !== transaction?.tag) {
      setValue('gstRate', 18);
    }
  }, [watchTag, setValue, transaction]);

  // Pre-fill form if editing
  useEffect(() => {
    setAiReasoning('');
    if (transaction) {
      reset({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        source: transaction.source,
        tag: transaction.tag,
        gstRate: transaction.gstRate,
        date: transaction.date,
      });
    } else {
      reset({
        type: 'INCOME',
        amount: '',
        description: '',
        category: '',
        source: 'manual',
        tag: 'BUSINESS',
        gstRate: 18,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [transaction, reset, isOpen]);

  if (!isOpen) return null;

  const categories = {
    INCOME: ['Freelance Income', 'Consulting', 'SaaS Licensing', 'Ad Revenue', 'Royalty', 'Investment', 'Other Income'],
    EXPENSE: ['SaaS Subscription', 'Office Rent', 'Internet & Utilities', 'Work Laptop', 'Travel (Business)', 'Groceries', 'Dining Out', 'Movies', 'Rent (Home)', 'Shopping (Personal)', 'Tax Prep', 'Hardware & Gadgets', 'Other Expense']
  };

  const onSubmit = async (data) => {
    const success = await onSave(data);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-navy-800/80">
          <h3 className="text-lg font-bold font-sans">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          {/* Type Selector Tabs */}
          <div className="flex bg-slate-100 dark:bg-navy-950 p-1 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                watchType === 'INCOME'
                  ? 'bg-white dark:bg-navy-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
              onClick={() => setValue('type', 'INCOME')}
            >
              Income
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                watchType === 'EXPENSE'
                  ? 'bg-white dark:bg-navy-800 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
              onClick={() => setValue('type', 'EXPENSE')}
            >
              Expense
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Amount (INR)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                {...register('amount')}
              />
              {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                {...register('date')}
              />
              {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
              <button
                type="button"
                onClick={handleAiCategorize}
                disabled={!watchDescription || watchDescription.trim().length < 3 || aiCategorizing}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 disabled:opacity-40 transition-all bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1 rounded-lg border border-teal-500/20"
                title="Use Gemini AI to automatically infer category, tax tag, and GST rate"
              >
                {aiCategorizing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Auto-Fill with AI</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. AWS Cloud Hosting Payment"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
              {...register('description')}
            />
            {aiReasoning && (
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1 font-medium">
                <Sparkles className="h-3 w-3 inline flex-shrink-0" /> AI Rationale: {aiReasoning}
              </p>
            )}
            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                {...register('category')}
              >
                <option value="">Select Category</option>
                {categories[watchType].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category.message}</p>}
            </div>

            {/* Payment Source */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Payment Method</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                {...register('source')}
              >
                <option value="manual">Manual Entry</option>
                <option value="UPI">UPI</option>
                <option value="bank">NetBanking / Bank Transfer</option>
                <option value="card">Credit / Debit Card</option>
                <option value="SMS">SMS Parsed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-navy-800/80 pt-4">
            {/* Tag Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Tax Classification</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm font-semibold text-teal-600 dark:text-teal-400"
                {...register('tag')}
              >
                <option value="BUSINESS">💼 Business Expense</option>
                <option value="PERSONAL">🏠 Personal Expense</option>
              </select>
            </div>

            {/* GST Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">GST Rate (%)</label>
              <select
                disabled={watchTag === 'PERSONAL'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm disabled:opacity-50"
                {...register('gstRate')}
              >
                <option value="0">0% GST</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST (Standard Services)</option>
                <option value="28">28% GST</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-navy-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20"
            >
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
