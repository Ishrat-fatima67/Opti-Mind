import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Diagram } from '../types';
import { getMentorResponse } from '../services/gemini';
import { Send, Bot, User, ArrowRight, RefreshCw, Zap, BookOpen, Smile, ArrowDown, Repeat, MessageCircle, Ear, Users, Heart, Brain, Shield, Search, Mic, ThumbsUp, Sparkles } from 'lucide-react';

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
        role: 'model', 
        text: "Hi! I'm OptiGuide, your personal study & social mentor. \n\nI can help you with:\n• Smart study techniques (Active Recall, etc.)\n• Social skills & conversation tips\n• Visualizing complex topics\n\nWhat can I do for you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Pass last 10 messages as history context
      const history = messages.slice(-10).map(m => ({ role: m.role, text: m.text }));
      const response = await getMentorResponse(history, text);
      
      const modelMsg: ChatMessage = { 
          role: 'model', 
          text: response.text, 
          diagram: response.diagram 
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I lost my train of thought. Try again?" }]);
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

  // --- Visualizer Component for Diagrams ---
  const DiagramVisualizer = ({ diagram }: { diagram: Diagram }) => {
    if (!diagram) return null;

    const getIcon = (name?: string) => {
        if (!name) return <Sparkles size={20} />;
        const key = name.toLowerCase().replace(/[^a-z]/g, '');
        
        if (key.includes('message') || key.includes('speech') || key.includes('talk')) return <MessageCircle size={20} />;
        if (key.includes('listen') || key.includes('ear')) return <Ear size={20} />;
        if (key.includes('smile') || key.includes('happy')) return <Smile size={20} />;
        if (key.includes('user') || key.includes('group') || key.includes('friend')) return <Users size={20} />;
        if (key.includes('heart') || key.includes('love')) return <Heart size={20} />;
        if (key.includes('brain') || key.includes('think')) return <Brain size={20} />;
        if (key.includes('shield') || key.includes('safe') || key.includes('alert')) return <Shield size={20} />;
        if (key.includes('search')) return <Search size={20} />;
        if (key.includes('mic')) return <Mic size={20} />;
        if (key.includes('up') || key.includes('good')) return <ThumbsUp size={20} />;
        if (key.includes('zap') || key.includes('energy')) return <Zap size={20} />;
        
        return <Sparkles size={20} />;
    };

    return (
      <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-sm animate-scale-in origin-top">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Zap className="text-amber-500 animate-pulse" size={16} />
            <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase">{diagram.title}</h4>
        </div>
        
        <div className="flex flex-col items-center gap-2">
            {diagram.type === 'flowchart' && (
                <div className="flex flex-col gap-2 w-full max-w-xs">
                    {diagram.steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                            <div className="w-full p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 rounded-xl text-center shadow-sm hover:scale-105 transition-transform duration-300">
                                <span className="font-bold block text-sm">{step.label}</span>
                                {step.description && <span className="text-xs opacity-80">{step.description}</span>}
                            </div>
                            {idx < diagram.steps.length - 1 && (
                                <ArrowDown className="text-slate-300 dark:text-slate-600 my-1 animate-bounce" size={20} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {diagram.type === 'cycle' && (
                <div className="relative p-4">
                     {diagram.steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-4 mb-4 last:mb-0 animate-slide-in-right" style={{ animationDelay: `${idx * 150}ms` }}>
                             <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                                 {idx + 1}
                             </div>
                             <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex-1 shadow-sm">
                                <span className="font-bold block text-sm text-slate-800 dark:text-slate-200">{step.label}</span>
                                {step.description && <span className="text-xs text-slate-500 dark:text-slate-400">{step.description}</span>}
                             </div>
                        </div>
                    ))}
                    <div className="flex justify-center mt-2 text-indigo-500 text-xs font-bold items-center gap-1 uppercase tracking-wide animate-pulse">
                        <Repeat size={14} /> Repeating Cycle
                    </div>
                </div>
            )}

            {diagram.type === 'list' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                     {diagram.steps.map((step, idx) => (
                        <div key={idx} className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl flex items-start gap-3 animate-scale-in" style={{ animationDelay: `${idx * 100}ms` }}>
                             <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-full text-emerald-600 dark:text-emerald-300 shrink-0">
                                {getIcon(step.icon)}
                            </div>
                            <div>
                                <span className="font-bold block text-sm text-emerald-800 dark:text-emerald-300 mb-1">{step.label}</span>
                                {step.description && <span className="text-xs text-emerald-700 dark:text-emerald-400 leading-tight">{step.description}</span>}
                            </div>
                        </div>
                     ))}
                </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col p-2 md:p-6">
      <header className="flex justify-between items-end mb-4 px-2">
        <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 animate-slide-in-left">
                <Bot className="text-indigo-600 dark:text-indigo-400 animate-float" size={28} />
                OptiGuide Assistant
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 animate-fade-in" style={{ animationDelay: '200ms' }}>Your AI mentor for study & social success.</p>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-4 px-2 scrollbar-hide">
        <button onClick={() => handleSendMessage("How can I study smarter, not harder?")} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold whitespace-nowrap hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border border-indigo-100 dark:border-indigo-800 hover:scale-105 active:scale-95 animate-scale-in" style={{ animationDelay: '100ms' }}>
            <BookOpen size={14} /> Study Smarter
        </button>
        <button onClick={() => handleSendMessage("Give me tips for making new friends.")} className="flex items-center gap-2 px-4 py-2 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 rounded-full text-xs font-bold whitespace-nowrap hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-all border border-pink-100 dark:border-pink-800 hover:scale-105 active:scale-95 animate-scale-in" style={{ animationDelay: '200ms' }}>
            <Smile size={14} /> Social Tips
        </button>
        <button onClick={() => handleSendMessage("I'm feeling stressed. Help me visualize a calming technique.")} className="flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-xs font-bold whitespace-nowrap hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-all border border-teal-100 dark:border-teal-800 hover:scale-105 active:scale-95 animate-scale-in" style={{ animationDelay: '300ms' }}>
            <Zap size={14} /> Reduce Stress
        </button>
      </div>

      <div className="flex-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col relative animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                    {msg.role === 'model' && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 shadow-md">
                            <Bot size={20} className="text-white" />
                        </div>
                    )}
                    
                    <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap transition-all duration-300
                            ${msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none hover:bg-indigo-700' 
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-none hover:shadow-md'
                            }`}>
                            {msg.text}
                        </div>
                        
                        {/* Render Diagram if present */}
                        {msg.diagram && <DiagramVisualizer diagram={msg.diagram} />}
                    </div>

                    {msg.role === 'user' && (
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            <User size={20} className="text-slate-500 dark:text-slate-400" />
                        </div>
                    )}
                </div>
            ))}
            
            {isTyping && (
                <div className="flex gap-4 justify-start animate-pulse">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 shadow-md">
                        <Bot size={20} className="text-white" />
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

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask OptiGuide for help..."
                    disabled={isTyping}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl pl-5 pr-14 py-4 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 shadow-inner"
                />
                <button
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95"
                >
                    {isTyping ? <RefreshCw className="animate-spin" size={18} /> : <ArrowRight size={20} />}
                </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-2">
                AI Guidance can be inaccurate. OptiGuide helps visualize concepts for better understanding.
            </p>
        </div>
      </div>
    </div>
  );
};
