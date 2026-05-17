import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Line, Circle as SvgCircle, G } from 'react-native-svg';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FlameIcon } from '@/components/ui/FlameIcon';
import { Colors } from '@/constants/colors';
import { useStore } from '@/store/useStore';

/**
 * Profile screen — avatar with LVL badge, stat row, progress chart,
 * subject bars, achievements. Matches дизайн.html Screen 07 Profile.
 */
export default function ProfileScreen() {
  const { user, totalXP } = useStore();
  const name = user?.full_name ?? 'Айдана С.';

  const chartData = [38, 52, 45, 68, 61, 75, 72, 88, 80, 92, 85, 95];
  const chartMax = 100;

  const handleLogout = () => {
    Alert.alert('Шығу', 'Шынымен шыққыңыз келе ме?', [
      { text: 'Жоқ', style: 'cancel' },
      { text: 'Иә', onPress: () => router.replace('/(auth)/login') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile hero */}
        <View style={styles.heroRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
            <View style={styles.lvlBadge}>
              <Text style={styles.lvlText}>LVL 12</Text>
            </View>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.grade}>11-сынып · Алматы</Text>
            <View style={styles.xpRow}>
              <View style={styles.xpLabels}>
                <Text style={styles.xpCurrent}>{totalXP || 1240} XP</Text>
                <Text style={styles.xpTarget}>13-деңгейге 760</Text>
              </View>
              <ProgressBar progress={0.62} height={7} />
            </View>
          </View>
        </View>

        {/* Stat row */}
        <View style={styles.statsRow}>
          {[
            { v: '27', l: 'Күн серия', c: Colors.accentDark, hasFlame: true },
            { v: `${totalXP || 1240}`, l: 'XP', c: Colors.primary },
            { v: '83%', l: 'Дәлдік', c: '#3D7BB8' },
            { v: '47', l: 'Лига', c: '#9B5DE5' },
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

        {/* Progress chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Болжамды балл</Text>
            <Text style={styles.cardSubtitle}>Соңғы 12 апта</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>118</Text>
            <Text style={styles.scoreMax}>/ 140</Text>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeText}>↑ +23</Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
            <Svg width="100%" height={120} viewBox="0 0 320 120" preserveAspectRatio="none">
              {[0, 1, 2, 3].map(g => (
                <Line key={g} x1={0} x2={320} y1={20 + g * 28} y2={20 + g * 28}
                  stroke={Colors.line} strokeWidth={1} strokeDasharray="3 3" />
              ))}
              <Path
                d={`M 0 ${120 - (chartData[0] / chartMax) * 100} ${chartData.map((v, i) => `L ${(i * 320) / (chartData.length - 1)} ${120 - (v / chartMax) * 100}`).join(' ')} L 320 120 L 0 120 Z`}
                fill={Colors.primary} fillOpacity={0.12}
              />
              <Path
                d={`M 0 ${120 - (chartData[0] / chartMax) * 100} ${chartData.map((v, i) => `L ${(i * 320) / (chartData.length - 1)} ${120 - (v / chartMax) * 100}`).join(' ')}`}
                fill="none" stroke={Colors.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"
              />
              {chartData.map((v, i) => {
                const last = i === chartData.length - 1;
                const cx = (i * 320) / (chartData.length - 1);
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
        </View>

        {/* Subjects */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { marginBottom: 14 }]}>Пәндер бойынша</Text>
          {[
            { n: 'Математика', v: 92, c: Colors.primary },
            { n: 'Физика', v: 78, c: '#9B5DE5' },
            { n: 'Қаз. тарихы', v: 65, c: '#8D6E63' },
            { n: 'Қаз. тілі', v: 88, c: '#3D7BB8' },
          ].map((s, i) => (
            <View key={i} style={i < 3 ? { marginBottom: 12 } : undefined}>
              <View style={styles.subjRow}>
                <Text style={styles.subjName}>{s.n}</Text>
                <Text style={[styles.subjPct, { color: s.c }]}>{s.v}%</Text>
              </View>
              <ProgressBar progress={s.v / 100} color={s.c} height={8} showShine={false} />
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Жетістіктер</Text>
            <Text style={styles.achieveCount}>12 / 30</Text>
          </View>
          <View style={styles.achieveRow}>
            {[
              { i: '🔥', l: '30 күн', got: true },
              { i: '🎯', l: '100%', got: true },
              { i: '⭐', l: 'Топ-10', got: true },
              { i: '🏆', l: 'Чемпион', got: false },
            ].map((a, idx) => (
              <View key={idx} style={[styles.achieveCard, { backgroundColor: a.got ? Colors.primarySoft : Colors.bgAlt, opacity: a.got ? 1 : 0.5 }]}>
                <Text style={[styles.achieveEmoji, !a.got && styles.achieveGray]}>{a.i}</Text>
                <Text style={[styles.achieveLabel, { color: a.got ? Colors.primary : Colors.ink3 }]}>{a.l}</Text>
              </View>
            ))}
          </View>
        </View>

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
