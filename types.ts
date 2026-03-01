
export enum Mood {
  VeryLow = 1,
  Low = 2,
  Neutral = 3,
  Good = 4,
  Excellent = 5
}

export enum SocialBattery {
  Drained = 1,
  Low = 2,
  Moderate = 3,
  High = 4,
  Full = 5
}

export interface UserInputState {
  mood: number;
  socialBattery: number;
  sleepHours: number;
  upcomingTasks: string; // Comma separated or free text
  currentStress: number;
}

export interface StudyBlock {
  timeBlock: string;
  task: string;
  energyLevel: string; // High, Medium, Low
  focusType: string; // Deep Work, Admin, Creative, Rest
}

export interface AnalysisResult {
  energyProjection: number[]; // Array of predicted energy levels for next 12 hours
  burnoutRisk: string; // "Low", "Medium", "High"
  burnoutExplanation: string;
  socialStrategy: string;
  collaboratorSuggestion: string;
  rechargeTip: string;
  mentalHealthAlert: boolean;
  studyPlan: StudyBlock[]; // New: AI generated schedule
}

export interface JournalEntry {
  id: string;
  timestamp: Date;
  content: string; // This will now store the chat summary or transcript
  sentiment: string;
  aiReflection: string;
  moodScore: number;
}

export interface DiagramStep {
  label: string;
  description?: string;
  icon?: string; // Support for icon names for visual aids
}

export interface Diagram {
  type: 'flowchart' | 'cycle' | 'list';
  title: string;
  steps: DiagramStep[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  diagram?: Diagram; // Support for visual aids
}

export enum ViewState {
  CheckIn = 'CHECKIN',
  Dashboard = 'DASHBOARD',
  Planner = 'PLANNER',
  Collaborate = 'COLLABORATE',
  Journal = 'JOURNAL',
  Arcade = 'ARCADE',
  Assistant = 'ASSISTANT'
}

export interface GameContent {
  question: string;
  answer: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
