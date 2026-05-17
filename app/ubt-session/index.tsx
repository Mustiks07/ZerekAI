import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';
import { Config } from '@/constants/config';

export default function UBTSessionScreen() {
  const [started, setStarted] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(0);

  const subjects = [
    { name: 'Математикалық сауаттылық', questions: 20, icon: '🔢' },
    { name: 'Оқу сауаттылығы', questions: 20, icon: '📖' },
    { name: 'Қазақстан тарихы', questions: 20, icon: '🏛️' },
    { name: 'Математика', questions: 30, icon: '📐' },
    { name: 'Физика', questions: 30, icon: '⚛️' },
  ];

  const handleTimeUp = () => {
    Alert.alert('⏱️ Уақыт бітті!', 'ҰБТ уақыты аяқталды.', [
      { text: 'Нәтижені көру', onPress: () => router.replace('/(tabs)') },
    ]);
  };

  if (!started) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>ҰБТ Симуляция 📝</Text>
          <Text style={styles.subtitle}>Нақты емтихан форматы</Text>

          <Card style={styles.warningCard}>
            <Text style={styles.warningText}>
              ⚠️ ҰБТ басталғаннан кейін 4 сағат уақыт беріледі.
              Дайын болғаныңызға көз жеткізіңіз!
            </Text>
          </Card>

          <Text style={styles.sectionTitle}>Пәндер:</Text>
          {subjects.map((s, i) => (
            <Card key={i} style={styles.subjectRow}>
              <Text style={styles.subjectIcon}>{s.icon}</Text>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{s.name}</Text>
                <Text style={styles.subjectQuestions}>{s.questions} сұрақ</Text>
              </View>
            </Card>
          ))}

          <Button
            title="ҰБТ бастау 🚀"
            onPress={() => setStarted(true)}
            style={styles.startBtn}
          />
          <Button
            title="← Артқа"
            variant="ghost"
            onPress={() => router.back()}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <QuizTimer
            totalSeconds={Config.UBT_TIME_MINUTES * 60}
            isRunning={true}
            onTimeUp={handleTimeUp}
          />
          <Button
            title="Аяқтау"
            variant="danger"
            fullWidth={false}
            onPress={() => {
              Alert.alert('Аяқтау', 'ҰБТ-ны аяқтағыңыз келе ме?', [
                { text: 'Жоқ', style: 'cancel' },
                { text: 'Иә', onPress: () => router.replace('/(tabs)') },
              ]);
            }}
          />
        </View>

        <Card style={styles.currentSubjectCard}>
          <Text style={styles.currentSubjectIcon}>{subjects[currentSubject].icon}</Text>
          <Text style={styles.currentSubjectName}>{subjects[currentSubject].name}</Text>
          <ProgressBar progress={0.3} height={6} />
          <Text style={styles.questionCount}>Сұрақ 6/20</Text>
        </Card>

        <View style={styles.demoNotice}>
          <Card style={styles.noticeCard}>
            <Text style={styles.noticeEmoji}>🔧</Text>
            <Text style={styles.noticeText}>
              ҰБТ симуляция толық нұсқасы Supabase деректер базасы қосылғаннан кейін жұмыс істейді.
              Қазір демо режім.
            </Text>
            <Button
              title="Басты бетке оралу"
              variant="secondary"
              onPress={() => router.replace('/(tabs)')}
            />
          </Card>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 40, gap: 12 },
  container: { flex: 1, padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.ink },
  subtitle: { fontSize: 14, color: Colors.ink3, marginBottom: 8 },
  warningCard: {
    padding: 16, backgroundColor: '#FFF8E1', borderColor: Colors.warn,
    borderWidth: 1, borderRadius: 12,
  },
  warningText: { fontSize: 14, color: Colors.ink2, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.ink, marginTop: 8 },
  subjectRow: {
    flexDirection: 'row', padding: 14, alignItems: 'center', gap: 12,
  },
  subjectIcon: { fontSize: 24 },
  subjectInfo: { flex: 1, gap: 2 },
  subjectName: { fontSize: 14, fontWeight: '600', color: Colors.ink },
  subjectQuestions: { fontSize: 12, color: Colors.ink3 },
  startBtn: { marginTop: 8 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  currentSubjectCard: { padding: 20, alignItems: 'center', gap: 8 },
  currentSubjectIcon: { fontSize: 32 },
  currentSubjectName: { fontSize: 18, fontWeight: '700', color: Colors.ink },
  questionCount: { fontSize: 13, color: Colors.ink3 },
  demoNotice: { flex: 1, justifyContent: 'center' },
  noticeCard: { padding: 24, alignItems: 'center', gap: 12 },
  noticeEmoji: { fontSize: 40 },
  noticeText: { fontSize: 14, color: Colors.ink2, textAlign: 'center', lineHeight: 22 },
});
