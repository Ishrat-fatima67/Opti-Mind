import React, { useState, useRef, useEffect } from 'react';
import { JournalEntry, ChatMessage } from '../types';
import { createJournalChat, summarizeJournalSession } from '../services/gemini';
import { Send, MessageCircle, Sparkles, History, Save, RefreshCw, User, Bot } from 'lucide-react';

interface JournalProps {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
}

export const Journal: React.FC<JournalProps> = ({ entries, addEntry }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use a ref to store the chat instance so it persists across renders without triggering re-renders
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    startNewSession();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const startNewSession = () => {
    chatSessionRef.current = createJournalChat();
    setMessages([
      { role: 'model', text: "Hi there. Take a deep breath. How are you feeling right now? What's on your mind?" }
    ]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg });
      const responseText = result.text;
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a little trouble connecting. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveAndEnd = async () => {
    if (messages.length <= 1) return; // Don't save empty sessions
    setIsSaving(true);

    // Create a transcript string
    const transcript = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');

    try {
      const analysis = await summarizeJournalSession(transcript);
      
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        content: analysis.summary, // We save the summary as the main content for the history list
        sentiment: analysis.sentiment,
        aiReflection: analysis.advice,
        moodScore: analysis.moodScore
      };

      addEntry(newEntry);
      
      // Reset for new session
      startNewSession();
    } catch (e) {
      console.error("Save Error", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900/80 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden relative">
        {/* Header */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center z-10">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Sparkles className="text-indigo-500" size={20} />
                    AI Companion
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Interactive Coaching & Reflection</p>
            </div>
            <button 
                onClick={handleSaveAndEnd}
                disabled={isSaving || messages.length < 2}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
            >
                {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                Save Session
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                            <Bot size={16} className="text-white" />
                        </div>
                    )}
                    
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                        }`}>
                        {msg.text}
                    </div>

                    {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                            <User size={16} className="text-slate-500 dark:text-slate-400" />
                        </div>
                    )}
                </div>
            ))}
            
            {isTyping && (
                <div className="flex gap-4 justify-start">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                        <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700 flex items-center gap-1">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your response..."
                    disabled={isTyping}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white p-3 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
      </div>

      {/* History Sidebar */}
      <div className="hidden md:flex w-80 flex-col bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <History size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide">Past Insights</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {entries.length === 0 && (
                <div className="text-center text-slate-400 dark:text-slate-500 py-10 px-4">
                    <p className="text-sm">Complete a session to see your AI-generated insights here.</p>
                </div>
            )}
            
            {[...entries].reverse().map((entry) => (
                <div key={entry.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            {entry.timestamp.toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                        </span>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide
                            ${entry.moodScore >= 7 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
                              entry.moodScore <= 4 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}
                        `}>
                            {entry.sentiment}
                        </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 text-xs font-medium mb-2 line-clamp-2">{entry.content}</p>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg flex gap-2 border border-indigo-100 dark:border-indigo-800/50">
                        <MessageCircle className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" size={12} />
                        <p className="text-indigo-800 dark:text-indigo-200 text-[10px] leading-relaxed">
                            {entry.aiReflection}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
