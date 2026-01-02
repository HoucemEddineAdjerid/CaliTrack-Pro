
import React, { useState, useEffect, useRef } from 'react';
import { Workout, Exercise, WorkoutExercise, SetLog, PerformanceTag, WorkoutSession } from '../types';
import { ClipboardList, CheckCircle, ChevronLeft, ChevronRight, Plus, Timer, Trash2, Weight, Activity, ListChecks } from 'lucide-react';

interface WorkoutLoggerProps {
  workouts: Workout[];
  exercises: Exercise[];
  onLog: (session: WorkoutSession) => void;
  onNavigate: (view: string) => void;
}

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ workouts, exercises, onLog, onNavigate }) => {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [logs, setLogs] = useState<Record<string, WorkoutExercise>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  
  // Custom workout states
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [manualExerciseIds, setManualExerciseIds] = useState<string[]>([]);
  
  const [currentSetInputs, setCurrentSetInputs] = useState<Record<string, Partial<SetLog>>>({});
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (startTime) {
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime]);

  const selectedWorkout = workouts.find(w => w.id === selectedWorkoutId);

  const initLogs = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    const workout = workouts.find(w => w.id === workoutId);
    if (workout) {
      startSession(workout.exercises);
    }
  };

  const startSession = (exerciseIds: string[]) => {
    const initialLogs: Record<string, WorkoutExercise> = {};
    const initialInputs: Record<string, Partial<SetLog>> = {};
    
    exerciseIds.forEach(eid => {
      const ex = exercises.find(e => e.id === eid);
      if (ex) {
        initialLogs[eid] = { exercise_id: eid, sets: [] };
        initialInputs[eid] = {
          metrics: ex.metrics.reduce((acc, m) => ({ ...acc, [m.metric_name]: 0 }), {}),
          TUT: 0,
          performance: PerformanceTag.Good,
          is_assisted: false,
          assistance_weight: 0
        };
      }
    });
    
    setLogs(initialLogs);
    setCurrentSetInputs(initialInputs);
    setStartTime(Date.now());
    setStep(2);
  };

  const addSet = (eid: string) => {
    const input = currentSetInputs[eid];
    if (!input) return;

    const ex = exercises.find(e => e.id === eid);
    let tutContribution = input.TUT || 0;

    const holdsMetricValue = input.metrics?.['Holds'];
    if (holdsMetricValue !== undefined) {
      tutContribution = holdsMetricValue;
    }

    setLogs(prev => ({
      ...prev,
      [eid]: {
        ...prev[eid],
        sets: [...prev[eid].sets, { ...input, TUT: tutContribution } as SetLog]
      }
    }));
  };

  const removeSet = (eid: string, index: number) => {
    setLogs(prev => ({
      ...prev,
      [eid]: {
        ...prev[eid],
        sets: prev[eid].sets.filter((_, i) => i !== index)
      }
    }));
  };

  const handleFinish = () => {
    if (!startTime) return;
    const session: WorkoutSession = {
      id: Math.random().toString(36).substr(2, 9),
      workout_id: selectedWorkoutId || 'manual',
      date: Date.now(),
      duration_seconds: elapsed,
      logs: Object.values(logs)
    };
    onLog(session);
  };

  const toggleManualExercise = (id: string) => {
    setManualExerciseIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Selection Phase
  if (step === 1) {
    // 1. If no routines and no exercises: Push to create exercise
    if (workouts.length === 0 && exercises.length === 0) {
      return (
        <div className="max-w-md mx-auto py-20 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Exercises Found</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            You need to add some exercises to your library before you can start training.
          </p>
          <button 
            onClick={() => onNavigate('exercises')}
            className="w-full bg-slate-900 text-white py-3 rounded-md font-bold text-sm shadow-sm hover:bg-slate-800 transition-all"
          >
            Create Exercises
          </button>
        </div>
      );
    }

    // 2. If no routines but exercises exist, or manual selection is toggled
    if (isManualSelection || workouts.length === 0) {
      return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Custom Session</h1>
              <p className="text-sm text-slate-500 mt-1">Select movements for this session</p>
            </div>
            {workouts.length > 0 && (
              <button 
                onClick={() => setIsManualSelection(false)}
                className="text-xs font-bold text-blue-600 hover:text-blue-500 uppercase tracking-widest"
              >
                Back to Routines
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exercises.map(ex => (
              <button
                key={ex.id}
                onClick={() => toggleManualExercise(ex.id)}
                className={`notion-panel p-4 flex items-center gap-3 text-left transition-all ${
                  manualExerciseIds.includes(ex.id) ? 'border-blue-500 bg-blue-50/30' : 'notion-hover'
                }`}
              >
                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
                  manualExerciseIds.includes(ex.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                }`}>
                  {manualExerciseIds.includes(ex.id) && <Plus size={12} className="text-white" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{ex.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{ex.type}</p>
                </div>
              </button>
            ))}
          </div>

          <button 
            disabled={manualExerciseIds.length === 0}
            onClick={() => startSession(manualExerciseIds)}
            className="w-full bg-slate-900 disabled:opacity-50 text-white py-4 rounded-md font-bold text-sm shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} /> Start Custom Workout
          </button>
        </div>
      );
    }

    // 3. Show Routines if any exist
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <ListChecks className="text-blue-500" size={24} /> Select Routine
          </h1>
          <button 
            onClick={() => setIsManualSelection(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-500 uppercase tracking-widest"
          >
            Select Manually
          </button>
        </div>
        
        <div className="grid gap-4">
          {workouts.map(w => (
            <button
              key={w.id}
              onClick={() => initLogs(w.id)}
              className="notion-panel p-6 flex justify-between items-center group notion-hover transition-all text-left"
            >
              <div>
                <h3 className="text-base font-bold text-slate-800">{w.name}</h3>
                <div className="flex gap-1.5 mt-2">
                   {w.exercises.slice(0, 4).map((eid, i) => {
                     const ex = exercises.find(e => e.id === eid);
                     return <span key={i} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">{ex?.name}</span>
                   })}
                   {w.exercises.length > 4 && <span className="text-[9px] text-slate-400">+{w.exercises.length - 4} more</span>}
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Training Phase
  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md py-4 mb-8 border-b border-slate-100 flex justify-between items-center">
        <div>
          <button onClick={() => setStep(1)} className="text-xs font-semibold text-slate-400 flex items-center gap-1 hover:text-slate-800 mb-1 transition-colors uppercase tracking-wider">
            <ChevronLeft size={14} /> Quit
          </button>
          <h2 className="text-xl font-bold text-slate-800">{selectedWorkout?.name || 'Custom Session'}</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-mono text-lg font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-md">
            <Timer size={18} className="text-blue-500" /> {formatTime(elapsed)}
          </div>
          <button 
            onClick={handleFinish}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-md font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <CheckCircle size={18} /> Finish
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {Object.keys(logs).map(eid => {
          const ex = exercises.find(e => e.id === eid);
          const log = logs[eid];
          const input = currentSetInputs[eid];
          if (!ex || !log || !input) return null;

          const totalTut = log.sets.reduce((acc, s) => acc + s.TUT, 0);

          return (
            <div key={eid} className="notion-panel overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{ex.name}</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{ex.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-200">{log.sets.length} <span className="text-xs text-slate-400">SETS</span></p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">Total TUT: {totalTut}s</p>
                  </div>
                </div>

                {/* Set Input Area */}
                <div className="bg-slate-50 p-4 rounded-md border border-slate-100 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TUT (s)</label>
                      <input 
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        value={input.TUT}
                        onChange={e => setCurrentSetInputs(prev => ({
                          ...prev,
                          [eid]: { ...prev[eid], TUT: parseInt(e.target.value) || 0 }
                        }))}
                        disabled={ex.metrics.some(m => m.metric_name === 'Holds')}
                        placeholder={ex.metrics.some(m => m.metric_name === 'Holds') ? 'Auto-TUT' : ''}
                      />
                    </div>
                    {ex.metrics.map(m => (
                      <div key={m.metric_name} className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.metric_name}</label>
                        <input 
                          type="number"
                          className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                          value={input.metrics?.[m.metric_name]}
                          onChange={e => setCurrentSetInputs(prev => ({
                            ...prev,
                            [eid]: {
                              ...prev[eid],
                              metrics: { ...prev[eid].metrics, [m.metric_name]: parseInt(e.target.value) || 0 }
                            }
                          }))}
                        />
                      </div>
                    ))}
                    <div className="col-span-full md:col-span-1">
                      <button 
                        onClick={() => addSet(eid)}
                        className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-md flex items-center justify-center gap-2 font-bold text-sm transition-all"
                      >
                        <Plus size={14} /> Log Set
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                      {Object.values(PerformanceTag).map(tag => (
                        <button
                          key={tag}
                          onClick={() => setCurrentSetInputs(prev => ({ ...prev, [eid]: { ...prev[eid], performance: tag } }))}
                          className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all border whitespace-nowrap ${
                            input.performance === tag 
                              ? (tag === 'Poor' ? 'bg-red-50 border-red-200 text-red-700' : tag === 'Good' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id={`assisted-${eid}`}
                          className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
                          checked={input.is_assisted}
                          onChange={e => setCurrentSetInputs(prev => ({ ...prev, [eid]: { ...prev[eid], is_assisted: e.target.checked } }))}
                        />
                        <label htmlFor={`assisted-${eid}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assisted</label>
                      </div>
                      
                      {input.is_assisted && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                          <Weight size={12} className="text-slate-400" />
                          <input 
                            type="number"
                            placeholder="kg"
                            className="w-16 bg-white border border-slate-200 rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                            value={input.assistance_weight}
                            onChange={e => setCurrentSetInputs(prev => ({ ...prev, [eid]: { ...prev[eid], assistance_weight: parseFloat(e.target.value) || 0 } }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Logged Sets List */}
                <div className="space-y-2">
                  {log.sets.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2.5 rounded-md group animate-in slide-in-from-left-2 duration-300">
                      <span className="text-[11px] font-bold text-slate-400 w-4">{idx + 1}</span>
                      <div className="flex-1 grid grid-cols-4 text-[13px] items-center">
                        <span className="font-semibold text-slate-700">
                          {s.TUT}s <span className="text-[10px] text-slate-400 font-medium">TUT</span>
                          {s.is_assisted && <span className="ml-2 text-[9px] bg-indigo-50 text-indigo-500 px-1 py-0.5 rounded">-{s.assistance_weight}kg</span>}
                        </span>
                        {Object.entries(s.metrics).map(([name, val]) => (
                          <span key={name} className="text-slate-600">{val} <span className="text-[10px] text-slate-400 font-medium">{ex.metrics.find(m => m.metric_name === name)?.metric_unit || name}</span></span>
                        ))}
                        <span className={`font-bold text-right text-[10px] uppercase tracking-wider ${
                          s.performance === 'Poor' ? 'text-red-500' : s.performance === 'Good' ? 'text-blue-500' : 'text-emerald-500'
                        }`}>{s.performance}</span>
                      </div>
                      <button onClick={() => removeSet(eid, idx)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {log.sets.length === 0 && (
                    <p className="text-center py-6 text-slate-400 text-xs italic">Record your first set above.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutLogger;
