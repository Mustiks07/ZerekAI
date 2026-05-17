import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { ZerekMascot } from '@/components/ui/ZerekMascot';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';

/**
 * Paywall screen — dark bg, mascot with PRO badge,
 * comparison table, plan picker. Matches дизайн.html Screen 08 Paywall.
 * UI only, no real payment logic.
 */
export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'biannual'>('biannual');

  const features = [
    { l: 'Шектеусіз сұрақтар', free: false, prem: true },
    { l: 'Толық ҰБТ симуляциясы', free: false, prem: true },
    { l: 'Барлық пәндер ашық', free: false, prem: true },
    { l: 'Жеке қателер талдауы', free: false, prem: true },
    { l: 'AI-көмекші', free: false, prem: true },
    { l: 'Жүректер шектеусіз', free: false, prem: true },
    { l: 'Күнделікті 5 сабақ', free: true, prem: true },
  ];

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Svg width={14} height={14} viewBox="0 0 14 14">
            <Path d="M2 2l10 10M12 2L2 12" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.mascotWrap}>
              <View style={styles.proBadge}>
                <Text style={styles.proText}>PRO</Text>
              </View>
              <ZerekMascot size={96} />
            </View>
            <Text style={styles.heroTitle}>
              ҰБТ-ға толық{'\n'}
              <Text style={styles.heroGradient}>дайындал</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Шектеусіз сұрақтар, AI-көмек және{'\n'}барлық пәндер бір бағамен
            </Text>
          </View>

          {/* Comparison table */}
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <View style={styles.tableColLabel} />
              <View style={styles.tableColFree}>
                <Text style={styles.tableColTitle}>Тегін</Text>
              </View>
              <View style={styles.tableColPrem}>
                <Text style={styles.tableColTitlePrem}>Premium</Text>
              </View>
            </View>
            {/* Rows */}
            {features.map((f, i) => (
              <View key={i} style={[styles.tableRow, i < features.length - 1 && styles.tableRowBorder]}>
                <View style={styles.tableColLabel}>
                  <Text style={styles.featureText}>{f.l}</Text>
                </View>
                <View style={styles.tableColFree}>
                  {f.free ? (
                    <Svg width={18} height={18} viewBox="0 0 24 24">
                      <Path d="M4 12l5 5 11-12" stroke={Colors.ink3} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  ) : (
                    <Svg width={14} height={14} viewBox="0 0 14 14">
                      <Path d="M2 2l10 10M12 2L2 12" stroke={Colors.ink3} strokeWidth={2} strokeLinecap="round" />
                    </Svg>
                  )}
                </View>
                <View style={styles.tableColPrem}>
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    <Path d="M4 12l5 5 11-12" stroke={Colors.primary} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              </View>
            ))}
          </View>

          {/* Plan picker */}
          <View style={styles.plans}>
            {/* Monthly */}
            <TouchableOpacity
              style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.7}
            >
              <View style={[styles.planRadio, selectedPlan === 'monthly' && styles.planRadioSelected]} />
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>1 ай</Text>
                <Text style={styles.planSub}>Барлық мүмкіндіктер</Text>
              </View>
              <View style={styles.planPriceCol}>
                <Text style={styles.planPrice}>990 ₸</Text>
                <Text style={styles.planPer}>/айына</Text>
              </View>
            </TouchableOpacity>

            {/* Biannual */}
            <TouchableOpacity
              style={[styles.planCard, styles.planCardBest, selectedPlan === 'biannual' && styles.planCardSelected]}
              onPress={() => setSelectedPlan('biannual')}
              activeOpacity={0.7}
            >
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>−42% Үнемдеу</Text>
              </View>
              <View style={[styles.planRadio, selectedPlan === 'biannual' && styles.planRadioSelected]}>
                {selectedPlan === 'biannual' && (
                  <Svg width={11} height={11} viewBox="0 0 12 12">
                    <Path d="M2 6l3 3 5-6" stroke="#fff" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>6 ай · ҰБТ-ға дейін</Text>
                <Text style={styles.planSub2}>3438 ₸ үнемдейсің</Text>
              </View>
              <View style={styles.planPriceCol}>
                <Text style={styles.planOld}>5940 ₸</Text>
                <Text style={styles.planPriceBest}>2502 ₸</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* CTA */}
        <View style={styles.cta}>
          <Button title="PREMIUM-ДЫ БАСТАУ" variant="accent" onPress={() => router.back()} />
          <Text style={styles.ctaNote}>Кез келген уақытта тоқтатуға болады</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ink },
  safe: { flex: 1 },
  closeBtn: {
    position: 'absolute', top: 60, right: 20, zIndex: 10,
    width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingBottom: 20 },
  hero: { paddingTop: 20, paddingHorizontal: 24, alignItems: 'center' },
  mascotWrap: { position: 'relative', marginBottom: 14 },
  proBadge: {
    position: 'absolute', top: -2, right: -20, zIndex: 2,
    backgroundColor: Colors.accent, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, shadowColor: Colors.accentDark, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  proText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.6, textTransform: 'uppercase' },
  heroTitle: {
    fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center',
    letterSpacing: -0.4, lineHeight: 29, marginBottom: 8,
  },
  heroGradient: { color: Colors.accent },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20 },
  table: {
    backgroundColor: '#fff', borderRadius: 22, overflow: 'hidden',
    marginHorizontal: 18, marginTop: 22,
  },
  tableHeader: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  tableColLabel: { flex: 1.4 },
  tableColFree: { flex: 1, padding: 12, alignItems: 'center' },
  tableColPrem: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: `${Colors.primarySoft}80` },
  tableColTitle: { fontSize: 12, fontWeight: '800', color: Colors.ink3, textTransform: 'uppercase', letterSpacing: 0.4 },
  tableColTitlePrem: { fontSize: 12, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  tableRow: { flexDirection: 'row', alignItems: 'center', minHeight: 40 },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  featureText: { fontSize: 13, fontWeight: '600', color: Colors.ink, paddingHorizontal: 14 },
  plans: { marginHorizontal: 18, marginTop: 18, gap: 10 },
  planCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },
  planCardBest: {
    borderColor: Colors.accent, borderBottomWidth: 4, borderBottomColor: Colors.accentDark,
  },
  planCardSelected: {},
  planRadio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.ink3,
    alignItems: 'center', justifyContent: 'center',
  },
  planRadioSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  planInfo: { flex: 1 },
  planTitle: { fontSize: 14, fontWeight: '800', color: Colors.ink },
  planSub: { fontSize: 12, color: Colors.ink3, marginTop: 2 },
  planSub2: { fontSize: 12, color: Colors.primary, marginTop: 2, fontWeight: '700' },
  planPriceCol: { alignItems: 'flex-end' },
  planPrice: { fontSize: 17, fontWeight: '800', color: Colors.ink },
  planPer: { fontSize: 11, fontWeight: '700', color: Colors.ink3 },
  planOld: { fontSize: 11, fontWeight: '700', color: Colors.ink3, textDecorationLine: 'line-through' },
  planPriceBest: { fontSize: 17, fontWeight: '800', color: Colors.primary },
  saveBadge: {
    position: 'absolute', top: -10, right: 14,
    backgroundColor: Colors.accent, paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: 999,
  },
  saveText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.6, textTransform: 'uppercase' },
  cta: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 30 },
  ctaNote: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 10, fontWeight: '600' },
});
