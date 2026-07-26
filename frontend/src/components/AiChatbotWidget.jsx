import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, X, ChevronDown, User, RefreshCw, Zap } from 'lucide-react';
import api from '../services/api';
import { LogoIcon } from './Logo';

export default function AiChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Namaste! I am **FinTax AI Advisor**. How can I help with your Indian tax calculations, Section 44ADA, or GST filing today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const messagesEndRef = useRef(null);

  const suggestionChips = [
    'How does Sec 44ADA work?',
    'GST LUT rules for IT exports?',
    'Advance Tax due dates for 2025-26?',
    'Can I claim Macbook as business expense?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || prompt;
    if (!query || !query.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { prompt: query });
      const aiReply = response.data?.reply || 'Sorry, I could not retrieve tax guidance right now.';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error('Error calling AI chat endpoint:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: '⚠️ Network error communicating with AI backend. Please verify your backend server connection.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-5 py-3 rounded-full bg-slate-900 border border-slate-700/80 text-white font-semibold shadow-2xl hover:shadow-teal-500/30 hover:scale-105 transition-all duration-300"
          title="Open FinTax AI Advisor"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-400 border-2 border-slate-900"></span>
          </span>
          <LogoIcon size={32} />
          <span className="text-sm font-bold tracking-wide">FinTax <span className="text-emerald-400">AI</span></span>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[580px] flex flex-col bg-slate-900 dark:bg-navy-950 border border-slate-800 dark:border-navy-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <LogoIcon size={36} />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">FinTax AI Advisor</h3>
                </div>
                <p className="text-[11px] text-slate-400">CA Tax & Compliance Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                title="Minimize"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="h-7 w-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 flex-shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}

                <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>
                  <div className={`text-[10px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-teal-200/70' : 'text-slate-400'}`}>
                    {msg.time}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 flex-shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="h-7 w-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 flex-shrink-0">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                </div>
                <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-teal-300 animate-pulse flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5" />
                  Analyzing Indian Income Tax & GST rules...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips (shown if only 1 message or when user wants ideas) */}
          {messages.length < 5 && !loading && (
            <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800/80 flex gap-2 overflow-x-auto no-scrollbar">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="flex-shrink-0 text-[11px] px-3 py-1 rounded-full bg-slate-800 hover:bg-teal-950 hover:text-teal-300 text-slate-300 border border-slate-700 transition-colors"
                >
                  ⚡ {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about 44ADA, GST, tax saving..."
              className="flex-1 bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              disabled={loading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!prompt.trim() || loading}
              className="h-10 w-10 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
