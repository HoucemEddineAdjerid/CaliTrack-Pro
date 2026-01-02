
import React, { useState } from 'react';
import { getAISuggestions } from '../services/geminiService';
import { WorkoutSession, Exercise } from '../types';
import { Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';

interface AISuggestionsProps {
  sessions: WorkoutSession[];
  exercises: Exercise[];
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ sessions, exercises }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await getAISuggestions(sessions, exercises);
      setSuggestion(res);
    } catch (e) {
      setSuggestion("The coaching server is currently busy. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notion-panel p-10 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <BrainCircuit className="text-blue-600" size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">AI Performance Coach</h2>
            <p className="text-slate-400 text-sm mt-0.5 font-medium">Insights powered by Gemini for your specific routine</p>
          </div>
        </div>
        <button 
          onClick={fetchSuggestions}
          disabled={loading || sessions.length === 0}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-6 py-3 rounded-md font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
        >
          {loading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {suggestion ? 'Refresh Analysis' : 'Analyze My Progress'}
        </button>
      </div>

      {!suggestion && !loading && (
        <div className="text-center py-16 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            {sessions.length === 0 
              ? "Complete your first workout to get professional feedback from your AI coach." 
              : "Review your training history and get actionable advice for your next session."}
          </p>
        </div>
      )}

      {loading && (
        <div className="space-y-4 animate-pulse pt-4">
          <div className="h-3 bg-slate-100 rounded w-3/4"></div>
          <div className="h-3 bg-slate-100 rounded w-full"></div>
          <div className="h-3 bg-slate-100 rounded w-5/6"></div>
          <div className="h-3 bg-slate-100 rounded w-1/2 mt-8"></div>
          <div className="h-3 bg-slate-100 rounded w-2/3"></div>
        </div>
      )}

      {suggestion && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="whitespace-pre-wrap leading-relaxed text-slate-700 text-sm bg-blue-50/30 p-8 rounded-lg border border-blue-50">
            {suggestion.split('\n').map((line, i) => {
                if (line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim())) {
                    return <p key={i} className="mb-3 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-blue-400 before:rounded-full">{line.replace(/^[-•]\s*/, '')}</p>;
                }
                return <p key={i} className="mb-4 font-medium text-slate-600">{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
