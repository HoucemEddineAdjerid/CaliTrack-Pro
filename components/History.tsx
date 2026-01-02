
import React from 'react';
import { WorkoutSession, Workout, Exercise } from '../types';
import { History as HistoryIcon, Clock, Zap, Calendar, ArrowRight } from 'lucide-react';

interface HistoryProps {
  sessions: WorkoutSession[];
  workouts: Workout[];
  exercises: Exercise[];
}

const History: React.FC<HistoryProps> = ({ sessions, workouts, exercises }) => {
  const sortedSessions = [...sessions].sort((a, b) => b.date - a.date);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
          <HistoryIcon className="text-blue-500" size={24} /> Training History
        </h1>
        <p className="text-sm text-slate-500 font-medium">{sessions.length} sessions completed</p>
      </div>

      <div className="space-y-4">
        {sortedSessions.map((session) => {
          const workout = workouts.find((w) => w.id === session.workout_id);
          const totalSets = session.logs.reduce((acc, l) => acc + l.sets.length, 0);
          const totalTut = session.logs.reduce((acc, l) => 
            acc + l.sets.reduce((sAcc, s) => sAcc + s.TUT, 0), 0
          );

          return (
            <div key={session.id} className="notion-panel p-6 notion-hover transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-lg text-slate-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{workout?.name || 'Quick Workout'}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(session.date).toLocaleDateString('en-US', { 
                      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 text-center md:text-left">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-700 font-semibold text-sm">
                    <Clock size={14} className="text-blue-500" />
                    {Math.floor(session.duration_seconds / 60)}m
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sets</p>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-700 font-semibold text-sm">
                    <Zap size={14} className="text-yellow-500" />
                    {totalSets}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total TUT</p>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-700 font-semibold text-sm">
                    <HistoryIcon size={14} className="text-emerald-500" />
                    {totalTut}s
                  </div>
                </div>
              </div>

              <div className="flex -space-x-2 overflow-hidden items-center">
                {session.logs.slice(0, 3).map((log, i) => {
                  const ex = exercises.find(e => e.id === log.exercise_id);
                  return (
                    <div key={i} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm" title={ex?.name}>
                      {ex?.name?.charAt(0)}
                    </div>
                  );
                })}
                {session.logs.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    +{session.logs.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-lg">
            <p className="text-slate-400 text-sm">No workouts logged yet. Your history will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
