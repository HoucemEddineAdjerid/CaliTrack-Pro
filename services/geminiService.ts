
import { GoogleGenAI } from "@google/genai";
import { WorkoutSession, Exercise } from "../types";

// Fix: Updated to follow @google/genai coding guidelines regarding initialization and text extraction
export const getAISuggestions = async (
  sessions: WorkoutSession[],
  exercises: Exercise[]
): Promise<string> => {
  // Always use {apiKey: process.env.API_KEY} directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const recentSessions = sessions.slice(-5);
  const context = recentSessions.map(s => ({
    date: new Date(s.date).toLocaleDateString(),
    duration: s.duration_seconds ? `${Math.floor(s.duration_seconds/60)}m ${s.duration_seconds%60}s` : 'unknown',
    logs: s.logs.map(l => {
      const ex = exercises.find(e => e.id === l.exercise_id);
      return {
        name: ex?.name,
        type: ex?.type,
        sets: l.sets.map(set => ({
          TUT: set.TUT,
          performance: set.performance,
          metrics: set.metrics
        }))
      };
    })
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Recent training data for analysis: ${JSON.stringify(context)}`,
      config: {
        systemInstruction: `As a world-class calisthenics coach, analyze the user's recent workout sessions. 
Each exercise includes multiple sets. Analyze volume, TUT (Time Under Tension) progression across sets, and overall session duration.

Provide concise, actionable suggestions for:
1. Progression (e.g., increasing TUT, adding sets, or adjusting intensity based on performance tags).
2. Efficiency (based on session duration).
3. Specific exercise weaknesses.

Format the output in clear bullet points with short, sharp coaching tips.`,
        temperature: 0.7,
        topK: 40,
        topP: 0.95
      }
    });
    
    // Access .text property directly as per @google/genai guidelines
    return response.text || "I couldn't generate suggestions right now. Keep training hard!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI suggestions are currently unavailable. Check your internet connection.";
  }
};
