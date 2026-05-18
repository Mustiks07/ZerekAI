import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Line, Circle as SvgCircle, G } from 'react-native-svg';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FlameIcon } from '@/components/ui/FlameIcon';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/colors';
import { useStore } from '@/store/useStore';
import { useStreak } from '@/hooks/useStreak';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { MOCK_SUBJECTS } from '@/hooks/useProgress';
import type { Subject } from '@/types';

interface SubjectBar {
  name: string;
  color: string;
  pct: number;
}

interface Achievement {
  icon: string;
  label: string;
  unlocked: boolean;
}

export default function ProfileScreen() {
  const { user, totalXP, subjects: storeSubjects } = useStore();
  const { currentStreak } = useStreak();
  const { signOut } = useAuth();

  const [subjectBars, setSubjectBars] = useState<SubjectBar[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const name = user?.full_name ?? '—';
  const grade = user?.grade ? `${user.grade}-сынып` : '';
  const city = user?.city ?? '';
  const gradeCity = [grade, city].filter(Boolean).join(' · ');

  const level = Math.floor(totalXP / 300) + 1;
  const xpInLevel = totalXP % 300;
  const xpProgress = xpInLevel / 300;
  const xpToNext = 300 - xpInLevel;

  useEffect(() => {
    if (!user?.id) { setIsLoading(false); return; }
    loadProfileData(user.id, storeSubjects);
  }, [user?.id]);

  const loadProfileData = async (userId: string, cachedSubjects: Subject[]) => {
    try {
      const selectedSubjects = user?.selected_subjects ?? [];

      const { data: quizResults, error: qErr } = await supabase
        .from('quiz_results')
        .select('subject_id, score, total_questions, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (qErr) throw qErr;

      const results = quizResults ?? [];
      setQuizCount(results.length);

      if (results.length > 0) {
        const totalScore = results.reduce((s: number, r: { score: number }) => s + r.score, 0);
        const totalQ = results.reduce((s: number, r: { total_questions: number }) => s + r.total_questions, 0);
        setAccuracy(totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0);
      }

      let allSubjects: Subject[] = cachedSubjects.length > 0 ? cachedSubjects : MOCK_SUBJECTS;
      if (allSubjects === MOCK_SUBJECTS && selectedSubjects.length > 0) {
        const { data: subjectData } = await supabase
          .from('subjects')
          .select('id, name_kz, name_ru, icon, color, order, is_active')
          .in('id', selectedSubjects);
        if (subjectData && subjectData.length > 0) {
          allSubjects = subjectData as Subject[];
        }
      }
      const subjectsForBars = selectedSubjects.length > 0
        ? allSubjects.filter(s => selectedSubjects.includes(s.id))
        : [];

      const subjectMap = new Map<string, { totalScore: number; totalQ: number }>();
      for (const r of results as { subject_id: string; score: number; total_questions: number }[]) {
        if (!r.subject_id) continue;
        const existing = subjectMap.get(r.subject_id) ?? { totalScore: 0, totalQ: 0 };
        subjectMap.set(r.subject_id, {
          totalScore: existing.totalScore + r.score,
          totalQ: existing.totalQ + r.total_questions,
        });
      }

      const bars: SubjectBar[] = subjectsForBars.map(s => {
        const data = subjectMap.get(s.id);
        const pct = data && data.totalQ > 0 ? Math.round((data.totalScore / data.totalQ) * 100) : 0;
        return { name: s.name_kz, color: s.color, pct };
      });
      setSubjectBars(bars);

      const last12 = [...results].slice(0, 12).reverse();
      if (last12.length > 0) {
        const chart = (last12 as { score: number; total_questions: number }[]).map(r =>
          r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 140) : 0
        );
        setChartData(chart);
      }

      const hasAny = results.length > 0;
      const has10 = results.length >= 10;
      const has100pct = (results as { score: number; total_questions: number }[]).some(
        r => r.total_questions > 0 && r.score === r.total_questions
      );
      const { data: streakData } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .single();
      const freshStreak = streakData?.current_streak ?? 0;

      setAchievements([
        { icon: '🔥', label: '7 күн', unlocked: freshStreak >= 7 },
        { icon: '🎯', label: '100%', unlocked: has100pct },
        { icon: '⭐', label: '1 тест', unlocked: hasAny },
        { icon: '🏆', label: '10 тест', unlocked: has10 },
      ]);
    } catch (e) {
      console.error('Profile load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Шығу', 'Шынымен шыққыңыз келе ме?', [
      { text: 'Жоқ', style: 'cancel' },
      { text: 'Иә', onPress: () => signOut() },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <LoadingSpinner fullScreen message="Жүктелуде..." />
      </SafeAreaView>
    );
  }

  const chartMax = chartData.length > 0 ? Math.max(...chartData, 1) : 140;
  const latestScore = chartData.length > 0 ? chartData[chartData.length - 1] : 0;
  const firstScore = chartData.length > 0 ? chartData[0] : 0;
  const scoreDiff = latestScore - firstScore;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            <View style={styles.lvlBadge}>
              <Text style={styles.lvlText}>LVL {level}</Text>
            </View>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.name}>{name}</Text>
            {gradeCity ? <Text style={styles.grade}>{gradeCity}</Text> : null}
            <View style={styles.xpRow}>
              <View style={styles.xpLabels}>
                <Text style={styles.xpCurrent}>{totalXP} XP</Text>
                <Text style={styles.xpTarget}>{level + 1}-деңгейге {xpToNext}</Text>
              </View>
              <ProgressBar progress={xpProgress} height={7} />
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { v: String(currentStreak), l: 'Күн серия', c: Colors.accentDark, hasFlame: true },
            { v: String(totalXP), l: 'XP', c: Colors.primary },
            { v: quizCount > 0 ? `${accuracy}%` : '—', l: 'Дәлдік', c: '#3D7BB8' },
            { v: String(quizCount), l: 'Тест', c: '#9B5DE5' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              {s.hasFlame && (
                <View style={styles.flameCenter}>
                  <FlameIcon size={16} />
                </View>
              )}
              <Text style={[styles.statValue, { color: s.c }]}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Болжамды балл</Text>
            <Text style={styles.cardSubtitle}>Соңғы {chartData.length} тест</Text>
          </View>
          {chartData.length > 0 ? (
            <>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreValue}>{latestScore}</Text>
                <Text style={styles.scoreMax}>/ 140</Text>
                {chartData.length > 1 && scoreDiff !== 0 && (
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>
                      {scoreDiff > 0 ? `↑ +${scoreDiff}` : `↓ ${scoreDiff}`}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.chartContainer}>
                <Svg width="100%" height={120} viewBox="0 0 320 120" preserveAspectRatio="none">
                  {[0, 1, 2, 3].map(g => (
                    <Line key={g} x1={0} x2={320} y1={20 + g * 28} y2={20 + g * 28}
                      stroke={Colors.line} strokeWidth={1} strokeDasharray="3 3" />
                  ))}
                  <Path
                    d={`M 0 ${120 - (chartData[0] / chartMax) * 100} ${chartData.map((v, i) => `L ${(i * 320) / Math.max(chartData.length - 1, 1)} ${120 - (v / chartMax) * 100}`).join(' ')} L 320 120 L 0 120 Z`}
                    fill={Colors.primary} fillOpacity={0.12}
                  />
                  <Path
                    d={`M 0 ${120 - (chartData[0] / chartMax) * 100} ${chartData.map((v, i) => `L ${(i * 320) / Math.max(chartData.length - 1, 1)} ${120 - (v / chartMax) * 100}`).join(' ')}`}
                    fill="none" stroke={Colors.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"
                  />
                  {chartData.map((v, i) => {
                    const last = i === chartData.length - 1;
                    const cx = (i * 320) / Math.max(chartData.length - 1, 1);
                    const cy = 120 - (v / chartMax) * 100;
                    return (
                      <G key={i}>
                        {last && <SvgCircle cx={cx} cy={cy} r={10} fill={Colors.primary} fillOpacity={0.2} />}
                        <SvgCircle cx={cx} cy={cy} r={last ? 5 : 3}
                          fill={last ? Colors.accent : Colors.primary}
                          stroke={last ? '#fff' : 'none'} strokeWidth={last ? 2 : 0} />
                      </G>
                    );
                  })}
                </Svg>
              </View>
            </>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>Бірінші тестті бастаңыз!</Text>
              <Text style={styles.emptyChartSub}>Нәтижелер осында көрсетіледі</Text>
            </View>
          )}
        </View>

        {subjectBars.length > 0 && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 14 }]}>Пәндер бойынша</Text>
            {subjectBars.map((s, i) => (
              <View key={s.name} style={i < subjectBars.length - 1 ? { marginBottom: 12 } : undefined}>
                <View style={styles.subjRow}>
                  <Text style={styles.subjName}>{s.name}</Text>
                  <Text style={[styles.subjPct, { color: s.color }]}>{s.pct}%</Text>
                </View>
                <ProgressBar progress={s.pct / 100} color={s.color} height={8} showShine={false} />
              </View>
            ))}
          </View>
        )}

        {achievements.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Жетістіктер</Text>
              <Text style={styles.achieveCount}>{achievements.filter(a => a.unlocked).length} / {achievements.length}</Text>
            </View>
            <View style={styles.achieveRow}>
              {achievements.map((a, idx) => (
                <View key={idx} style={[styles.achieveCard, { backgroundColor: a.unlocked ? Colors.primarySoft : Colors.bgAlt, opacity: a.unlocked ? 1 : 0.5 }]}>
                  <Text style={[styles.achieveEmoji, !a.unlocked && styles.achieveGray]}>{a.icon}</Text>
                  <Text style={[styles.achieveLabel, { color: a.unlocked ? Colors.primary : Colors.ink3 }]}>{a.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Button title="Шығу" variant="danger" onPress={handleLogout} style={{ marginTop: 8 }} />
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  avatar: {
    width: 76, height: 76, borderRadius: 22, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  lvlBadge: {
    position: 'absolute', bottom: -4, right: -4,
    backgroundColor: Colors.accent, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999, borderWidth: 2, borderColor: '#fff',
  },
  lvlText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  heroInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: Colors.ink, letterSpacing: -0.3 },
  grade: { fontSize: 13, color: Colors.ink2 },
  xpRow: { marginTop: 8, gap: 4 },
  xpLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  xpCurrent: { fontSize: 11, fontWeight: '700', color: Colors.ink3 },
  xpTarget: { fontSize: 11, fontWeight: '700', color: Colors.ink3 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 10,
    alignItems: 'center', borderWidth: 1.5, borderColor: Colors.line,
  },
  flameCenter: { marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  statLabel: { fontSize: 9.5, fontWeight: '700', color: Colors.ink3, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 1 },
  card: {
    backgroundColor: '#fff', borderRadius: 22, padding: 18,
    borderWidth: 1.5, borderColor: Colors.line, marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.ink },
  cardSubtitle: { fontSize: 11, fontWeight: '700', color: Colors.ink3 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 14 },
  scoreValue: { fontSize: 34, fontWeight: '800', color: Colors.primary, letterSpacing: -0.8 },
  scoreMax: { fontSize: 12, fontWeight: '700', color: Colors.ink3 },
  scoreBadge: { marginLeft: 'auto', backgroundColor: Colors.primarySoft, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  scoreBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  chartContainer: { height: 120, marginBottom: 6 },
  emptyChart: { paddingVertical: 24, alignItems: 'center', gap: 6 },
  emptyChartText: { fontSize: 16, fontWeight: '700', color: Colors.ink },
  emptyChartSub: { fontSize: 13, color: Colors.ink3 },
  subjRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  subjName: { fontSize: 13, fontWeight: '700', color: Colors.ink },
  subjPct: { fontSize: 13, fontWeight: '800' },
  achieveCount: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  achieveRow: { flexDirection: 'row', gap: 10 },
  achieveCard: { flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderRadius: 14 },
  achieveEmoji: { fontSize: 28, marginBottom: 4 },
  achieveGray: { opacity: 0.5 },
  achieveLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
});
