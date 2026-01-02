
import React from 'react';
import { UserProfile, Workout, DayOfWeek, WorkoutSession } from '../types';
// Fix: Added Activity to the imports from lucide-react
import { Flame, Calendar, Trophy, Zap, ChevronRight, Play, Activity } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  workouts: Workout[];
  sessions: WorkoutSession[];
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, workouts, sessions, onNavigate }) => {
  const days = Object.values(DayOfWeek);
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todaysWorkouts = workouts.filter(w => w.scheduled_days?.includes(today));

  const totalSessions = sessions.length;
  const recentActivity = sessions.slice(-3).reverse();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user.name}</h1>
          <p className="text-slate-500 mt-1">Ready to master your body weight today?</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => onNavigate('log')}
            className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-md flex items-center justify-center gap-2 font-bold text-sm shadow-sm transition-all active:scale-95"
          >
            <Play fill="currentColor" size={14} /> Start Training
          </button>
          <div className="bg-orange-50 px-4 py-3 rounded-md flex items-center gap-3 border border-orange-100">
            <Flame className="text-orange-500" size={18} />
            <div>
              <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">STREAK</p>
              <p className="text-base font-bold text-orange-800">{user.streak} Days</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
              <Calendar className="text-blue-500" size={20} /> Today's Schedule ({today})
            </h2>
            <div className="grid gap-3">
              {todaysWorkouts.length > 0 ? (
                todaysWorkouts.map(w => (
                  <div key={w.id} className="notion-panel p-5 flex justify-between items-center group cursor-pointer notion-hover transition-all" onClick={() => onNavigate('log')}>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">{w.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{w.exercises.length} Movements</p>
                    </div>
                    <div className="text-blue-600 flex items-center gap-1 font-semibold text-sm">
                      Start <ChevronRight size={16} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 border-2 border-dashed border-slate-100 rounded-lg text-center bg-slate-50/50">
                  <p className="text-slate-400 text-sm italic">Nothing scheduled for today. Rest and recover.</p>
                  <button onClick={() => onNavigate('workouts')} className="mt-3 text-blue-600 hover:text-blue-500 font-bold text-xs uppercase tracking-wider">Manage Routine Schedule</button>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
              <Zap className="text-yellow-500" size={20} /> Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map(s => {
                const workout = workouts.find(w => w.id === s.workout_id);
                return (
                  <div key={s.id} className="notion-panel p-4 flex items-center justify-between notion-hover">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-slate-500">
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{workout?.name || 'Quick Session'}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(s.date).toLocaleDateString()} • {Math.floor(s.duration_seconds / 60)}m
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">{s.logs.reduce((acc, l) => acc + l.sets.length, 0)} Sets</p>
                    </div>
                  </div>
                );
              })}
              {recentActivity.length === 0 && <p className="text-slate-400 text-sm italic py-4">No sessions completed yet.</p>}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="notion-panel p-6 bg-slate-50/30">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-700">
              <Trophy className="text-yellow-500" size={18} /> Stats Summary
            </h2>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm font-medium">Sessions</span>
                <span className="font-bold text-slate-800">{totalSessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm font-medium">Training Time</span>
                <span className="font-bold text-slate-800">
                  {Math.floor(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60)}m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm font-medium">Total Volume</span>
                <span className="font-bold text-slate-800">
                  {sessions.reduce((acc, s) => acc + s.logs.reduce((lAcc, l) => lAcc + l.sets.length, 0), 0)} Sets
                </span>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100">
                 <button onClick={() => onNavigate('analytics')} className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-500 uppercase tracking-widest">Analytics Dashboard</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
