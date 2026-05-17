import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import type { UserProgress, Subject, Topic } from '@/types';

export const MOCK_SUBJECTS: Subject[] = [
  { id: '1', name_kz: 'Математика', name_ru: 'Математика', icon: '📐', color: '#2D6A4F', order: 1, is_active: true },
  { id: '2', name_kz: 'Физика', name_ru: 'Физика', icon: '⚛️', color: '#3A86FF', order: 2, is_active: true },
  { id: '3', name_kz: 'Қазақ тілі', name_ru: 'Казахский язык', icon: '📝', color: '#E76F51', order: 3, is_active: true },
  { id: '4', name_kz: 'Тарих', name_ru: 'История', icon: '🏛️', color: '#F4A261', order: 4, is_active: true },
  { id: '5', name_kz: 'Биология', name_ru: 'Биология', icon: '🧬', color: '#52B788', order: 5, is_active: true },
  { id: '6', name_kz: 'Химия', name_ru: 'Химия', icon: '🧪', color: '#9B5DE5', order: 6, is_active: true },
  { id: '7', name_kz: 'Ағылшын тілі', name_ru: 'Английский язык', icon: '🇬🇧', color: '#00BBF9', order: 7, is_active: true },
  { id: '8', name_kz: 'Информатика', name_ru: 'Информатика', icon: '💻', color: '#4361EE', order: 8, is_active: true },
  { id: '9', name_kz: 'География', name_ru: 'География', icon: '🌍', color: '#06D6A0', order: 9, is_active: true },
];

export const MOCK_TOPICS: Record<string, Topic[]> = {
  '1': [
    { id: 't1', subject_id: '1', name_kz: 'Натурал сандар', description_kz: 'Натурал сандар және олардың қасиеттері', video_url: null, order: 1, is_active: true },
    { id: 't2', subject_id: '1', name_kz: 'Бөлшектер', description_kz: 'Жай және ондық бөлшектер', video_url: null, order: 2, is_active: true },
    { id: 't3', subject_id: '1', name_kz: 'Теңдеулер', description_kz: 'Сызықтық және квадрат теңдеулер', video_url: null, order: 3, is_active: true },
    { id: 't4', subject_id: '1', name_kz: 'Функциялар', description_kz: 'Функция графиктері және қасиеттері', video_url: null, order: 4, is_active: true },
    { id: 't5', subject_id: '1', name_kz: 'Геометрия негіздері', description_kz: 'Планиметрия және стереометрия', video_url: null, order: 5, is_active: true },
  ],
  '2': [
    { id: 't6', subject_id: '2', name_kz: 'Кинематика', description_kz: 'Қозғалыс түрлері және формулалары', video_url: null, order: 1, is_active: true },
    { id: 't7', subject_id: '2', name_kz: 'Динамика', description_kz: 'Ньютон заңдары', video_url: null, order: 2, is_active: true },
    { id: 't8', subject_id: '2', name_kz: 'Энергия', description_kz: 'Кинетикалық және потенциалдық энергия', video_url: null, order: 3, is_active: true },
  ],
  '3': [
    { id: 't9', subject_id: '3', name_kz: 'Фонетика', description_kz: 'Дыбыстар мен әріптер', video_url: null, order: 1, is_active: true },
    { id: 't10', subject_id: '3', name_kz: 'Морфология', description_kz: 'Сөз таптары', video_url: null, order: 2, is_active: true },
    { id: 't11', subject_id: '3', name_kz: 'Синтаксис', description_kz: 'Сөйлем мүшелері', video_url: null, order: 3, is_active: true },
  ],
  '4': [
    { id: 't12', subject_id: '4', name_kz: 'Ежелгі дәуір', description_kz: 'Ежелгі мемлекеттер', video_url: null, order: 1, is_active: true },
    { id: 't13', subject_id: '4', name_kz: 'Орта ғасырлар', description_kz: 'Түркі кезеңі', video_url: null, order: 2, is_active: true },
  ],
};

export function useProgress() {
  const { user, subjectProgress, setSubjectProgress, topicProgress, setTopicProgress } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const loadSubjects = useCallback(async (): Promise<Subject[]> => {
    try {
      const { data, error } = await supabase.from('subjects').select('*').eq('is_active', true).order('order');
      if (data && !error && data.length > 0) return data as Subject[];
    } catch (e) { console.error(e); }
    return MOCK_SUBJECTS;
  }, []);

  const loadTopics = useCallback(async (subjectId: string): Promise<Topic[]> => {
    try {
      const { data, error } = await supabase.from('topics').select('*').eq('subject_id', subjectId).eq('is_active', true).order('order');
      if (data && !error && data.length > 0) return data as Topic[];
    } catch (e) { console.error(e); }
    return MOCK_TOPICS[subjectId] ?? [];
  }, []);

  const loadUserProgress = useCallback(async (topicId: string): Promise<UserProgress | null> => {
    if (!user?.id) return null;
    const cached = topicProgress.get(topicId);
    if (cached) return cached;
    try {
      const { data, error } = await supabase.from('user_progress').select('*').eq('user_id', user.id).eq('topic_id', topicId).single();
      if (data && !error) { const p = data as UserProgress; setTopicProgress(topicId, p); return p; }
    } catch (e) { console.error(e); }
    return null;
  }, [user?.id, topicProgress]);

  const updateProgress = useCallback(async (topicId: string, score: number) => {
    if (!user?.id) return;
    const existing = topicProgress.get(topicId);
    const pd = {
      user_id: user.id, topic_id: topicId, is_completed: score >= 7,
      best_score: existing ? Math.max(existing.best_score, score) : score,
      attempts: (existing?.attempts ?? 0) + 1, last_attempt_at: new Date().toISOString(),
    };
    try {
      if (existing) { await supabase.from('user_progress').update(pd).eq('id', existing.id); }
      else { await supabase.from('user_progress').insert(pd); }
    } catch (e) { console.error(e); }
    setTopicProgress(topicId, { id: existing?.id ?? 'local', ...pd });
  }, [user?.id, topicProgress]);

  return { isLoading, loadSubjects, loadTopics, loadUserProgress, updateProgress, subjectProgress };
}
