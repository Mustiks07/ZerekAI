import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming, withDelay, runOnJS } from 'react-native-reanimated';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { QuizProgress } from '@/components/quiz/QuizProgress';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { ExplanationSheet } from '@/components/quiz/ExplanationSheet';
import { XPPopup } from '@/components/ui/XPBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Config } from '@/constants/config';
import { useQuiz } from '@/hooks/useQuiz';
import type { OptionLetter } from '@/types';

export default function QuizScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const quiz = useQuiz(topicId ?? 't1');
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Animations
  const cardOpacity = useSharedValue(1);
  const cardTranslateX = useSharedValue(0);

  useEffect(() => {
    quiz.fetchQuestions();
  }, []);

  // Auto-advance after correct answer
  useEffect(() => {
    if (quiz.isAnswered && quiz.isCorrect) {
      setShowXPPopup(true);
      const timer = setTimeout(() => {
        setShowXPPopup(false);
        if (!quiz.isLastQuestion) {
          animateToNext();
        } else {
          navigateToResult();
        }
      }, Config.AUTO_ADVANCE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [quiz.isAnswered, quiz.isCorrect]);

  // Show explanation sheet on wrong answer
  useEffect(() => {
    if (quiz.isAnswered && quiz.isCorrect === false) {
      setShowExplanation(true);
    }
  }, [quiz.isAnswered, quiz.isCorrect]);

  const animateToNext = () => {
    cardOpacity.value = withTiming(0, { duration: 200 });
    cardTranslateX.value = withSequence(
      withTiming(-50, { duration: 200 }),
      withTiming(50, { duration: 0 })
    );

    setTimeout(() => {
      quiz.nextQuestion();
      cardOpacity.value = withTiming(1, { duration: 200 });
      cardTranslateX.value = withTiming(0, { duration: 200 });
    }, 250);
  };

  const navigateToResult = () => {
    router.replace({
      pathname: '/result/[quizId]',
      params: {
        quizId: topicId ?? 'mock',
        score: String(quiz.score),
        total: String(quiz.questions.length),
        xp: String(quiz.xpEarned),
      },
    });
  };

  const handleSelectAnswer = (option: OptionLetter) => {
    quiz.selectAnswer(option);
  };

  const handleNextFromExplanation = () => {
    setShowExplanation(false);
    if (!quiz.isLastQuestion) {
      animateToNext();
    } else {
      navigateToResult();
    }
  };

  const handleTimeUp = () => {
    Alert.alert('⏱️ Уақыт бітті!', 'Тест уақыты аяқталды.', [
      { text: 'Нәтижеге өту', onPress: navigateToResult },
    ]);
  };

  const handleQuit = () => {
    Alert.alert('Шығу', 'Тестті тоқтатқыңыз келе ме?', [
      { text: 'Жоқ', style: 'cancel' },
      { text: 'Иә', onPress: () => router.back() },
    ]);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateX: cardTranslateX.value }],
  }));

  if (quiz.questions.length === 0) {
    return <LoadingSpinner fullScreen message="Сұрақтар жүктелуде..." />;
  }

  if (!quiz.currentQuestion) {
    return <LoadingSpinner fullScreen message="Нәтижеге өту..." />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Button
            title="✕"
            variant="ghost"
            fullWidth={false}
            onPress={handleQuit}
            style={styles.quitBtn}
          />
          <QuizTimer
            totalSeconds={Config.QUIZ_TIME_SECONDS}
            isRunning={!quiz.isAnswered}
            onTimeUp={handleTimeUp}
          />
        </View>

        {/* Progress */}
        <QuizProgress
          current={quiz.currentIndex + 1}
          total={quiz.questions.length}
          score={quiz.score}
        />

        {/* Question Card (animated) */}
        <Animated.View style={[styles.questionContainer, cardAnimatedStyle]}>
          <QuestionCard
            question={quiz.currentQuestion}
            questionNumber={quiz.currentIndex + 1}
            totalQuestions={quiz.questions.length}
            selectedOption={quiz.selectedOption}
            isAnswered={quiz.isAnswered}
            onSelectOption={handleSelectAnswer}
          />
        </Animated.View>

        {/* XP Popup */}
        {showXPPopup && (
          <View style={styles.xpPopupContainer}>
            <XPPopup amount={10} />
          </View>
        )}

        {/* Correct answer feedback */}
        {quiz.isAnswered && quiz.isCorrect && (
          <View style={styles.feedbackBar}>
            <Text style={styles.feedbackCorrect}>✅ Дұрыс! +10 XP</Text>
          </View>
        )}

        {/* Wrong answer — manual next button (also shown via sheet) */}
        {quiz.isAnswered && quiz.isCorrect === false && !showExplanation && (
          <Button
            title="Келесі сұрақ →"
            onPress={handleNextFromExplanation}
          />
        )}
      </View>

      {/* AI Explanation Sheet */}
      <ExplanationSheet
        isVisible={showExplanation}
        explanation={quiz.aiExplanation}
        isLoading={quiz.isLoadingAI}
        onNext={handleNextFromExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, padding: 20, gap: 16 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  questionContainer: { flex: 1 },
  xpPopupContainer: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    zIndex: 100,
  },
  feedbackBar: {
    backgroundColor: Colors.primarySoft,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  feedbackCorrect: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.good,
  },
});
