import React, { useState, useEffect } from 'react';
import { ViewState, UserInputState, AnalysisResult, JournalEntry, Notification } from './types';
import { Navigation } from './components/Navigation';
import { DailyCheckIn } from './components/DailyCheckIn';
import { Dashboard } from './components/Dashboard';
import { Journal } from './components/Journal';
import { Collaborator } from './components/Collaborator';
import { StudyPlanner } from './components/StudyPlanner';
import { WellnessArcade } from './components/WellnessArcade';
import { Assistant } from './components/Assistant';
import { NotificationToast } from './components/NotificationToast';
import { analyzeDailyState } from './services/gemini';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.CheckIn);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [zenPoints, setZenPoints] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initial Welcome Notification & Scheduled Reminders
  useEffect(() => {
    // Welcome
    setTimeout(() => {
        addNotification('Welcome to OptiMind', 'Your intelligent social battery optimizer is ready.', 'info');
    }, 1000);

    // Mock Scheduler for reminders
    const hydrationTimer = setInterval(() => {
        if (Math.random() > 0.7) { // Randomize slightly so it feels organic
             addNotification('Hydration Check 💧', 'Your brain needs water to maintain focus. Take a sip!', 'info');
        }
    }, 60000 * 5); // Every 5 minutes (shortened for demo)

    const breakTimer = setInterval(() => {
        if (analysisData && analysisData.burnoutRisk !== 'Low') {
            addNotification('Energy Dip Detected ⚡', 'Based on your projection, now is a good time for a 5-min recharge.', 'warning');
        }
    }, 60000 * 3); // Every 3 minutes

    return () => {
        clearInterval(hydrationTimer);
        clearInterval(breakTimer);
    };
  }, [analysisData]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
      const id = Date.now().toString();
      setNotifications(prev => [...prev, { id, title, message, type }]);

      // Auto-dismiss
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
  };

  const removeNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleCheckInSubmit = async (data: UserInputState) => {
    setIsLoading(true);
    // Optimistic UI update or wait? Wait for now.
    addNotification('Syncing...', 'Analyzing your biometrics and schedule.', 'info');
    
    try {
        const result = await analyzeDailyState(data);
        setAnalysisData(result);
        setZenPoints(prev => prev + 50); 
        
        // Success Notification
        addNotification(
            'Optimization Complete', 
            `Daily plan generated. Burnout risk is ${result.burnoutRisk}.`, 
            'success'
        );
        
        // Critical Alert if needed
        if (result.mentalHealthAlert) {
            setTimeout(() => {
                addNotification('Wellness Alert 🛡️', 'High stress indicators detected. Check your recharge plan.', 'error');
            }, 2000);
        }

        setCurrentView(ViewState.Dashboard);
    } catch (e) {
        addNotification('Sync Failed', 'Could not connect to AI services. Please try again.', 'error');
    } finally {
        setIsLoading(false);
    }
  };

  const addJournalEntry = (entry: JournalEntry) => {
    setJournalEntries([...journalEntries, entry]);
    setZenPoints(prev => prev + 30);
    addNotification('Journal Saved', 'Your reflection has been recorded. +30 Zen Points', 'success');
  };

  const addPoints = (amount: number) => {
    setZenPoints(prev => prev + amount);
    addNotification('Zen Points', `+${amount} Points! Keep up the good work.`, 'success');
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.CheckIn:
        return <DailyCheckIn onSubmit={handleCheckInSubmit} isLoading={isLoading} />;
      case ViewState.Dashboard:
        return <Dashboard data={analysisData} isDarkMode={isDarkMode} journalHistory={journalEntries} />;
      case ViewState.Planner:
        return <StudyPlanner data={analysisData} />;
      case ViewState.Collaborate:
        return <Collaborator data={analysisData} />;
      case ViewState.Journal:
        return <Journal entries={journalEntries} addEntry={addJournalEntry} />;
      case ViewState.Arcade:
        return <WellnessArcade addPoints={addPoints} points={zenPoints} />;
      case ViewState.Assistant:
        return <Assistant />;
      default:
        return <Dashboard data={analysisData} isDarkMode={isDarkMode} journalHistory={journalEntries} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-500">
        
        <NotificationToast notifications={notifications} removeNotification={removeNotification} />

        <Navigation 
          currentView={currentView} 
          onNavigate={setCurrentView} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
        />
        <main className="flex-1 overflow-y-auto h-screen pb-20 md:pb-0 scrollbar-hide">
          {/* Gamification Floating Badge for Mobile/Top */}
          <div className="md:hidden fixed top-4 right-4 z-50 bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-xs font-bold shadow-md border border-amber-200 dark:border-amber-800 animate-fade-in-up">
            {zenPoints} Zen
          </div>

          <div className="p-4 md:p-8 max-w-7xl mx-auto">
             {/* Keyed div triggers CSS animation on view change */}
             <div key={currentView} className="animate-fade-in-up">
                {renderContent()}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;