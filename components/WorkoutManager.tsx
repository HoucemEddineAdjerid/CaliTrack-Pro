
import React, { useState } from 'react';
import { Workout, Exercise, DayOfWeek } from '../types';
import { Plus, ListChecks, Calendar, Trash2, X, LayoutGrid, List } from 'lucide-react';

interface WorkoutManagerProps {
  workouts: Workout[];
  exercises: Exercise[];
  onUpdate: (workouts: Workout[]) => void;
}

const WorkoutManager: React.FC<WorkoutManagerProps> = ({ workouts, exercises, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState<Partial<Workout>>({
    name: '',
    exercises: [],
    scheduled_days: []
  });

  const handleSave = () => {
    if (!formData.name || formData.exercises?.length === 0) return;
    const newWorkout: Workout = {
      ...formData as Workout,
      id: Math.random().toString(36).substr(2, 9)
    };
    onUpdate([...workouts, newWorkout]);
    setIsAdding(false);
    setFormData({ name: '', exercises: [], scheduled_days: [] });
  };

  const toggleExercise = (id: string) => {
    const current = formData.exercises || [];
    if (current.includes(id)) {
      setFormData({ ...formData, exercises: current.filter(x => x !== id) });
    } else {
      setFormData({ ...formData, exercises: [...current, id] });
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    const current = formData.scheduled_days || [];
    if (current.includes(day)) {
      setFormData({ ...formData, scheduled_days: current.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, scheduled_days: [...current, day] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
          <ListChecks className="text-blue-500" size={24} /> Training Routines
        </h1>
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-100">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <List size={16} />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors font-medium text-xs"
          >
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="notion-panel p-8 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-slate-800">New Training Routine</h2>
            <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-400"><X size={18} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-1 space-y-8">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Routine Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                  placeholder="e.g. Pull Mastery"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Weekly Schedule</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(DayOfWeek).map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`py-2 text-[10px] font-bold rounded-md transition-all border ${
                        formData.scheduled_days?.includes(day)
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Movements ({formData.exercises?.length || 0})</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {exercises.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => toggleExercise(ex.id)}
                    className={`flex items-center gap-3 p-4 rounded-md border transition-all text-left ${
                      formData.exercises?.includes(ex.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-sm flex items-center justify-center border transition-all ${
                      formData.exercises?.includes(ex.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                    }`}>
                      {formData.exercises?.includes(ex.id) && <Plus size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 leading-none">{ex.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">{ex.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={!formData.name || formData.exercises?.length === 0}
              className="bg-slate-900 disabled:opacity-50 hover:bg-slate-800 text-white px-8 py-2 rounded-md font-bold text-sm transition-all"
            >
              Create Routine
            </button>
          </div>
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workouts.map(w => (
            <div key={w.id} className="notion-panel p-6 notion-hover group transition-all">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{w.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Calendar size={12} className="text-blue-500" />
                    <div className="flex gap-1">
                      {w.scheduled_days?.map(d => (
                        <span key={d} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdate(workouts.filter(x => x.id !== w.id))}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="space-y-2 mt-4">
                {w.exercises.map(eid => {
                  const ex = exercises.find(e => e.id === eid);
                  return (
                    <div key={eid} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-md text-xs border border-slate-100">
                      <span className="text-slate-700 font-bold">{ex?.name || 'Unknown Movement'}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">{ex?.type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-2">
          {workouts.map(w => (
            <div key={w.id} className="notion-panel px-6 py-4 flex items-center justify-between group notion-hover transition-all">
              <div className="flex items-center gap-6">
                <span className="text-sm font-bold text-slate-800">{w.name}</span>
                <div className="flex gap-1">
                  {w.scheduled_days?.map(d => (
                    <span key={d} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{d}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-xs text-slate-500">{w.exercises.length} Movements</span>
                <button 
                  onClick={() => onUpdate(workouts.filter(x => x.id !== w.id))}
                  className="p-1 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutManager;
