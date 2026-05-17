import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';

/**
 * UBT tab — info + start screen with dark header, subject tabs,
 * navigator grid preview. Matches дизайн.html Screen 06 UBT.
 */
export default function UBTScreen() {
  const subjectTabs = [
    { l: 'Сауаттылық', n: '20' },
    { l: 'Қаз.тілі', n: '20' },
    { l: 'Қаз.тарихы', n: '20' },
    { l: 'Математика', n: '40', on: true },
    { l: 'Физика', n: '40' },
  ];

  const recentResults = [
    { date: '10 мамыр', score: 87 },
    { date: '5 мамыр', score: 72 },
    { date: '1 мамыр', score: 65 },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header info card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerLabel}>ҰБТ СИМУЛЯЦИЯСЫ</Text>
              <Text style={styles.headerTitle}>Толық тест · 120 сұрақ</Text>
            </View>
            <View style={styles.timerBadge}>
              <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                <SvgCircle cx={7} cy={8} r={5.5} stroke="#fff" strokeWidth={1.6} />
                <Path d="M7 5v3l2 1.5M5 1h4" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
              </Svg>
              <Text style={styles.timerText}>4:00:00</Text>
            </View>
          </View>

          {/* Subject tabs */}
          <View style={styles.subjectTabs}>
            {subjectTabs.map((t, i) => (
              <View key={i} style={[styles.subjectTab, t.on && styles.subjectTabActive]}>
                <Text style={styles.subjectTabLabel}>{t.l}</Text>
                <Text style={styles.subjectTabNumber}>{t.n}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Info cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>📖</Text>
            <Text style={styles.infoValue}>5</Text>
            <Text style={styles.infoLabel}>Пән</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>❓</Text>
            <Text style={styles.infoValue}>120</Text>
            <Text style={styles.infoLabel}>Сұрақ</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>⏱️</Text>
            <Text style={styles.infoValue}>4</Text>
            <Text style={styles.infoLabel}>Сағат</Text>
          </View>
        </View>

        {/* Rules */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Ережелер</Text>
          {[
            'Әр пәннен 20–40 сұрақ беріледі',
            'Жалпы уақыт — 4 сағат',
            'Максималды балл — 140',
            'Нәтиже рейтингке қосылады',
          ].map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        {/* Recent results */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Соңғы нәтижелер</Text>
          {recentResults.map((r, i) => (
            <View key={i} style={styles.resultRow}>
              <Text style={styles.resultDate}>{r.date}</Text>
              <View style={styles.resultScoreRow}>
                <ProgressBar progress={r.score / 140} height={6} color={r.score >= 80 ? Colors.primary : Colors.accent} showShine={false} />
              </View>
              <Text style={[styles.resultScore, { color: r.score >= 80 ? Colors.good : Colors.accent }]}>
                {r.score}/140
              </Text>
            </View>
          ))}
        </View>

        <Button
          title="ҰБТ БАСТАУ 🚀"
          onPress={() => router.push('/ubt-session' as any)}
          style={styles.startBtn}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 40 },
  headerCard: {
    backgroundColor: Colors.ink,
    padding: 18,
    paddingTop: 14,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  headerInfo: { flex: 1 },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginTop: 1 },
  timerBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  subjectTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  subjectTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  subjectTabActive: {
    backgroundColor: Colors.accent,
  },
  subjectTabLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  subjectTabNumber: { fontSize: 13, fontWeight: '800', color: '#fff', marginTop: 1 },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 18,
    paddingBottom: 0,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.line,
  },
  infoEmoji: { fontSize: 24 },
  infoValue: { fontSize: 28, fontWeight: '800', color: Colors.ink },
  infoLabel: { fontSize: 12, color: Colors.ink3 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 18,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: Colors.line,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.ink, marginBottom: 12 },
  ruleRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  bullet: { color: Colors.primary, fontSize: 14 },
  ruleText: { fontSize: 14, color: Colors.ink2, flex: 1 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  resultDate: { fontSize: 14, color: Colors.ink2, width: 70 },
  resultScoreRow: { flex: 1 },
  resultScore: { fontSize: 14, fontWeight: '700', width: 55, textAlign: 'right' },
  startBtn: { marginHorizontal: 18, marginTop: 20 },
});
