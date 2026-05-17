import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { AnswerOption } from './AnswerOption';
import { Colors } from '@/constants/colors';
import type { Question, OptionLetter, AnswerState } from '@/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: OptionLetter | null;
  isAnswered: boolean;
  onSelectOption: (option: OptionLetter) => void;
}

export function QuestionCard({
  question, questionNumber, totalQuestions,
  selectedOption, isAnswered, onSelectOption,
}: QuestionCardProps) {
  const options: { letter: OptionLetter; text: string }[] = [
    { letter: 'A', text: question.option_a },
    { letter: 'B', text: question.option_b },
    { letter: 'C', text: question.option_c },
    { letter: 'D', text: question.option_d },
  ];

  const getState = (letter: OptionLetter): AnswerState => {
    if (!isAnswered) {
      return selectedOption === letter ? 'selected' : 'default';
    }
    if (letter === question.correct_option) return 'correct';
    if (letter === selectedOption) return 'wrong';
    return 'default';
  };

  return (
    <View style={styles.container}>
      <Card style={styles.questionCard}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {question.difficulty === 'easy' ? '🟢 Жеңіл' :
             question.difficulty === 'medium' ? '🟡 Орташа' : '🔴 Қиын'}
          </Text>
        </View>
        <Text style={styles.questionText}>{question.question_kz}</Text>
      </Card>

      <View style={styles.options}>
        {options.map((opt) => (
          <AnswerOption
            key={opt.letter}
            letter={opt.letter}
            text={opt.text}
            state={getState(opt.letter)}
            onPress={() => onSelectOption(opt.letter)}
            disabled={isAnswered}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  questionCard: { padding: 20 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.bgAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: Colors.ink2 },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.ink,
    lineHeight: 26,
  },
  options: { gap: 12 },
});
