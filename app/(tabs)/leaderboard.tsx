import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
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

export default function LeaderboardScreen() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_weekly_leaderboard', { take_count: 20 });
      if (rpcError) throw rpcError;
      setRows((data as LeaderboardRow[]) ?? []);
    } catch (e) {
      console.warn('Leaderboard load failed:', e);
      setError('Деректер жүктелмеді');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Рейтинг 🏆</Text>
        <Text style={styles.subtitle}>Апталық ең белсенді оқушылар</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Әзірге ешкім жоқ 😴</Text>
          <Text style={styles.emptySubtext}>Бірінші болыңыз!</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
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
                    {item.full_name} {item.is_me ? '(сен)' : ''}
                  </Text>
                  {item.school ? <Text style={styles.school}>{item.school}</Text> : null}
                </View>
                <View style={styles.stats}>
                  <Text style={styles.xp}>⚡ {item.weekly_xp}</Text>
                  <Text style={styles.streak}>🔥 {item.cur_streak}</Text>
                </View>
              </Card>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.ink },
  subtitle: { fontSize: 14, color: Colors.ink3, marginTop: 4 },
  list: { paddingHorizontal: 20, gap: 8, paddingBottom: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  errorText: { fontSize: 15, color: Colors.ink2 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.ink },
  emptySubtext: { fontSize: 14, color: Colors.ink3 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowMe: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary, borderWidth: 2 },
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
});
