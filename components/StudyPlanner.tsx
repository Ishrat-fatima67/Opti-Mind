import React from 'react';
import { AnalysisResult } from '../types';
import { CalendarClock, Battery, Brain, Coffee, Zap } from 'lucide-react';

interface StudyPlannerProps {
  data: AnalysisResult | null;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({ data }) => {
  if (!data || !data.studyPlan || data.studyPlan.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center">
        <CalendarClock size={64} className="mb-4 opacity-50 text-indigo-300" />
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Plan Generated Yet</h3>
        <p>Complete your Daily Check-In with specific tasks to generate an AI-optimized schedule.</p>
      </div>
    );
  }

  const getEnergyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'medium': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'low': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-100';
    }
  };

  const getFocusIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deep work': return <Brain size={18} />;
      case 'rest': return <Coffee size={18} />;
      case 'admin': return <CalendarClock size={18} />;
      default: return <Zap size={18} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-6 space-y-8">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Neuro-Adaptive Planner</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Your tasks have been intelligently mapped to your predicted energy curve for maximum efficiency.
        </p>
      </header>

      <div className="relative border-l-2 border-indigo-200 dark:border-slate-700 ml-4 md:ml-8 space-y-8">
        {data.studyPlan.map((block, idx) => (
          <div key={idx} className="relative pl-8 md:pl-12 group">
            {/* Timeline Dot */}
            <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm ${
                block.energyLevel === 'High' ? 'bg-emerald-500' : block.energyLevel === 'Medium' ? 'bg-blue-500' : 'bg-amber-500'
            } group-hover:scale-125 transition-transform`}></div>

            <div className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${getEnergyColor(block.energyLevel)}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider opacity-70 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md w-fit">
                    {block.timeBlock}
                </span>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide opacity-80">
                    {getFocusIcon(block.focusType)}
                    <span>{block.focusType}</span>
                </div>
              </div>
              
              <h3 className="text-lg md:text-xl font-bold mb-2">{block.task}</h3>
              
              <div className="flex items-center gap-2 text-xs font-medium opacity-80">
                <Battery size={14} />
                <span>Predicted Energy: {block.energyLevel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-start gap-4">
        <div className="p-3 bg-white dark:bg-indigo-800 rounded-xl shadow-sm">
            <Brain className="text-indigo-600 dark:text-indigo-300" size={24} />
        </div>
        <div>
            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-1">AI Productivity Tip</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                Based on your stress level ({data.burnoutRisk}), try the Pomodoro technique (25m work / 5m break) during your High Energy blocks to maintain momentum without crashing.
            </p>
        </div>
      </div>
    </div>
  );
};
