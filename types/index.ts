// ─── Database Models (Supabase Tables) ─────────────────────────────

export interface Subject {
  id: string;
  name_kz: string;
  name_ru: string;
  icon: string;
  color: string;
  order: number;
  is_active: boolean;
}

export interface Topic {
  id: string;
  subject_id: string;
  name_kz: string;
  description_kz: string;
  theory_text?: string;
  video_url: string | null;
  order: number;
  is_active: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type OptionLetter = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  topic_id: string;
  subject_id?: string;
  question_kz: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: OptionLetter;
  explanation?: string;
  difficulty: Difficulty;
  is_active: boolean;
}

export interface QuizResult {
  id: string;
  user_id: string;
  topic_id: string;
  subject_id?: string;
  score: number;
  total_questions: number;
  time_spent: number;
  created_at: string;
}

export interface UserProfile {
  id: string; // = auth.uid
  full_name: string;
  city: string;
  school: string;
  grade: number; // 9, 10, or 11
  goal_score: number; // 50–140
  selected_subjects: string[]; // subject IDs
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  topic_id: string;
  is_completed: boolean;
  best_score: number;
  attempts: number;
  last_attempt_at: string;
}

export interface UserAnswer {
  id: string;
  user_id: string;
  question_id: string;
  selected_option: OptionLetter;
  is_correct: boolean;
  ai_explanation: string | null; // cached AI response
  answered_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string; // YYYY-MM-DD
}

export interface XPLog {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface SubjectScore {
  subject_id: string;
  subject_name: string;
  score: number;
  total: number;
}

export interface UBTResult {
  id: string;
  user_id: string;
  total_score: number;
  subject_scores: SubjectScore[];
  time_spent: number; // seconds
  created_at: string;
}

// ─── UI / App-Level Types ───────────────────────────────────────────

export type AnswerState = 'default' | 'selected' | 'correct' | 'wrong';

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  selectedOption: OptionLetter | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  score: number;
  xpEarned: number;
  aiExplanation: string | null;
  isLoadingAI: boolean;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  selectedOption: OptionLetter;
  isCorrect: boolean;
  aiExplanation: string | null;
}

export interface DayActivity {
  day: string; // 'Mon' | 'Tue' etc
  completed: boolean;
}

export type TabName = 'index' | 'subjects' | 'ubt' | 'leaderboard' | 'profile';

// ─── Navigation Params ──────────────────────────────────────────────

export interface SubjectParams {
  id: string;
}

export interface TopicParams {
  id: string;
}

export interface QuizParams {
  topicId: string;
}

export interface ResultParams {
  quizId: string;
}

// ─── Native Text Reading ────────────────────────────────────────────

export interface ReadingText {
  id: string;
  topic_id: string;
  title_kz: string;
  body_kz: string;
  author_kz?: string;
}

export interface ReadingQuestion {
  id: string;
  text_id: string;
  question_kz: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: OptionLetter;
}
