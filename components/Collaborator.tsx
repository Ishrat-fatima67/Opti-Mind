import React from 'react';
import { AnalysisResult } from '../types';
import { Users, UserPlus, Zap, Brain } from 'lucide-react';

interface CollaboratorProps {
  data: AnalysisResult | null;
}

export const Collaborator: React.FC<CollaboratorProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 dark:text-slate-500">
        <Users className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400">No Data Available</h3>
        <p className="text-slate-500 dark:text-slate-500">Please complete your Daily Check-In to get collaboration insights.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-6 space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Interaction Intelligence</h2>
        <p className="text-slate-500 dark:text-slate-400">Based on your energy profile, here is who you should work with today.</p>
      </header>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden transition-all hover:scale-[1.01]">
        <div className="relative z-10">
          <h3 className="text-lg font-medium opacity-90 mb-2">Ideal Collaborator Archetype</h3>
          <p className="text-2xl md:text-3xl font-bold leading-tight">{data.collaboratorSuggestion}</p>
        </div>
        <UserPlus className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white opacity-10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg">
                    <Zap size={24} />
                </div>
                <h4 className="font-bold text-slate-700 dark:text-slate-200">Communication Style</h4>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Given your predicted energy levels, prioritize <strong>{data.socialStrategy}</strong>. 
                Avoid draining debates and stick to structured, asynchronous communication where possible if your energy dips in the afternoon.
            </p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg">
                    <Brain size={24} />
                </div>
                <h4 className="font-bold text-slate-700 dark:text-slate-200">Team Role Today</h4>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Your burnout risk is marked as <strong>{data.burnoutRisk}</strong>. 
                {data.burnoutRisk === 'High' || data.burnoutRisk === 'Critical' 
                  ? "Take a supporting role today. Let others drive the agenda while you focus on specific, low-friction tasks." 
                  : "You are in a prime position to lead or facilitate. Use your energy to unblock others."}
            </p>
        </div>
      </div>
    </div>
  );
};