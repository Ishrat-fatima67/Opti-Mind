import React, { useState, useMemo } from 'react';
import { UserInputState } from '../types';
import { Loader2, Sun, Moon, Battery, BatteryCharging, AlertTriangle, BookOpen, Clock, ListPlus, Users, Flame, Calendar, CheckCircle2, Sparkles } from 'lucide-react';

interface DailyCheckInProps {
  onSubmit: (data: UserInputState) => void;
  isLoading: boolean;
}

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({ onSubmit, isLoading }) => {
  const [mood, setMood] = useState(5);
  const [socialBattery, setSocialBattery] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [stress, setStress] = useState(3);
  const [tasks, setTasks] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      mood,
      socialBattery,
      sleepHours: sleep,
      currentStress: stress,
      upcomingTasks: tasks,
    });
  };

  const addTemplate = (type: string) => {
    const templates: Record<string, string> = {
      exam: "Task: [Subject] Final, Due: Today 2pm, Priority: High\n",
      study: "Task: Review [Topic], Due: Tomorrow, Priority: Medium\n",
      project: "Task: [Project Name], Due: [Date]\n",
      meeting: "Task: Group Sync, Due: Today 4pm\n"
    };
    setTasks(prev => (prev ? prev + '\n' : '') + templates[type]);
  };

  const parsedTasks = useMemo(() => {
    return tasks.split('\n').filter(t => t.trim().length > 0).map((line, idx) => {
      const lower = line.toLowerCase();
      const isUrgent = lower.includes('today') || 
                       lower.includes('tonight') || 
                       lower.includes('asap') || 
                       lower.includes('urgent') ||
                       lower.includes('now');
      
      let content = line;
      let dueDate = '';

      const taskMatch = line.match(/Task:\s*(.+?)(,|$)/i);
      const dueMatch = line.match(/Due:\s*(.+?)(,|$)/i);

      if (taskMatch) content = taskMatch[1].trim();
      if (dueMatch) dueDate = dueMatch[1].trim();

      return { id: idx, raw: line, content, dueDate, isUrgent };
    });
  }, [tasks]);

  const renderHighlightedText = (text: string, isUrgent: boolean) => {
    if (!isUrgent) return text;
    
    // Split by keywords, capturing the delimiter to preserve it
    const parts = text.split(/(today|tonight|asap|urgent|now)/gi);
    return parts.map((part, i) => {
      if (['today', 'tonight', 'asap', 'urgent', 'now'].includes(part.toLowerCase())) {
        return (
          <span key={i} className="bg-rose-200 dark:bg-rose-500/30 text-rose-700 dark:text-rose-200 px-1 py-0.5 rounded mx-0.5 text-[10px] uppercase font-bold tracking-wide border border-rose-300 dark:border-rose-600/50 inline-block transform -translate-y-px">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="mb-12 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl -z-10 transition-colors duration-500"></div>
        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-indigo-400 mb-3 tracking-tight">
          Daily Sync
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium flex items-center justify-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          Calibrate your AI assistant for peak flow
          <Sparkles size={16} className="text-amber-400" />
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Biometrics Card */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-sm border border-white/60 dark:border-slate-700/60 relative overflow-hidden transition-all duration-300 group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-80"></div>
            
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-violet-600 dark:text-violet-400">
                    <BatteryCharging size={24} /> 
                </div>
                <span>Biometric Status</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-8">
                 {/* Mood Slider */}
                <div className="space-y-4">
                    <label className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                        <span className="flex items-center gap-2"><Sun className="text-amber-400 w-5 h-5"/> Mood</span>
                        <span className="text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 px-4 py-1 rounded-full text-sm shadow-sm border border-violet-100 dark:border-violet-800">{mood}/10</span>
                    </label>
                    <input
                        type="range" min="1" max="10" value={mood}
                        onChange={(e) => setMood(Number(e.target.value))}
                        className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-600 hover:accent-violet-500 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    />
                    <div className="flex justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
                        <span>😫 Drained</span>
                        <span>🤩 Excellent</span>
                    </div>
                </div>

                {/* Social Battery */}
                <div className="space-y-4">
                    <label className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                        <span className="flex items-center gap-2"><Users className="text-emerald-500 w-5 h-5"/> Social Battery</span>
                        <span className="text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1 rounded-full text-sm shadow-sm border border-emerald-100 dark:border-emerald-800">{socialBattery}/10</span>
                    </label>
                    <input
                        type="range" min="1" max="10" value={socialBattery}
                        onChange={(e) => setSocialBattery(Number(e.target.value))}
                        className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <div className="flex justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
                        <span>🔒 Hermit</span>
                        <span>🎉 Party</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Sleep Input */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-700 hover:bg-white dark:hover:bg-slate-800 transition-all group/input shadow-sm">
                    <label className="flex items-center gap-2 mb-3 font-semibold text-slate-600 dark:text-slate-300 group-hover/input:text-violet-600 dark:group-hover/input:text-violet-400 transition-colors">
                        <Moon className="text-indigo-400 w-5 h-5"/> Sleep (Hours)
                    </label>
                    <input
                        type="number" min="0" max="24" value={sleep}
                        onChange={(e) => setSleep(Number(e.target.value))}
                        className="w-full bg-transparent p-2 border-b-2 border-slate-200 dark:border-slate-600 focus:border-violet-500 focus:outline-none text-2xl font-bold text-slate-800 dark:text-white transition-colors placeholder-slate-300"
                    />
                </div>
                 {/* Stress Input */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-700 hover:bg-white dark:hover:bg-slate-800 transition-all group/input shadow-sm">
                    <label className="flex items-center gap-2 mb-3 font-semibold text-slate-600 dark:text-slate-300 group-hover/input:text-rose-600 dark:group-hover/input:text-rose-400 transition-colors">
                        <AlertTriangle className="text-rose-400 w-5 h-5"/> Stress Level
                    </label>
                    <input
                        type="number" min="1" max="10" value={stress}
                        onChange={(e) => setStress(Number(e.target.value))}
                        className="w-full bg-transparent p-2 border-b-2 border-slate-200 dark:border-slate-600 focus:border-rose-500 focus:outline-none text-2xl font-bold text-slate-800 dark:text-white transition-colors placeholder-slate-300"
                    />
                </div>
            </div>
        </div>

        {/* Tasks Card */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-sm border border-white/60 dark:border-slate-700/60 relative overflow-hidden transition-all duration-300">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 opacity-80"></div>
             
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
                        <ListPlus size={24} /> 
                    </div>
                    <span>Academic & Life Load</span>
                </h3>
             </div>

             {/* Quick Templates */}
             <div className="flex flex-wrap gap-2 mb-6">
                <button type="button" onClick={() => addTemplate('exam')} className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:scale-105 active:scale-95 rounded-xl text-sm font-semibold transition-all border border-rose-100 dark:border-rose-800 shadow-sm">
                    <BookOpen size={16}/> Exam
                </button>
                <button type="button" onClick={() => addTemplate('study')} className="flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40 hover:scale-105 active:scale-95 rounded-xl text-sm font-semibold transition-all border border-sky-100 dark:border-sky-800 shadow-sm">
                    <Clock size={16}/> Study
                </button>
                 <button type="button" onClick={() => addTemplate('project')} className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:scale-105 active:scale-95 rounded-xl text-sm font-semibold transition-all border border-amber-100 dark:border-amber-800 shadow-sm">
                    <Users size={16}/> Project
                </button>
                 <button type="button" onClick={() => addTemplate('meeting')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:scale-105 active:scale-95 rounded-xl text-sm font-semibold transition-all border border-emerald-100 dark:border-emerald-800 shadow-sm">
                    <Calendar size={16}/> Meeting
                </button>
             </div>

             <div className="flex flex-col lg:flex-row gap-8">
                {/* Text Area */}
                <div className="relative group flex-1">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-300 to-orange-300 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                    <textarea
                        rows={7}
                        placeholder="What's on your plate?&#10;Try: 'Task: Math Final, Due: Today'"
                        value={tasks}
                        onChange={(e) => setTasks(e.target.value)}
                        className="relative w-full p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent focus:outline-none resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed font-medium text-sm shadow-inner transition-colors"
                    />
                </div>

                {/* Live Analysis */}
                <div className="flex-1">
                    <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 h-full min-h-[180px]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center justify-between">
                            <span>Detected Schedule</span>
                            {parsedTasks.length > 0 && <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px]">{parsedTasks.length}</span>}
                        </h4>
                        
                        {parsedTasks.length === 0 ? (
                            <div className="h-32 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                                <ListPlus size={32} className="mb-2 opacity-40"/>
                                <span className="text-sm font-medium">Add tasks to visualize</span>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {parsedTasks.map((task) => (
                                    <div 
                                        key={task.id} 
                                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all duration-300
                                            ${task.isUrgent 
                                                ? 'bg-rose-50/80 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 shadow-sm translate-x-1' 
                                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            {task.isUrgent ? (
                                                <div className="p-1.5 bg-rose-100 dark:bg-rose-900/50 text-rose-500 dark:text-rose-400 rounded-lg shrink-0 animate-pulse">
                                                    <Flame size={14} fill="currentColor" />
                                                </div>
                                            ) : (
                                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg shrink-0">
                                                    <CheckCircle2 size={14} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold truncate ${task.isUrgent ? 'text-rose-900 dark:text-rose-200' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {renderHighlightedText(task.content || task.raw, task.isUrgent)}
                                                </p>
                                                {task.dueDate && (
                                                    <p className="text-[11px] mt-0.5 font-medium flex items-center gap-1 opacity-80 text-slate-500 dark:text-slate-400">
                                                        <Clock size={10} /> Due: {renderHighlightedText(task.dueDate, task.isUrgent)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {task.isUrgent && (
                                            <span className="shrink-0 text-[10px] bg-rose-500 text-white px-2 py-1 rounded-md font-bold uppercase tracking-wide shadow-sm shadow-rose-200 dark:shadow-none">
                                                Urgent
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white font-bold py-5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(139,92,246,0.5)] dark:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.3)] transition-all transform hover:scale-[1.01] hover:-translate-y-1 active:scale-[0.99] flex items-center justify-center gap-3 text-lg relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" /> Analyzing Biometrics...
            </>
          ) : (
            <>
              <Sparkles className="fill-white" /> Generate Daily Optimizer
            </>
          )}
        </button>
      </form>
    </div>
  );
};