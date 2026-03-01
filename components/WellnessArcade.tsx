import React, { useState, useEffect, useRef } from 'react';
import { generateMiniGame, getPeerChatResponse } from '../services/gemini';
import { GameContent, ChatMessage } from '../types';
import { Wind, HelpCircle, Users, Heart, Play, RefreshCw, Trophy, Send, X, MessageSquare, MapPin } from 'lucide-react';

interface WellnessArcadeProps {
  addPoints: (amount: number) => void;
  points: number;
}

export const WellnessArcade: React.FC<WellnessArcadeProps> = ({ addPoints, points }) => {
  const [activeTab, setActiveTab] = useState<'breathe' | 'trivia' | 'social'>('breathe');
  const [gameContent, setGameContent] = useState<GameContent | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Breathing State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathText, setBreathText] = useState('Ready?');

  // Chat State
  const [isChatting, setIsChatting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Breathing Logic
  useEffect(() => {
    let interval: any;
    if (breathingActive) {
      let phase = 0; // 0: Inhale, 1: Hold, 2: Exhale
      setBreathText('Inhale...');
      interval = setInterval(() => {
        phase = (phase + 1) % 3;
        if (phase === 0) setBreathText('Inhale...');
        else if (phase === 1) setBreathText('Hold...');
        else setBreathText('Exhale...');
      }, 4000);
      
      // Auto-stop and award points after 24s (2 cycles)
      setTimeout(() => {
        setBreathingActive(false);
        setBreathText('Great Job! +20 Zen');
        addPoints(20);
        clearInterval(interval);
      }, 24000);
    }
    return () => clearInterval(interval);
  }, [breathingActive]);

  // Chat Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isPeerTyping, isChatting]);

  const handleNewGame = async (type: 'riddle' | 'trivia') => {
    setIsLoading(true);
    setShowAnswer(false);
    const content = await generateMiniGame(type);
    setGameContent(content);
    setIsLoading(false);
  };

  const startChat = () => {
    setIsChatting(true);
    if (chatMessages.length === 0) {
        setChatMessages([{ role: 'model', text: "Hey! I'm Alex. Saw you matched as a Calm Anchor. Everything okay?" }]);
    }
  };

  const handleSendPeerMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsPeerTyping(true);

    try {
        const history = chatMessages.map(m => ({ role: m.role, text: m.text }));
        const response = await getPeerChatResponse(history, userMsg);
        setChatMessages(prev => [...prev, { role: 'model', text: response }]);
        
        // Gamification for socializing
        if (chatMessages.length === 2) {
             addPoints(15);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsPeerTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-6 h-full flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">Wellness Arcade</h2>
            <p className="text-slate-500 dark:text-slate-400">Recharge, Play, Connect.</p>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-amber-200 dark:border-amber-800">
            <Trophy size={18} className="text-amber-500" />
            {points} Zen Points
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 w-fit">
        {[
            { id: 'breathe', label: 'Breathe', icon: <Wind size={18} /> },
            { id: 'trivia', label: 'Brain Boost', icon: <HelpCircle size={18} /> },
            { id: 'social', label: 'Vibe Match', icon: <Users size={18} /> }
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setIsChatting(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
                {tab.icon} {tab.label}
            </button>
        ))}
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-12 flex flex-col items-center justify-center shadow-sm relative overflow-hidden min-h-[450px]">
        
        {/* Breathing UI */}
        {activeTab === 'breathe' && (
            <div className="text-center relative z-10 animate-fade-in">
                <div className={`w-64 h-64 rounded-full flex items-center justify-center text-2xl font-bold text-white transition-all duration-[4000ms] mb-8
                    ${breathingActive ? 'scale-125 bg-indigo-500 shadow-[0_0_60px_rgba(99,102,241,0.6)]' : 'scale-100 bg-slate-300 dark:bg-slate-700'}`}>
                    {breathText}
                </div>
                {!breathingActive && (
                    <button 
                        onClick={() => setBreathingActive(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition-all"
                    >
                        <Play size={20} fill="currentColor" /> Start Session
                    </button>
                )}
                <p className="mt-6 text-slate-400 text-sm">Follow the circle. Expand your lungs. Clear your mind.</p>
            </div>
        )}

        {/* Trivia UI */}
        {activeTab === 'trivia' && (
            <div className="max-w-lg w-full text-center space-y-6 animate-fade-in">
                {!gameContent ? (
                    <div className="text-center">
                        <HelpCircle size={64} className="mx-auto text-indigo-200 mb-4" />
                        <h3 className="text-xl font-bold mb-4">Ready for a quick challenge?</h3>
                        <div className="flex gap-4 justify-center">
                            <button onClick={() => handleNewGame('riddle')} disabled={isLoading} className="px-6 py-3 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-xl font-bold hover:scale-105 transition-transform">
                                Riddle Me
                            </button>
                            <button onClick={() => handleNewGame('trivia')} disabled={isLoading} className="px-6 py-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 rounded-xl font-bold hover:scale-105 transition-transform">
                                Brain Trivia
                            </button>
                        </div>
                        {isLoading && <RefreshCw className="animate-spin mx-auto mt-4 text-slate-400" />}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-medium leading-relaxed">{gameContent.question}</h3>
                        </div>
                        
                        {showAnswer ? (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-green-700 dark:text-green-300 font-bold animate-in zoom-in">
                                {gameContent.answer}
                            </div>
                        ) : (
                            <button onClick={() => { setShowAnswer(true); addPoints(10); }} className="text-indigo-600 hover:text-indigo-700 font-bold text-sm underline">
                                Reveal Answer (+10 Zen)
                            </button>
                        )}
                        
                        <button onClick={() => setGameContent(null)} className="block mx-auto text-slate-400 hover:text-slate-600 text-sm mt-8">
                            Play Again
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* Social UI */}
        {activeTab === 'social' && !isChatting && (
             <div className="text-center max-w-md animate-fade-in">
                <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-500">
                    <Heart size={32} fill="currentColor" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Campus Vibe Match</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Based on your current mood (Anxious/High Energy), our AI suggests you find a study buddy who is:
                </p>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-left mb-6 relative group hover:border-pink-300 transition-colors cursor-pointer" onClick={startChat}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-pink-500 rounded-l-2xl"></div>
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg">Alex (Calm Anchor)</h4>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                        Studying humanities. Chill vibes. Currently at the Library 3rd Floor. Great for parallel study sessions.
                    </p>
                    <div className="flex gap-2 text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><MapPin size={10}/> Library</span>
                        <span>•</span>
                        <span>Humanities</span>
                        <span>•</span>
                        <span>Low Stress</span>
                    </div>
                </div>
                <button 
                    onClick={startChat}
                    className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-pink-200 dark:shadow-none"
                >
                    <MessageSquare size={18} /> Chat to Coordinate
                </button>
             </div>
        )}

        {/* Live Chat UI */}
        {activeTab === 'social' && isChatting && (
            <div className="w-full h-full absolute inset-0 bg-white dark:bg-slate-900 flex flex-col animate-slide-in-right">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500">
                             <Heart size={18} fill="currentColor" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white leading-tight">Alex</h4>
                            <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online • Library
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsChatting(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-pink-500 text-white rounded-br-none' 
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isPeerTyping && (
                         <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700 flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSendPeerMessage(); }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Message Alex..."
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                        <button 
                            type="submit"
                            disabled={!chatInput.trim() || isPeerTyping}
                            className="bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 text-white p-3 rounded-xl transition-all shadow-sm"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};