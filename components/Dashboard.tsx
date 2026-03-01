import React from 'react';
import { AnalysisResult, JournalEntry } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { ShieldAlert, Zap, Users, BrainCircuit, History, Flame, Trophy } from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult | null;
  isDarkMode?: boolean;
  journalHistory?: JournalEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data, isDarkMode = false, journalHistory = [] }) => {
  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 animate-fade-in">
        <BrainCircuit size={48} className="mb-4 text-slate-200 dark:text-slate-700 animate-float" />
        <p>Complete your daily check-in to see insights.</p>
      </div>
    );
  }

  // Energy Chart Data
  const energyChartData = data.energyProjection.map((val, index) => ({
    hour: `+${index + 1}h`,
    energy: val
  }));

  // Mood History Data
  const moodHistoryData = journalHistory.slice(-10).map(entry => ({
    date: entry.timestamp.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).split(',')[0],
    score: entry.moodScore,
    sentiment: entry.sentiment,
    timestamp: entry.timestamp // for sorting if needed
  }));

  // Simple Streak Calculation (Gamification)
  const calculateStreak = () => {
    if (!journalHistory.length) return 0;
    // For MVP: Simple count of unique days in history
    const uniqueDays = new Set(journalHistory.map(e => e.timestamp.toDateString()));
    return uniqueDays.size;
  };

  const streak = calculateStreak();

  const getRiskColor = (risk: string) => {
    switch(risk.toLowerCase()) {
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';
    }
  };

  const getMoodBarColor = (score: number) => {
    if (score >= 8) return '#10b981'; // emerald-500
    if (score >= 6) return '#8b5cf6'; // violet-500
    if (score >= 4) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="p-2 md:p-6 space-y-6 max-w-5xl mx-auto mb-20 md:mb-0">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between animate-slide-in-left">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Performance & Wellness</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">AI-Predicted Energy Flow</p>
        </div>
        
        <div className="flex gap-3">
            {/* Gamification: Streak Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-full text-sm font-bold shadow-sm transition-transform hover:scale-105 cursor-default animate-scale-in" style={{ animationDelay: '200ms' }}>
                <Flame size={16} className="fill-orange-500 text-orange-600 animate-pulse" />
                <span>{streak} Day Streak</span>
            </div>

            {data.mentalHealthAlert && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-full text-sm font-semibold animate-pulse-soft">
                <ShieldAlert size={16} />
                High Stress Alert
            </div>
            )}
        </div>
      </div>

      {/* Main Energy Chart */}
      <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-64 md:h-80 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Projected Energy Levels</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={energyChartData}>
            <defs>
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDarkMode ? "#818cf8" : "#6366f1"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isDarkMode ? "#818cf8" : "#6366f1"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
            <XAxis 
              dataKey="hour" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} 
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                color: isDarkMode ? '#f1f5f9' : '#0f172a'
              }}
              itemStyle={{ color: isDarkMode ? '#e2e8f0' : '#334155' }}
            />
            <Area 
              type="monotone" 
              dataKey="energy" 
              stroke={isDarkMode ? "#818cf8" : "#6366f1"} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorEnergy)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Burnout Risk */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg cursor-default animate-fade-in-up ${getRiskColor(data.burnoutRisk)}`} style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={20} />
            <h3 className="font-bold">Burnout Risk: {data.burnoutRisk}</h3>
          </div>
          <p className="text-sm opacity-90">{data.burnoutExplanation}</p>
        </div>

        {/* Social Strategy */}
        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 cursor-default animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
            <Users size={20} />
            <h3 className="font-bold">Social Strategy</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{data.socialStrategy}</p>
        </div>

        {/* Recharge Tip */}
        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-800 cursor-default animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 mb-2 text-teal-600 dark:text-teal-400">
            <Zap size={20} />
            <h3 className="font-bold">Recharge Tip</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{data.rechargeTip}</p>
        </div>
      </div>

      {/* Mood History Chart */}
      {journalHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-64 md:h-80 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-2 mb-4">
             <History className="text-slate-400 dark:text-slate-500" size={18} />
             <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mood History (Last 10 Entries)</h3>
          </div>
          
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moodHistoryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10}} 
              />
              <YAxis hide domain={[0, 10]} />
              <Tooltip 
                cursor={{fill: isDarkMode ? '#334155' : '#f1f5f9', opacity: 0.4}}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                            <div className={`p-3 rounded-xl shadow-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100 text-slate-800'}`}>
                                <p className="font-bold text-sm mb-1">{data.date}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Score: {data.score}/10</span>
                                    <span className="text-xs font-medium text-indigo-500">{data.sentiment}</span>
                                </div>
                            </div>
                        );
                    }
                    return null;
                }}
              />
              <Bar dataKey="score" radius={[8, 8, 8, 8]} animationDuration={1500}>
                {moodHistoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getMoodBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};