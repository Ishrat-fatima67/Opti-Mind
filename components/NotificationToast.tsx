import React from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info, Zap } from 'lucide-react';
import { Notification } from '../types';

interface NotificationToastProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {notifications.map((note) => (
        <div 
          key={note.id} 
          className="pointer-events-auto bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 flex items-start gap-3 animate-slide-in-right backdrop-blur-md transition-all hover:scale-[1.02]"
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${
            note.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
            note.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
            note.type === 'error' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
            'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
          }`}>
            {note.type === 'success' ? <CheckCircle size={20} /> :
             note.type === 'warning' ? <Zap size={20} className="fill-current" /> :
             note.type === 'error' ? <AlertCircle size={20} /> :
             <Bell size={20} />}
          </div>
          <div className="flex-1 pt-0.5">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{note.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 font-medium">{note.message}</p>
          </div>
          <button 
            onClick={() => removeNotification(note.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};