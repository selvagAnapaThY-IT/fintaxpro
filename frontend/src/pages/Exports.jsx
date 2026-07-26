import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useStore } from '../store/useStore';
import { 
  Download, 
  FileSpreadsheet, 
  History, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function Exports() {
  const [activeTab, setActiveTab] = useState('csv'); // 'csv', 'gst', 'history'
  const [history, setHistory] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await api.get('/exports');
      setHistory(res.data);
    } catch (e) {
      console.error('Failed to load export records', e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const triggerDownload = async (endpoint, defaultFilename) => {
    setDownloading(true);
    setSuccessMsg('');
    try {
      const res = await api.post(endpoint, {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', defaultFilename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      setSuccessMsg('Download initiated successfully!');
      fetchHistory(); // refresh export history logs
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight font-sans">Export Center</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
          Generate accountant-ready financial spreadsheets, quarterly GST audits, and download audit logs.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-navy-800/80 gap-6">
        <button
          onClick={() => setActiveTab('csv')}
          className={`pb-4 text-sm font-semibold relative transition-all ${
            activeTab === 'csv'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4.5 w-4.5" />
            CSV Ledger Export
          </div>
        </button>

        <button
          onClick={() => setActiveTab('gst')}
          className={`pb-4 text-sm font-semibold relative transition-all ${
            activeTab === 'gst'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5" />
            GST Summaries
          </div>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 text-sm font-semibold relative transition-all ${
            activeTab === 'history'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <History className="h-4.5 w-4.5" />
            Export Audit History
          </div>
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          {successMsg}
        </div>
      )}

      {/* Tab Panels */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 shadow-sm">
        
        {/* CSV Panel */}
        {activeTab === 'csv' && (
          <div className="max-w-xl space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold font-sans">Download Complete Ledger CSV</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Export all your financial activity, category breakdowns, payment methods, and business classifications to a unified CSV spreadsheet format. This spreadsheet is compatible with Google Sheets, Microsoft Excel, and Zoho Books.
              </p>
            </div>

            <button
              onClick={() => triggerDownload('/exports/csv', `fin_transactions_${Date.now()}.csv`)}
              disabled={downloading}
              className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-teal-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              {downloading ? 'Compiling Spreadsheet...' : 'Download Transactions CSV'}
            </button>
          </div>
        )}

        {/* GST Panel */}
        {activeTab === 'gst' && (
          <div className="max-w-xl space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold font-sans">Generate Demo GST Audit Report</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Extract GSTR-1 matching tables summarizing quarterly gross outputs, input tax credits (ITC) claimed from business expenses, and net GST payable. Extremely helpful to calculate your tax pool before standard filing deadlines.
              </p>
            </div>

            <button
              onClick={() => triggerDownload('/exports/gst', `gst_summary_report_${Date.now()}.csv`)}
              disabled={downloading}
              className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-teal-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              {downloading ? 'Compiling GST Report...' : 'Download GST Audit Report'}
            </button>
          </div>
        )}

        {/* Audit History Panel */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-sans">Historical Export Requests</h3>
              <p className="text-xs text-slate-500 mt-1">Audit log of all file compilation activities</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-navy-800/80">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Export Request Type</th>
                    <th className="pb-3">Period Covered</th>
                    <th className="pb-3">Generated Filename</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800/80 text-sm">
                  {history.length > 0 ? (
                    history.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-850/50">
                        <td className="py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(record.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 font-semibold">{record.exportType}</td>
                        <td className="py-4 text-slate-500 text-xs font-medium whitespace-nowrap">
                          {record.periodStart || record.periodEnd ? (
                            `${record.periodStart || 'N/A'} to ${record.periodEnd || 'N/A'}`
                          ) : (
                            'Full Ledger'
                          )}
                        </td>
                        <td className="py-4 text-slate-500 font-mono text-xs">{record.filename}</td>
                        <td className="py-4 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            COMPLETED
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">
                        No export requests found in database history logs.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
