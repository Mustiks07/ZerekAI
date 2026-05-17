import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';

interface ExplanationSheetProps {
  isVisible: boolean;
  explanation: string | null;
  isLoading: boolean;
  videoUrl?: string | null;
  onNext: () => void;
  onClose: () => void;
}

export function ExplanationSheet({
  isVisible, explanation, isLoading, videoUrl, onNext, onClose,
}: ExplanationSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '80%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) onClose();
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🤖</Text>
          <Text style={styles.title}>AI Түсіндірме</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>AI ойлап жатыр...</Text>
            <View style={styles.skeleton}>
              <View style={[styles.skeletonLine, { width: '90%' }]} />
              <View style={[styles.skeletonLine, { width: '75%' }]} />
              <View style={[styles.skeletonLine, { width: '85%' }]} />
            </View>
          </View>
        ) : (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationText}>{explanation}</Text>
          </View>
        )}

        <View style={styles.actions}>
          {videoUrl && (
            <Button
              title="🎬 Видео түсіндірме"
              variant="secondary"
              onPress={() => {/* open video */}}
            />
          )}
          <Button
            title="Келесі сұрақ →"
            variant="primary"
            onPress={onNext}
            disabled={isLoading}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  indicator: { backgroundColor: Colors.line, width: 40 },
  content: { flex: 1, padding: 20, gap: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: { fontSize: 28 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.ink },
  loadingContainer: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { fontSize: 14, color: Colors.ink3 },
  skeleton: { width: '100%', gap: 8, marginTop: 8 },
  skeletonLine: {
    height: 12,
    backgroundColor: Colors.bgAlt,
    borderRadius: 6,
  },
  explanationContainer: {
    backgroundColor: Colors.primarySoft,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  explanationText: {
    fontSize: 15,
    color: Colors.ink,
    lineHeight: 24,
  },
  actions: { gap: 10, marginTop: 8 },
});
