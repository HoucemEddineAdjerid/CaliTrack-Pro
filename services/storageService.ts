
import { Exercise, Workout, WorkoutSession, UserProfile, Milestone } from '../types';

const KEYS = {
  EXERCISES: 'calitrack_exercises',
  WORKOUTS: 'calitrack_workouts',
  SESSIONS: 'calitrack_sessions',
  USER: 'calitrack_user',
  MILESTONES: 'calitrack_milestones'
};

export const storageService = {
  getExercises: (): Exercise[] => JSON.parse(localStorage.getItem(KEYS.EXERCISES) || '[]'),
  saveExercises: (data: Exercise[]) => localStorage.setItem(KEYS.EXERCISES, JSON.stringify(data)),
  
  getWorkouts: (): Workout[] => JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '[]'),
  saveWorkouts: (data: Workout[]) => localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(data)),
  
  getSessions: (): WorkoutSession[] => JSON.parse(localStorage.getItem(KEYS.SESSIONS) || '[]'),
  saveSessions: (data: WorkoutSession[]) => localStorage.setItem(KEYS.SESSIONS, JSON.stringify(data)),
  
  getUser: (): UserProfile => JSON.parse(localStorage.getItem(KEYS.USER) || JSON.stringify({
    profile_id: '1',
    name: 'Athlete',
    streak: 0,
    last_workout_date: null
  })),
  saveUser: (data: UserProfile) => localStorage.setItem(KEYS.USER, JSON.stringify(data)),
  
  getMilestones: (): Milestone[] => JSON.parse(localStorage.getItem(KEYS.MILESTONES) || '[]'),
  saveMilestones: (data: Milestone[]) => localStorage.setItem(KEYS.MILESTONES, JSON.stringify(data))
};
