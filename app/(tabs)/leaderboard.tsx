import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

interface LeaderboardRow {
  full_name: string;
  school: string;
  weekly_xp: number;
  cur_streak: number;
  is_me: boolean;
}

function getMedalEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
}

/**
 * Leaderboard screen — weekly top users from Supabase RPC.
 * Matches дизайн.html Screen 06 Leaderboard.
 */
export default function LeaderboardScreen() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .rpc('get_weekly_leaderboard', { take_count: 20 })
      .then(({ data, error }) => {
        if (error) {
          Alert.alert('Қате', 'Рейтинг жүктелмеді');
          console.error('leaderboard rpc error:', error);
        }
        if (data && !error) setRows(data as LeaderboardRow[]);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Рейтинг 🏆</Text>
          <Text style={styles.subtitle}>Апталық ең белсенді оқушылар</Text>
        </View>
        <LoadingSpinner fullScreen message="Жүктелуде..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Рейтинг 🏆</Text>
        <Text style={styles.subtitle}>Апталық ең белсенді оқушылар</Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏁</Text>
            <Text style={styles.emptyTitle}>Әлі ешкім жоқ</Text>
            <Text style={styles.emptySubtitle}>Бірінші бол!</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const rank = index + 1;
          return (
            <Card style={StyleSheet.flatten([styles.row, item.is_me ? styles.rowMe : undefined])}>
              <View style={styles.rankContainer}>
                <Text style={[styles.rank, rank <= 3 && styles.rankTop]}>
                  {getMedalEmoji(rank)}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, item.is_me && styles.nameMe]}>
                  {item.full_name}{item.is_me ? ' (сен)' : ''}
                </Text>
                {item.school ? <Text style={styles.school}>{item.school}</Text> : null}
              </View>
              <View style={styles.stats}>
                <Text style={styles.xp}>⚡ {item.weekly_xp} XP</Text>
                <Text style={styles.streak}>🔥 {item.cur_streak}</Text>
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.ink },
  subtitle: { fontSize: 14, color: Colors.ink3, marginTop: 4 },
  list: { paddingHorizontal: 20, gap: 8, paddingBottom: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
  },
  rowMe: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  rankContainer: { width: 36, alignItems: 'center' },
  rank: { fontSize: 18, fontWeight: '700', color: Colors.ink3 },
  rankTop: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.ink },
  nameMe: { color: Colors.primary },
  school: { fontSize: 12, color: Colors.ink3 },
  stats: { alignItems: 'flex-end', gap: 2 },
  xp: { fontSize: 14, fontWeight: '700', color: Colors.accent },
  streak: { fontSize: 12, color: Colors.ink3 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.ink },
  emptySubtitle: { fontSize: 14, color: Colors.ink3 },
});
