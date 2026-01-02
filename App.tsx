
import React, { useState, useEffect } from 'react';
import { Exercise, Workout, WorkoutSession, UserProfile } from './types';
import { storageService } from './services/storageService';
import Dashboard from './components/Dashboard';
import ExerciseManager from './components/ExerciseManager';
import WorkoutManager from './components/WorkoutManager';
import WorkoutLogger from './components/WorkoutLogger';
import Analytics from './components/Analytics';
import AISuggestions from './components/AISuggestions';
import History from './components/History';
import { 
  LayoutDashboard, 
  Activity, 
  ListChecks, 
  ClipboardList, 
  TrendingUp, 
  BrainCircuit,
  Settings,
  Download,
  History as HistoryIcon
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<string>('dashboard');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [user, setUser] = useState<UserProfile>(storageService.getUser());

  useEffect(() => {
    setExercises(storageService.getExercises());
    setWorkouts(storageService.getWorkouts());
    setSessions(storageService.getSessions());
  }, []);

  useEffect(() => storageService.saveExercises(exercises), [exercises]);
  useEffect(() => storageService.saveWorkouts(workouts), [workouts]);
  useEffect(() => storageService.saveSessions(sessions), [sessions]);
  useEffect(() => storageService.saveUser(user), [user]);

  const handleLogSession = (session: WorkoutSession) => {
    const newSessions = [...sessions, session];
    setSessions(newSessions);

    const lastDate = user.last_workout_date ? new Date(user.last_workout_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newStreak = user.streak;
    if (lastDate) {
      const diff = (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
      if (diff === 1) newStreak += 1;
      else if (diff > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }

    setUser({ ...user, streak: newStreak, last_workout_date: today.getTime() });
    setView('dashboard');
  };

  const exportData = () => {
    const data = { exercises, workouts, sessions, user };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calitrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-white text-slate-800 font-sans">
      {/* Notion-style Sidebar */}
      <nav className="w-20 md:w-64 border-r border-slate-100 notion-sidebar flex flex-col items-center md:items-stretch py-8 px-4 fixed h-full z-20 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
            <Activity className="text-white" size={18} />
          </div>
          <span className="hidden md:block font-bold text-lg tracking-tight text-slate-800">CaliTrack<span className="text-blue-600">Pro</span></span>
        </div>

        <div className="flex-1 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon={<Activity size={18} />} label="Exercises" active={view === 'exercises'} onClick={() => setView('exercises')} />
          <NavItem icon={<ListChecks size={18} />} label="Routines" active={view === 'workouts'} onClick={() => setView('workouts')} />
          <NavItem icon={<ClipboardList size={18} />} label="Log Session" active={view === 'log'} onClick={() => setView('log')} />
          <NavItem icon={<TrendingUp size={18} />} label="Analytics" active={view === 'analytics'} onClick={() => setView('analytics')} />
          <NavItem icon={<BrainCircuit size={18} />} label="AI Coach" active={view === 'coach'} onClick={() => setView('coach')} />
          {/* History moved to the bottom of the main list */}
          <NavItem icon={<HistoryIcon size={18} />} label="History" active={view === 'history'} onClick={() => setView('history')} />
        </div>

        <div className="mt-auto space-y-1 pt-6 border-t border-slate-200/50">
          <button onClick={exportData} className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-md transition-all group">
            <Download size={18} />
            <span className="hidden md:block text-sm font-medium">Backup Data</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-md transition-all cursor-pointer">
            <Settings size={18} />
            <span className="hidden md:block text-sm font-medium">Settings</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 md:ml-64 p-6 md:p-12 relative overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          {view === 'dashboard' && <Dashboard user={user} workouts={workouts} sessions={sessions} onNavigate={setView} />}
          {view === 'history' && <History sessions={sessions} workouts={workouts} exercises={exercises} />}
          {view === 'exercises' && <ExerciseManager exercises={exercises} onUpdate={setExercises} />}
          {view === 'workouts' && <WorkoutManager workouts={workouts} exercises={exercises} onUpdate={setWorkouts} />}
          {view === 'log' && <WorkoutLogger workouts={workouts} exercises={exercises} onLog={handleLogSession} onNavigate={setView} />}
          {view === 'analytics' && <Analytics sessions={sessions} exercises={exercises} />}
          {view === 'coach' && <AISuggestions sessions={sessions} exercises={exercises} />}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all group ${
      active 
        ? 'notion-active text-slate-900' 
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
    }`}
  >
    <div className={active ? 'text-blue-600' : 'group-hover:text-blue-600 transition-colors'}>
      {icon}
    </div>
    <span className="hidden md:block text-sm font-medium">{label}</span>
  </button>
);

export default App;
