
import React, { useMemo } from 'react';
import { WorkoutSession, Exercise } from '../types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Clock, Timer, Activity } from 'lucide-react';

interface AnalyticsProps {
  sessions: WorkoutSession[];
  exercises: Exercise[];
}

const Analytics: React.FC<AnalyticsProps> = ({ sessions, exercises }) => {
  const totalSessions = sessions.length;

  const chartData = useMemo(() => {
    return sessions.map(s => {
      const totalTUT = s.logs.reduce((acc, l) => acc + l.sets.reduce((setAcc, set) => setAcc + set.TUT, 0), 0);
      return {
        date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        totalTUT: totalTUT,
        duration: Math.floor((s.duration_seconds || 0) / 60),
        sets: s.logs.reduce((acc, l) => acc + l.sets.length, 0),
        timestamp: s.date
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  }, [sessions]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
        <TrendingUp className="text-blue-600" size={24} /> Performance Insights
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="notion-panel p-8 h-[450px]">
          <h3 className="text-base font-bold mb-8 flex items-center gap-2 text-slate-700">
            <Activity className="text-blue-500" size={18} /> TUT Volume Progression
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="totalTUT" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTut)" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="notion-panel p-8 h-[450px]">
          <h3 className="text-base font-bold mb-8 flex items-center gap-2 text-slate-700">
            <Timer className="text-orange-500" size={18} /> Training Duration (min)
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="duration" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDur)" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="notion-panel p-6 bg-slate-50/50">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Training Time</p>
          <p className="text-2xl font-bold text-slate-800">{(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 3600).toFixed(1)}h</p>
        </div>
        <div className="notion-panel p-6 bg-slate-50/50">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Sets</p>
          <p className="text-2xl font-bold text-slate-800">{chartData.reduce((acc, d) => acc + d.sets, 0)}</p>
        </div>
        <div className="notion-panel p-6 bg-slate-50/50">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Avg Duration</p>
          <p className="text-2xl font-bold text-slate-800">
            {totalSessions > 0 ? (chartData.reduce((acc, d) => acc + d.duration, 0) / totalSessions).toFixed(0) : 0}m
          </p>
        </div>
        <div className="notion-panel p-6 bg-blue-50/30 border-blue-100">
          <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">Efficiency</p>
          <p className="text-2xl font-bold text-blue-700">Optimal</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
