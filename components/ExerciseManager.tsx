
import React, { useState } from 'react';
import { Exercise, ExerciseType } from '../types';
import { Plus, Trash2, Edit3, Save, Activity, Check, LayoutGrid, List, TableProperties } from 'lucide-react';

interface ExerciseManagerProps {
  exercises: Exercise[];
  onUpdate: (exercises: Exercise[]) => void;
}

const PREDEFINED_METRICS = [
  { name: 'Holds', unit: 'seconds', label: 'Holds (seconds)' },
  { name: 'Reps', unit: 'count', label: 'Reps (number)' },
  { name: 'Distance', unit: 'm', label: 'Distance (meters)' },
  { name: 'Duration', unit: 'min', label: 'Duration (minutes)' }
];

const ExerciseManager: React.FC<ExerciseManagerProps> = ({ exercises, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');

  const [formData, setFormData] = useState<Partial<Exercise>>({
    name: '',
    type: ExerciseType.Push,
    metrics: [],
    TUT_target: 30,
    tags: [],
    optional: false
  });

  const deleteExercise = (id: string) => {
    onUpdate(exercises.filter(ex => ex.id !== id));
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    if (editingId) {
      onUpdate(exercises.map(ex => ex.id === editingId ? { ...ex, ...formData } as Exercise : ex));
      setEditingId(null);
    } else {
      const newEx: Exercise = {
        ...formData as Exercise,
        id: Math.random().toString(36).substr(2, 9)
      };
      onUpdate([...exercises, newEx]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: ExerciseType.Push,
      metrics: [],
      TUT_target: 30,
      tags: [],
      optional: false
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const toggleMetric = (metricName: string, unit: string) => {
    const currentMetrics = formData.metrics || [];
    const exists = currentMetrics.find(m => m.metric_name === metricName);
    
    if (exists) {
      setFormData({
        ...formData,
        metrics: currentMetrics.filter(m => m.metric_name !== metricName)
      });
    } else {
      setFormData({
        ...formData,
        metrics: [...currentMetrics, { metric_name: metricName, metric_unit: unit }]
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
          <Activity className="text-blue-500" size={24} /> Exercise Library
        </h1>
        
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-100">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <TableProperties size={16} />
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
        <div className="notion-panel p-8 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Exercise Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Front Lever"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 outline-none text-slate-800"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as ExerciseType })}
                  >
                    {Object.values(ExerciseType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Target TUT (s)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 outline-none text-slate-800"
                    value={formData.TUT_target}
                    onChange={e => setFormData({ ...formData, TUT_target: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Metrics</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PREDEFINED_METRICS.map(m => (
                  <button
                    key={m.name}
                    onClick={() => toggleMetric(m.name, m.unit)}
                    className={`flex items-center justify-between px-4 py-3 rounded-md border text-sm transition-all ${
                      formData.metrics?.find(fm => fm.metric_name === m.name)
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{m.label}</span>
                    {formData.metrics?.find(fm => fm.metric_name === m.name) && <Check size={16} />}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="optional" 
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  checked={formData.optional} 
                  onChange={e => setFormData({ ...formData, optional: e.target.checked })}
                />
                <label htmlFor="optional" className="text-sm text-slate-600">Accessory Exercise</label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-slate-100">
            <button onClick={resetForm} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
            <button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-md font-semibold text-sm flex items-center gap-2">
              <Save size={16} /> Save Exercise
            </button>
          </div>
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map(ex => (
            <div key={ex.id} className="notion-panel p-5 notion-hover transition-all group relative">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm ${
                  ex.type === ExerciseType.Push ? 'bg-blue-100 text-blue-700' :
                  ex.type === ExerciseType.Pull ? 'bg-indigo-100 text-indigo-700' :
                  ex.type === ExerciseType.Leg ? 'bg-emerald-100 text-emerald-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {ex.type}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setFormData(ex); setEditingId(ex.id); setIsAdding(true); }} className="p-1 hover:bg-white rounded-md text-slate-400 hover:text-slate-600 transition-colors">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => deleteExercise(ex.id)} className="p-1 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">{ex.name}</h3>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Target: {ex.TUT_target}s</span>
                {ex.metrics.map((m, i) => (
                  <span key={i} className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{m.metric_name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-2">
          {exercises.map(ex => (
            <div key={ex.id} className="notion-panel px-4 py-3 flex items-center justify-between group notion-hover transition-all">
              <div className="flex items-center gap-4">
                <span className={`w-2 h-2 rounded-full ${
                  ex.type === ExerciseType.Push ? 'bg-blue-400' :
                  ex.type === ExerciseType.Pull ? 'bg-indigo-400' :
                  ex.type === ExerciseType.Leg ? 'bg-emerald-400' : 'bg-orange-400'
                }`} />
                <span className="text-sm font-bold text-slate-800">{ex.name}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{ex.type}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs text-slate-500">TUT: {ex.TUT_target}s</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setFormData(ex); setEditingId(ex.id); setIsAdding(true); }} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"><Edit3 size={12} /></button>
                  <button onClick={() => deleteExercise(ex.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'table' && (
        <div className="notion-panel overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-3 border-b border-slate-100">Name</th>
                <th className="px-6 py-3 border-b border-slate-100">Type</th>
                <th className="px-6 py-3 border-b border-slate-100">Target TUT</th>
                <th className="px-6 py-3 border-b border-slate-100">Metrics</th>
                <th className="px-6 py-3 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exercises.map(ex => (
                <tr key={ex.id} className="notion-hover transition-all">
                  <td className="px-6 py-4 font-bold text-slate-800">{ex.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{ex.type}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{ex.TUT_target}s</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {ex.metrics.map(m => (
                        <span key={m.metric_name} className="text-[10px] text-slate-400">{m.metric_name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setFormData(ex); setEditingId(ex.id); setIsAdding(true); }} className="p-1 text-slate-300 hover:text-slate-600"><Edit3 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {exercises.length === 0 && !isAdding && (
        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 rounded-lg">
          <p className="text-slate-400 text-sm">Your exercise library is empty. Add movements to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseManager;
