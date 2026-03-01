import React from 'react';
import { ViewState } from '../types';
import { Activity, Book, Users, BarChart2, Sun, Moon, ToggleLeft, ToggleRight, CalendarClock, Gamepad2, Bot } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, isDarkMode, toggleTheme }) => {
  const navItems = [
    { view: ViewState.CheckIn, label: 'Check-In', icon: <Activity size={20} /> },
    { view: ViewState.Dashboard, label: 'Dashboard', icon: <BarChart2 size={20} /> },
    { view: ViewState.Assistant, label: 'AI Guide', icon: <Bot size={20} /> },
    { view: ViewState.Planner, label: 'Plan', icon: <CalendarClock size={20} /> },
    { view: ViewState.Collaborate, label: 'Social', icon: <Users size={20} /> },
    { view: ViewState.Journal, label: 'Journal', icon: <Book size={20} /> },
    { view: ViewState.Arcade, label: 'Arcade', icon: <Gamepad2 size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2 md:static md:w-64 md:h-screen md:border-r md:border-t-0 md:p-6 md:flex md:flex-col shadow-lg z-50 transition-colors duration-300">
      <div className="hidden md:flex flex-col mb-10">
        <div className="flex items-center justify-between mb-6">
           <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
             OptiMind
           </h1>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Menu</p>
      </div>
      
      <div className="flex justify-around md:flex-col md:space-y-2 h-full md:h-auto overflow-x-auto md:overflow-visible no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`flex flex-col md:flex-row items-center md:space-x-3 p-2 md:px-4 md:py-3 rounded-xl transition-all duration-200 group flex-shrink-0 ${
              currentView === item.view
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 font-bold shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className={`transition-transform duration-200 ${currentView === item.view ? 'scale-110' : 'group-hover:scale-110'}`}>
              {item.icon}
            </div>
            <span className="text-[10px] md:text-sm mt-1 md:mt-0 font-medium whitespace-nowrap">{item.label}</span>
          </button>
        ))}

        <div className="hidden md:block md:mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
           <button 
             onClick={toggleTheme}
             className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group"
           >
             <div className="flex items-center gap-3">
               {isDarkMode ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
               <span className="text-sm font-medium">Dark Mode</span>
             </div>
             {isDarkMode ? <ToggleRight size={24} className="text-indigo-500" /> : <ToggleLeft size={24} className="text-slate-400" />}
           </button>
        </div>
        
        {/* Mobile Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="md:hidden flex flex-col items-center p-2 rounded-xl text-slate-500 dark:text-slate-400 active:scale-95 transition-transform"
        >
          <div className={`p-1 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-amber-100'}`}>
            {isDarkMode ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
          </div>
          <span className="text-[10px] mt-1 font-medium">Theme</span>
        </button>
      </div>
    </nav>
  );
};