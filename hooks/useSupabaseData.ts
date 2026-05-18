import { supabase } from '@/lib/supabase';
import type { Topic, Question, SubjectScore } from '@/types';

// ─── Topic ───────────────────────────────────────────────────────────

export async function fetchTopicById(topicId: string): Promise<Topic | null> {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .single();
    if (error) throw error;
    return data as Topic;
  } catch {
    return null;
  }
}

// ─── Quiz questions ───────────────────────────────────────────────────

export async function fetchQuestionsByTopic(
  topicId: string,
  limit = 10
): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topicId)
      .eq('is_active', true);
    if (error) throw error;
    if (!data || data.length === 0) return [];
    const shuffled = (data as Question[]).sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  } catch {
    return [];
  }
}

// ─── UBT questions ────────────────────────────────────────────────────

export interface UBTQuestionGroup {
  subjectId: string;
  subjectName: string;
  subjectIcon: string;
  questions: Question[];
}

export async function fetchUBTQuestions(
  subjectIds: string[],
  countPerSubject = 20
): Promise<UBTQuestionGroup[]> {
  if (!subjectIds.length) return [];

  const groups: UBTQuestionGroup[] = [];

  for (const subjectId of subjectIds) {
    try {
      const [{ data: subjectData }, { data: questionData }] = await Promise.all([
        supabase.from('subjects').select('name_kz, icon').eq('id', subjectId).single(),
        supabase
          .from('questions')
          .select('*')
          .eq('subject_id', subjectId)
          .eq('is_active', true),
      ]);

      if (!questionData || questionData.length === 0) continue;

      const shuffled = (questionData as Question[]).sort(() => Math.random() - 0.5);
      groups.push({
        subjectId,
        subjectName: subjectData?.name_kz ?? 'Пән',
        subjectIcon: subjectData?.icon ?? '📚',
        questions: shuffled.slice(0, countPerSubject),
      });
    } catch {
      // skip this subject on error
    }
  }

  return groups;
}

// ─── Save results ─────────────────────────────────────────────────────

export interface QuizResultInput {
  userId: string;
  topicId: string;
  subjectId?: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
}

export async function saveQuizResult(input: QuizResultInput): Promise<void> {
  try {
    const { error } = await supabase.from('quiz_results').insert({
      user_id: input.userId,
      topic_id: input.topicId,
      subject_id: input.subjectId ?? null,
      score: input.score,
      total_questions: input.totalQuestions,
      time_spent: input.timeSpent,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (e) {
    console.warn('saveQuizResult failed:', e);
  }
}

export interface UBTResultInput {
  userId: string;
  totalScore: number;
  subjectScores: SubjectScore[];
  timeSpent: number;
}

export async function saveUBTResult(input: UBTResultInput): Promise<void> {
  try {
    const { error } = await supabase.from('ubt_results').insert({
      user_id: input.userId,
      total_score: input.totalScore,
      subject_scores: input.subjectScores,
      time_spent: input.timeSpent,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (e) {
    console.warn('saveUBTResult failed:', e);
  }
}
