import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnswerOption } from '@/components/quiz/AnswerOption';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';
import { useReading } from '@/hooks/useReading';
import type { OptionLetter } from '@/types';

export default function ReadingScreen() {
  const { textId } = useLocalSearchParams<{ textId: string }>();
  const reading = useReading(textId ?? 'rt1');
  const [textExpanded, setTextExpanded] = useState(true);

  const cardOpacity = useSharedValue(1);
  const cardTranslateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const handleQuit = () => {
    Alert.alert('Шығу', 'Мәтін оқуды тоқтатқыңыз келе ме?', [
      { text: 'Жоқ', style: 'cancel' },
      { text: 'Иә', onPress: () => router.back() },
    ]);
  };

  const handleSelectAnswer = (option: OptionLetter) => {
    reading.selectAnswer(option);
  };

  const handleNext = () => {
    cardOpacity.value = withTiming(0, { duration: 180 });
    cardTranslateY.value = withTiming(20, { duration: 180 });
    setTimeout(() => {
      reading.nextQuestion();
      cardTranslateY.value = withTiming(-20, { duration: 0 });
      cardOpacity.value = withTiming(1, { duration: 180 });
      cardTranslateY.value = withSpring(0, { damping: 14 });
    }, 200);
  };

  if (reading.isFinished) {
    return <ReadingResultScreen
      score={reading.score}
      total={reading.questions.length}
      title={reading.text?.title_kz ?? ''}
      onRetry={() => router.replace(`/reading/${textId ?? 'rt1'}`)}
      onDone={() => router.back()}
    />;
  }

  if (!reading.text || !reading.currentQuestion) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Мәтін табылмады.</Text>
          <Button title="Артқа" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const { text, currentQuestion, currentIndex, questions } = reading;
  const options: { letter: OptionLetter; text: string }[] = [
    { letter: 'A', text: currentQuestion.option_a },
    { letter: 'B', text: currentQuestion.option_b },
    { letter: 'C', text: currentQuestion.option_c },
    { letter: 'D', text: currentQuestion.option_d },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleQuit} style={styles.quitBtn}>
          <Text style={styles.quitText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <ProgressBar
            progress={(currentIndex + (reading.isAnswered ? 1 : 0)) / questions.length}
            height={8}
          />
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{currentIndex + 1}/{questions.length}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Text passage */}
        <Card style={styles.textCard}>
          <TouchableOpacity
            onPress={() => setTextExpanded((v) => !v)}
            style={styles.textHeader}
            activeOpacity={0.7}
          >
            <View style={styles.textHeaderLeft}>
              <View style={styles.readingBadge}>
                <Text style={styles.readingBadgeText}>📖 Мәтін</Text>
              </View>
              <Text style={styles.textTitle}>{text.title_kz}</Text>
              {text.author_kz && (
                <Text style={styles.textAuthor}>— {text.author_kz}</Text>
              )}
            </View>
            <Text style={styles.toggleIcon}>{textExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {textExpanded && (
            <Text style={styles.textBody}>{text.body_kz}</Text>
          )}
        </Card>

        {/* Question */}
        <Animated.View style={[styles.questionWrap, animatedStyle]}>
          <Card style={styles.questionCard}>
            <Text style={styles.questionLabel}>
              {currentIndex + 1}-сұрақ
            </Text>
            <Text style={styles.questionText}>
              {currentQuestion.question_kz}
            </Text>
          </Card>

          <View style={styles.options}>
            {options.map((opt) => (
              <AnswerOption
                key={opt.letter}
                letter={opt.letter}
                text={opt.text}
                state={reading.getOptionState(opt.letter)}
                onPress={() => handleSelectAnswer(opt.letter)}
                disabled={reading.isAnswered}
              />
            ))}
          </View>
        </Animated.View>

        {/* Feedback */}
        {reading.isAnswered && (
          <View style={[
            styles.feedbackBar,
            reading.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
          ]}>
            <Text style={[
              styles.feedbackText,
              { color: reading.isCorrect ? Colors.good : Colors.bad },
            ]}>
              {reading.isCorrect ? '✅ Дұрыс!' : '❌ Қате. Дұрыс жауапты мұқият оқыңыз.'}
            </Text>
          </View>
        )}

        {reading.isAnswered && (
          <Button
            title={reading.isLastQuestion ? 'Нәтижені көру 🎯' : 'Келесі сұрақ →'}
            onPress={handleNext}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Result sub-screen ───────────────────────────────────────────────

interface ReadingResultProps {
  score: number;
  total: number;
  title: string;
  onRetry: () => void;
  onDone: () => void;
}

function ReadingResultScreen({ score, total, title, onRetry, onDone }: ReadingResultProps) {
  const pct = Math.round((score / total) * 100);
  const isPass = pct >= 60;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.resultContent}>
        <View style={styles.resultEmoji}>
          <Text style={styles.resultEmojiText}>{isPass ? '🏆' : '📚'}</Text>
        </View>

        <Text style={styles.resultHeading}>
          {isPass ? 'Керемет!' : 'Тағы оқи тұр'}
        </Text>

        <Text style={styles.resultSub}>«{title}»</Text>

        <Card style={styles.resultScoreCard}>
          <Text style={styles.resultScore}>{score}/{total}</Text>
          <Text style={styles.resultScoreLabel}>дұрыс жауап</Text>
          <View style={styles.resultPctWrap}>
            <ProgressBar progress={score / total} height={12} />
          </View>
          <Text style={styles.resultPct}>{pct}%</Text>
        </Card>

        <View style={styles.resultActions}>
          <Button
            title="Қайта оқу"
            variant="secondary"
            onPress={onRetry}
          />
          <Button
            title="Тақырыпқа оралу"
            onPress={onDone}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  errorText: { fontSize: 16, color: Colors.ink2 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 12,
  },
  quitBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitText: { fontSize: 16, color: Colors.ink3, fontWeight: '700' },
  progressWrap: { flex: 1 },
  countBadge: {
    backgroundColor: Colors.bgAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  countText: { fontSize: 13, fontWeight: '700', color: Colors.ink2 },

  textCard: { padding: 16 },
  textHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  textHeaderLeft: { flex: 1, gap: 4 },
  readingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  readingBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  textTitle: { fontSize: 16, fontWeight: '800', color: Colors.ink, letterSpacing: -0.2 },
  textAuthor: { fontSize: 13, color: Colors.ink3, fontStyle: 'italic' },
  toggleIcon: { fontSize: 13, color: Colors.ink3, marginTop: 2 },
  textBody: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 24,
    color: Colors.ink2,
  },

  questionWrap: { gap: 14 },
  questionCard: { padding: 18 },
  questionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.ink3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.ink,
    lineHeight: 26,
  },
  options: { gap: 10 },

  feedbackBar: {
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  feedbackCorrect: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  feedbackWrong: {
    backgroundColor: Colors.badSoft,
    borderColor: Colors.bad,
  },
  feedbackText: { fontSize: 15, fontWeight: '700' },

  // Result screen
  resultContent: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
    paddingTop: 48,
  },
  resultEmoji: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultEmojiText: { fontSize: 48 },
  resultHeading: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  resultSub: {
    fontSize: 14,
    color: Colors.ink3,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultScoreCard: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -1,
  },
  resultScoreLabel: { fontSize: 14, color: Colors.ink3, fontWeight: '600' },
  resultPctWrap: { width: '100%', marginTop: 4 },
  resultPct: { fontSize: 16, fontWeight: '800', color: Colors.ink2 },
  resultActions: { width: '100%', gap: 10, marginTop: 8 },
});
