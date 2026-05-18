import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AnswerOption } from '@/components/quiz/AnswerOption';
import { Colors } from '@/constants/colors';
import { Config } from '@/constants/config';
import { useStore } from '@/store/useStore';
import { fetchUBTQuestions, saveUBTResult, type UBTQuestionGroup } from '@/hooks/useSupabaseData';
import { calculateStreak } from '@/lib/scoring';
import { supabase } from '@/lib/supabase';
import type { Question, OptionLetter, SubjectScore } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────

type UBTPhase = 'intro' | 'loading' | 'active' | 'saving' | 'finished';

interface FlatQuestion extends Question {
  subjectName: string;
  subjectId: string;
  subjectIcon: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Main Screen ──────────────────────────────────────────────────────

export default function UBTSessionScreen() {
  const { user, subjects, addXP, setStreak } = useStore();

  const [phase, setPhase] = useState<UBTPhase>('intro');
  const [questions, setQuestions] = useState<FlatQuestion[]>([]);
  const [groups, setGroups] = useState<UBTQuestionGroup[]>([]);
  const [answers, setAnswers] = useState<(OptionLetter | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Config.UBT_TIME_MINUTES * 60);
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // ─── Timer ───────────────────────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          handleFinish(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), []);

  // ─── Load questions ───────────────────────────────────────────────

  const handleStart = async () => {
    setPhase('loading');

    const subjectIds = user?.selected_subjects?.length
      ? user.selected_subjects
      : subjects.slice(0, 5).map((s) => s.id);

    try {
      const fetchedGroups = await fetchUBTQuestions(subjectIds, 20);

      if (fetchedGroups.length === 0) {
        Alert.alert(
          'Сұрақтар жоқ',
          'Supabase-те әлі сұрақтар жоқ. Алдымен 002 миграциясын іске қосыңыз.',
          [{ text: 'Артқа', onPress: () => setPhase('intro') }]
        );
        return;
      }

      const flat: FlatQuestion[] = [];
      for (const g of fetchedGroups) {
        for (const q of g.questions) {
          flat.push({ ...q, subjectName: g.subjectName, subjectId: g.subjectId, subjectIcon: g.subjectIcon });
        }
      }

      setGroups(fetchedGroups);
      setQuestions(flat);
      setAnswers(new Array(flat.length).fill(null));
      setCurrentIndex(0);
      setTimeLeft(Config.UBT_TIME_MINUTES * 60);
      startTimeRef.current = Date.now();

      setPhase('active');
      startTimer();
    } catch (e) {
      Alert.alert('Қате', 'Сұрақтарды жүктеу мүмкін болмады. Қайталап көріңіз.');
      setPhase('intro');
    }
  };

  // ─── Answer selection ─────────────────────────────────────────────

  const handleSelectAnswer = useCallback((option: OptionLetter) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = option;
      return updated;
    });
  }, [currentIndex]);

  // ─── Navigation ───────────────────────────────────────────────────

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, questions.length - 1)));
  }, [questions.length]);

  // ─── Finish & calculate score ─────────────────────────────────────

  const handleFinish = useCallback(async (timeUp = false) => {
    stopTimer();
    setPhase('saving');

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Calculate per-subject scores
    const scoreMap: Record<string, { correct: number; total: number; name: string }> = {};
    questions.forEach((q, i) => {
      if (!scoreMap[q.subjectId]) {
        scoreMap[q.subjectId] = { correct: 0, total: 0, name: q.subjectName };
      }
      scoreMap[q.subjectId].total += 1;
      if (answers[i] === q.correct_option) {
        scoreMap[q.subjectId].correct += 1;
      }
    });

    const scores: SubjectScore[] = Object.entries(scoreMap).map(([sid, v]) => ({
      subject_id: sid,
      subject_name: v.name,
      score: v.correct,
      total: v.total,
    }));

    const total = scores.reduce((acc, s) => acc + s.score, 0);

    setSubjectScores(scores);
    setTotalScore(total);

    // Save to Supabase + update XP and streak
    if (user?.id) {
      await saveUBTResult({
        userId: user.id,
        totalScore: total,
        subjectScores: scores,
        timeSpent,
      });

      const xpEarned = total * Config.XP_CORRECT_ANSWER;
      addXP(xpEarned);

      // Update streak
      try {
        const { data: streakData } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (streakData) {
          const update = calculateStreak(streakData);
          await supabase.from('streaks').update(update).eq('user_id', user.id);
          setStreak({ ...streakData, ...update });
          if (update.streakBonusXP > 0) addXP(update.streakBonusXP);
        }
      } catch {
        // streak update not critical
      }
    }

    setPhase('finished');
  }, [questions, answers, user, stopTimer, addXP, setStreak]);

  const confirmFinish = useCallback(() => {
    const answered = answers.filter(Boolean).length;
    const unanswered = questions.length - answered;
    Alert.alert(
      'ҰБТ-ны аяқтау',
      unanswered > 0
        ? `${unanswered} сұрақ жауапсыз қалды. Аяқтағыңыз келе ме?`
        : 'Барлық сұраққа жауап берілді. Аяқтайсыз ба?',
      [
        { text: 'Жоқ', style: 'cancel' },
        { text: 'Иә, аяқтау', onPress: () => handleFinish(false) },
      ]
    );
  }, [answers, questions.length, handleFinish]);

  // ─── Renders ─────────────────────────────────────────────────────

  if (phase === 'loading' || phase === 'saving') {
    return (
      <LoadingSpinner
        fullScreen
        message={phase === 'loading' ? 'Сұрақтар жүктелуде...' : 'Нәтиже сақталуда...'}
      />
    );
  }

  if (phase === 'intro') {
    return <IntroScreen subjects={subjects} user={user} onStart={handleStart} />;
  }

  if (phase === 'finished') {
    return (
      <FinishedScreen
        subjectScores={subjectScores}
        totalScore={totalScore}
        totalQuestions={questions.length}
        xpEarned={totalScore * Config.XP_CORRECT_ANSWER}
        onHome={() => router.replace('/(tabs)')}
      />
    );
  }

  // ─── Active quiz ──────────────────────────────────────────────────

  const current = questions[currentIndex];
  const answered = answers.filter(Boolean).length;
  const options: { letter: OptionLetter; text: string }[] = [
    { letter: 'A', text: current.option_a },
    { letter: 'B', text: current.option_b },
    { letter: 'C', text: current.option_c },
    { letter: 'D', text: current.option_d },
  ];

  const isLowTime = timeLeft < 300;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={[styles.timerBadge, isLowTime && styles.timerBadgeLow]}>
          <Text style={styles.timerIcon}>⏱️</Text>
          <Text style={[styles.timerText, isLowTime && styles.timerTextLow]}>
            {formatTime(timeLeft)}
          </Text>
        </View>

        <View style={styles.topCenter}>
          <Text style={styles.progressLabel}>{answered}/{questions.length} жауапталды</Text>
          <ProgressBar progress={answered / questions.length} height={6} />
        </View>

        <Button
          title="Аяқтау"
          variant="danger"
          small
          fullWidth={false}
          onPress={confirmFinish}
        />
      </View>

      {/* Subject label */}
      <View style={styles.subjectBar}>
        <Text style={styles.subjectIcon}>{current.subjectIcon}</Text>
        <Text style={styles.subjectName}>{current.subjectName}</Text>
        <Text style={styles.questionCount}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      {/* Question dots navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dotsScroll}
        contentContainerStyle={styles.dotsContent}
      >
        {questions.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => goTo(i)}
            style={[
              styles.dot,
              i === currentIndex && styles.dotActive,
              answers[i] !== null && i !== currentIndex && styles.dotAnswered,
            ]}
          >
            <Text style={[
              styles.dotText,
              i === currentIndex && styles.dotTextActive,
            ]}>
              {i + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Question + options */}
      <ScrollView
        style={styles.questionScroll}
        contentContainerStyle={styles.questionContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.questionCard}>
          <Text style={styles.questionText}>{current.question_kz}</Text>
        </Card>

        <View style={styles.options}>
          {options.map((opt) => {
            const selected = answers[currentIndex];
            let state: 'default' | 'selected' = 'default';
            if (selected === opt.letter) state = 'selected';
            return (
              <AnswerOption
                key={opt.letter}
                letter={opt.letter}
                text={opt.text}
                state={state}
                onPress={() => handleSelectAnswer(opt.letter)}
                disabled={false}
              />
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Prev / Next navigation */}
      <View style={styles.navBar}>
        <Button
          title="← Алдыңғы"
          variant="secondary"
          small
          fullWidth={false}
          disabled={currentIndex === 0}
          onPress={() => goTo(currentIndex - 1)}
        />
        <Button
          title={currentIndex === questions.length - 1 ? 'Аяқтау ✓' : 'Келесі →'}
          small
          fullWidth={false}
          onPress={
            currentIndex === questions.length - 1
              ? confirmFinish
              : () => goTo(currentIndex + 1)
          }
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Intro Screen ─────────────────────────────────────────────────────

function IntroScreen({
  subjects,
  user,
  onStart,
}: {
  subjects: any[];
  user: any;
  onStart: () => void;
}) {
  const displaySubjects = user?.selected_subjects?.length
    ? subjects.filter((s) => user.selected_subjects.includes(s.id))
    : subjects.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.introScroll}>
        <Text style={styles.introTitle}>ҰБТ Симуляция 📝</Text>
        <Text style={styles.introSub}>Нақты емтихан форматы</Text>

        <Card style={styles.warningCard}>
          <Text style={styles.warningText}>
            ⚠️ ҰБТ басталғаннан кейін {Config.UBT_TIME_MINUTES} минут уақыт беріледі.
            Барлық сұраққа жауап беруге тырысыңыз!
          </Text>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoVal}>{Config.UBT_TOTAL_QUESTIONS}</Text>
              <Text style={styles.infoLabel}>сұрақ</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoVal}>{Config.UBT_TIME_MINUTES}</Text>
              <Text style={styles.infoLabel}>минут</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoVal}>{displaySubjects.length}</Text>
              <Text style={styles.infoLabel}>пән</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Пәндер:</Text>
        {displaySubjects.map((s, i) => (
          <Card key={s.id ?? i} style={styles.subjectRow}>
            <Text style={styles.subjectRowIcon}>{s.icon}</Text>
            <View style={styles.subjectRowInfo}>
              <Text style={styles.subjectRowName}>{s.name_kz}</Text>
              <Text style={styles.subjectRowQ}>~20 сұрақ</Text>
            </View>
          </Card>
        ))}

        {displaySubjects.length === 0 && (
          <Card style={styles.warningCard}>
            <Text style={styles.warningText}>
              Пәндер жоқ. Профиліңізде пән таңдаңыз немесе онбординг өтіңіз.
            </Text>
          </Card>
        )}

        <Button title="ҰБТ бастау 🚀" onPress={onStart} style={styles.startBtn} />
        <Button title="← Артқа" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Finished Screen ──────────────────────────────────────────────────

function FinishedScreen({
  subjectScores,
  totalScore,
  totalQuestions,
  xpEarned,
  onHome,
}: {
  subjectScores: SubjectScore[];
  totalScore: number;
  totalQuestions: number;
  xpEarned: number;
  onHome: () => void;
}) {
  const pct = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : pct >= 40 ? '📚' : '💪';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.finishedScroll}>
        <View style={styles.resultEmoji}>
          <Text style={styles.resultEmojiText}>{emoji}</Text>
        </View>

        <Text style={styles.resultHeading}>ҰБТ аяқталды!</Text>

        <Card style={styles.resultScoreCard}>
          <Text style={styles.resultScore}>{totalScore}/{totalQuestions}</Text>
          <Text style={styles.resultScoreLabel}>дұрыс жауап ({pct}%)</Text>
          <View style={styles.resultProgressWrap}>
            <ProgressBar progress={totalScore / totalQuestions} height={12} />
          </View>
        </Card>

        <Card style={styles.xpCard}>
          <Text style={styles.xpText}>+{xpEarned} XP жиналды!</Text>
        </Card>

        <Text style={styles.sectionTitle}>Пәндер бойынша нәтиже:</Text>
        {subjectScores.map((s) => {
          const sPct = s.total > 0 ? Math.round((s.score / s.total) * 100) : 0;
          return (
            <Card key={s.subject_id} style={styles.subjectScoreCard}>
              <View style={styles.subjectScoreRow}>
                <Text style={styles.subjectScoreName}>{s.subject_name}</Text>
                <Text style={styles.subjectScoreVal}>{s.score}/{s.total}</Text>
              </View>
              <ProgressBar
                progress={s.score / s.total}
                height={8}
                color={sPct >= 70 ? Colors.good : sPct >= 50 ? Colors.warn : Colors.bad}
              />
              <Text style={styles.subjectScorePct}>{sPct}%</Text>
            </Card>
          );
        })}

        <Button title="Басты бетке оралу 🏠" onPress={onHome} style={{ marginTop: 8 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  // Active quiz
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    backgroundColor: Colors.card,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bgAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerBadgeLow: { backgroundColor: Colors.badSoft },
  timerIcon: { fontSize: 14 },
  timerText: { fontSize: 15, fontWeight: '700', color: Colors.ink, fontVariant: ['tabular-nums'] },
  timerTextLow: { color: Colors.bad },
  topCenter: { flex: 1, gap: 4 },
  progressLabel: { fontSize: 11, color: Colors.ink3, fontWeight: '600' },

  subjectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primarySoft,
  },
  subjectIcon: { fontSize: 18 },
  subjectName: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.primary },
  questionCount: { fontSize: 12, color: Colors.ink3, fontWeight: '600' },

  dotsScroll: { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: Colors.line },
  dotsContent: { paddingHorizontal: 12, alignItems: 'center', gap: 6 },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  dotActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  dotAnswered: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary },
  dotText: { fontSize: 11, fontWeight: '700', color: Colors.ink3 },
  dotTextActive: { color: '#fff' },

  questionScroll: { flex: 1 },
  questionContent: { padding: 16, gap: 14 },
  questionCard: { padding: 18 },
  questionText: { fontSize: 17, fontWeight: '700', color: Colors.ink, lineHeight: 26 },
  options: { gap: 10 },

  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: Colors.card,
    gap: 12,
  },

  // Intro
  introScroll: { padding: 20, paddingBottom: 40, gap: 12 },
  introTitle: { fontSize: 28, fontWeight: '800', color: Colors.ink },
  introSub: { fontSize: 14, color: Colors.ink3, marginBottom: 4 },
  warningCard: {
    padding: 14, backgroundColor: '#FFF8E1',
    borderColor: Colors.warn, borderWidth: 1, borderRadius: 14,
  },
  warningText: { fontSize: 13, color: Colors.ink2, lineHeight: 20 },
  infoCard: { padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  infoItem: { alignItems: 'center', gap: 2 },
  infoVal: { fontSize: 24, fontWeight: '900', color: Colors.primary },
  infoLabel: { fontSize: 12, color: Colors.ink3 },
  infoDivider: { width: 1, height: 30, backgroundColor: Colors.line },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.ink, marginTop: 4 },
  subjectRow: { flexDirection: 'row', padding: 12, alignItems: 'center', gap: 10 },
  subjectRowIcon: { fontSize: 22 },
  subjectRowInfo: { flex: 1 },
  subjectRowName: { fontSize: 14, fontWeight: '600', color: Colors.ink },
  subjectRowQ: { fontSize: 12, color: Colors.ink3 },
  startBtn: { marginTop: 8 },

  // Finished
  finishedScroll: { padding: 20, paddingBottom: 40, alignItems: 'center', gap: 14 },
  resultEmoji: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  resultEmojiText: { fontSize: 44 },
  resultHeading: { fontSize: 26, fontWeight: '900', color: Colors.ink, letterSpacing: -0.5 },
  resultScoreCard: { width: '100%', padding: 24, alignItems: 'center', gap: 8 },
  resultScore: { fontSize: 48, fontWeight: '900', color: Colors.primary, letterSpacing: -1 },
  resultScoreLabel: { fontSize: 14, color: Colors.ink3, fontWeight: '600' },
  resultProgressWrap: { width: '100%', marginTop: 4 },
  xpCard: {
    paddingVertical: 14, paddingHorizontal: 24,
    backgroundColor: Colors.accentSoft, borderColor: Colors.accent,
  },
  xpText: { fontSize: 18, fontWeight: '800', color: Colors.accentDark, textAlign: 'center' },
  subjectScoreCard: { width: '100%', padding: 14, gap: 8 },
  subjectScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectScoreName: { fontSize: 14, fontWeight: '700', color: Colors.ink, flex: 1 },
  subjectScoreVal: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  subjectScorePct: { fontSize: 12, color: Colors.ink3, fontWeight: '600', textAlign: 'right' },
});
