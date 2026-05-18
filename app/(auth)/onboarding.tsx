import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { SubjectCard } from '@/components/subject/SubjectCard';
import { ZerekMascot } from '@/components/ui/ZerekMascot';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/colors';
import { useProgress, MOCK_SUBJECTS } from '@/hooks/useProgress';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import type { Subject } from '@/types';

/**
 * Onboarding — subject selection screen with progress dots, mascot, 3×3 grid.
 * Matches дизайн.html Screen 01 Onboarding.
 */
export default function OnboardingScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { loadSubjects } = useProgress();
  const { user, setUser, setOnboarded } = useStore();

  useEffect(() => {
    loadSubjects().then(data => {
      setSubjects(data);
      setIsLoading(false);
    });
  }, []);

  const toggleSubject = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedIds.length < 2) {
      Alert.alert('Қате', 'Кем дегенде 2 пән таңдаңыз');
      return;
    }
    try {
      if (user?.id) {
        await supabase
          .from('user_profiles')
          .update({ selected_subjects: selectedIds })
          .eq('id', user.id);
        setUser({ ...user, selected_subjects: selectedIds });
      }
    } catch (e) {
      Alert.alert('Қате', 'Сақтау кезінде қате болды');
      console.error(e);
    }
    setOnboarded(true);
    router.replace('/(tabs)');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <LoadingSpinner fullScreen message="Пәндер жүктелуде..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress dots */}
        <View style={styles.progressDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Mascot + greeting */}
        <View style={styles.mascotRow}>
          <ZerekMascot size={64} />
          <View>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>3-қадам · 4</Text>
            </View>
            <Text style={styles.mascotGreeting}>Сәлем, мен Зерекпін!</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Қандай пәндерді{'\n'}дайындағың келеді?
        </Text>
        <Text style={styles.subtitle}>
          ҰБТ-ға арналған 3 пәнді таңда. Кейін өзгертуге болады.
        </Text>

        {/* Grid */}
        <View style={styles.grid}>
          {subjects.map(subject => (
            <View key={subject.id} style={styles.gridItem}>
              <SubjectCard
                name={subject.name_kz}
                icon={subject.icon}
                color={subject.color}
                isSelected={selectedIds.includes(subject.id)}
                onPress={() => toggleSubject(subject.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.selectedCount}>
            {selectedIds.length}/3 пән таңдалды
          </Text>
          <View style={styles.footerDots}>
            {[0, 1, 2].map(i => (
              <View
                key={i}
                style={[
                  styles.footerDot,
                  i < selectedIds.length && styles.footerDotActive,
                ]}
              />
            ))}
          </View>
        </View>
        <Button
          title="Жалғастыру →"
          onPress={handleContinue}
          disabled={selectedIds.length < 2}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 24, paddingTop: 10, paddingBottom: 20 },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 28,
  },
  dot: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.line,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  mascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 6,
  },
  stepText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.accentDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mascotGreeting: {
    fontSize: 14,
    color: Colors.ink2,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 30,
    letterSpacing: -0.4,
    marginTop: 14,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.ink2,
    lineHeight: 20,
    marginBottom: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '31%',
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 34,
    backgroundColor: Colors.bg,
    borderTopWidth: 0,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  selectedCount: {
    fontSize: 13,
    color: Colors.ink2,
    fontWeight: '700',
  },
  footerDots: {
    flexDirection: 'row',
    gap: 4,
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.line,
  },
  footerDotActive: {
    backgroundColor: Colors.primary,
  },
});
