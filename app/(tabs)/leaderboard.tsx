import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';

interface LeaderboardEntry {
  rank: number;
  name: string;
  school: string;
  xp: number;
  streak: number;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Айдана К.', school: '№42 мектеп', xp: 2450, streak: 14 },
  { rank: 2, name: 'Ерасыл М.', school: 'НИШ Алматы', xp: 2280, streak: 12 },
  { rank: 3, name: 'Дана С.', school: '№15 мектеп', xp: 2100, streak: 10 },
  { rank: 4, name: 'Арман Б.', school: 'БИЛ Астана', xp: 1950, streak: 8 },
  { rank: 5, name: 'Камила Т.', school: '№7 мектеп', xp: 1800, streak: 7 },
  { rank: 6, name: 'Нұрсұлтан А.', school: '№28 мектеп', xp: 1650, streak: 5 },
  { rank: 7, name: 'Сен', school: '', xp: 240, streak: 5 },
  { rank: 8, name: 'Мадина О.', school: '№11 мектеп', xp: 220, streak: 3 },
];

function getMedalEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
}

export default function LeaderboardScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Рейтинг 🏆</Text>
        <Text style={styles.subtitle}>Апталық ең белсенді оқушылар</Text>
      </View>

      <FlatList
        data={MOCK_LEADERBOARD}
        keyExtractor={(item) => String(item.rank)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isMe = item.name === 'Сен';
          return (
            <Card style={StyleSheet.flatten([styles.row, isMe ? styles.rowMe : undefined])}>
              <View style={styles.rankContainer}>
                <Text style={[styles.rank, item.rank <= 3 && styles.rankTop]}>
                  {getMedalEmoji(item.rank)}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, isMe && styles.nameMe]}>
                  {item.name} {isMe ? '(сен)' : ''}
                </Text>
                {item.school ? <Text style={styles.school}>{item.school}</Text> : null}
              </View>
              <View style={styles.stats}>
                <Text style={styles.xp}>⚡ {item.xp}</Text>
                <Text style={styles.streak}>🔥 {item.streak}</Text>
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
});
