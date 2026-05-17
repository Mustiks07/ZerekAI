import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SubjectCard } from '@/components/subject/SubjectCard';
import { Colors } from '@/constants/colors';
import { useProgress, MOCK_SUBJECTS } from '@/hooks/useProgress';
import type { Subject } from '@/types';

/**
 * Subjects tab — grid of subject cards.
 * Matches дизайн.html design style.
 */
export default function SubjectsScreen() {
  const { loadSubjects } = useProgress();
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);

  useEffect(() => {
    loadSubjects().then(setSubjects);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Пәндер</Text>
        <Text style={styles.subtitle}>Оқығыңыз келген пәнді таңдаңыз</Text>
      </View>
      <FlatList
        data={subjects}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <SubjectCard
              name={item.name_kz}
              icon={item.icon}
              color={item.color}
              onPress={() => router.push(`/subject/${item.id}`)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.ink, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: Colors.ink3, marginTop: 4 },
  grid: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { gap: 10, marginBottom: 10 },
  gridItem: { flex: 1, maxWidth: '33%' },
});
