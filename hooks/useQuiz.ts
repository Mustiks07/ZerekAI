import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getAIExplanation } from '@/lib/ai';
import { calculateQuizXP } from '@/lib/scoring';
import { useStore } from '@/store/useStore';
import { Config } from '@/constants/config';
import type { Question, OptionLetter, QuizState, QuizAnswer } from '@/types';

const MOCK_QUESTIONS: Question[] = [
  { id: 'q1', topic_id: 't1', question_kz: '2 + 2 = ?', option_a: '3', option_b: '4', option_c: '5', option_d: '6', correct_option: 'B', difficulty: 'easy', is_active: true },
  { id: 'q2', topic_id: 't1', question_kz: '5 × 3 = ?', option_a: '10', option_b: '12', option_c: '15', option_d: '20', correct_option: 'C', difficulty: 'easy', is_active: true },
  { id: 'q3', topic_id: 't1', question_kz: '100 ÷ 4 = ?', option_a: '20', option_b: '25', option_c: '30', option_d: '35', correct_option: 'B', difficulty: 'easy', is_active: true },
  { id: 'q4', topic_id: 't1', question_kz: '√144 = ?', option_a: '10', option_b: '11', option_c: '12', option_d: '14', correct_option: 'C', difficulty: 'medium', is_active: true },
  { id: 'q5', topic_id: 't1', question_kz: '7² = ?', option_a: '42', option_b: '47', option_c: '49', option_d: '56', correct_option: 'C', difficulty: 'easy', is_active: true },
  { id: 'q6', topic_id: 't1', question_kz: '3! = ?', option_a: '3', option_b: '6', option_c: '9', option_d: '12', correct_option: 'B', difficulty: 'medium', is_active: true },
  { id: 'q7', topic_id: 't1', question_kz: 'log₂(8) = ?', option_a: '2', option_b: '3', option_c: '4', option_d: '8', correct_option: 'B', difficulty: 'medium', is_active: true },
  { id: 'q8', topic_id: 't1', question_kz: '15% of 200 = ?', option_a: '20', option_b: '25', option_c: '30', option_d: '35', correct_option: 'C', difficulty: 'easy', is_active: true },
  { id: 'q9', topic_id: 't1', question_kz: '(-3) × (-4) = ?', option_a: '-12', option_b: '-7', option_c: '7', option_d: '12', correct_option: 'D', difficulty: 'easy', is_active: true },
  { id: 'q10', topic_id: 't1', question_kz: '2³ + 3² = ?', option_a: '13', option_b: '15', option_c: '17', option_d: '19', correct_option: 'C', difficulty: 'medium', is_active: true },
];

const initialState: QuizState = {
  questions: [],
  currentIndex: 0,
  selectedOption: null,
  isAnswered: false,
  isCorrect: null,
  score: 0,
  xpEarned: 0,
  aiExplanation: null,
  isLoadingAI: false,
  answers: [],
};

export function useQuiz(topicId: string) {
  const [state, setState] = useState<QuizState>(initialState);
  const { user, addXP } = useStore();

  const getOptionText = (q: Question, opt: OptionLetter): string => {
    const map: Record<OptionLetter, string> = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
    return map[opt];
  };

  const fetchQuestions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('topic_id', topicId)
        .eq('is_active', true)
        .limit(10);

      if (data && !error && data.length > 0) {
        const shuffled = (data as Question[]).sort(() => Math.random() - 0.5).slice(0, 10);
        setState({ ...initialState, questions: shuffled });
        return;
      }
    } catch (e) { console.error(e); }

    setState({ ...initialState, questions: MOCK_QUESTIONS });
  }, [topicId]);

  const selectAnswer = useCallback(async (option: OptionLetter) => {
    if (state.isAnswered) return;
    const q = state.questions[state.currentIndex];
    const correct = option === q.correct_option;

    setState(prev => ({
      ...prev,
      selectedOption: option,
      isAnswered: true,
      isCorrect: correct,
      score: correct ? prev.score + 1 : prev.score,
      xpEarned: correct ? prev.xpEarned + Config.XP_CORRECT_ANSWER : prev.xpEarned,
    }));

    if (!correct) {
      setState(prev => ({ ...prev, isLoadingAI: true }));

      // Check cache first
      let explanation: string | null = null;
      if (user?.id) {
        const { data, error } = await supabase.from('user_answers').select('ai_explanation')
          .eq('user_id', user.id).eq('question_id', q.id).not('ai_explanation', 'is', null)
          .maybeSingle();
        if (error && error.code !== 'PGRST116') {
          console.warn('AI explanation cache lookup failed:', error);
        }
        if (data?.ai_explanation) explanation = data.ai_explanation;
      }

      if (!explanation) {
        explanation = await getAIExplanation(
          q.question_kz, q.correct_option, getOptionText(q, q.correct_option),
          getOptionText(q, option), 'Математика', 'Тақырып'
        );
      }

      setState(prev => ({ ...prev, aiExplanation: explanation, isLoadingAI: false }));

      // Save answer + cache explanation
      if (user?.id) {
        const { error: insertError } = await supabase.from('user_answers').insert({
          user_id: user.id, question_id: q.id,
          selected_option: option, is_correct: false, ai_explanation: explanation,
          answered_at: new Date().toISOString(),
        });
        if (insertError) console.warn('Failed to save answer:', insertError);
      }
    } else {
      addXP(Config.XP_CORRECT_ANSWER);
      if (user?.id) {
        const { error: insertError } = await supabase.from('user_answers').insert({
          user_id: user.id, question_id: q.id,
          selected_option: option, is_correct: true, ai_explanation: null,
          answered_at: new Date().toISOString(),
        });
        if (insertError) console.warn('Failed to save answer:', insertError);
      }
    }

    // Record answer
    setState(prev => ({
      ...prev,
      answers: [...prev.answers, { questionId: q.id, selectedOption: option, isCorrect: correct, aiExplanation: prev.aiExplanation }],
    }));
  }, [state.isAnswered, state.questions, state.currentIndex, user?.id]);

  const nextQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      selectedOption: null,
      isAnswered: false,
      isCorrect: null,
      aiExplanation: null,
      isLoadingAI: false,
    }));
  }, []);

  const isFinished = state.currentIndex >= state.questions.length && state.questions.length > 0;
  const currentQuestion = state.questions[state.currentIndex] ?? null;
  const isLastQuestion = state.currentIndex === state.questions.length - 1;
  const progress = state.questions.length > 0 ? (state.currentIndex + 1) / state.questions.length : 0;

  return {
    ...state,
    currentQuestion,
    isFinished,
    isLastQuestion,
    progress,
    fetchQuestions,
    selectAnswer,
    nextQuestion,
    getOptionText,
  };
}
