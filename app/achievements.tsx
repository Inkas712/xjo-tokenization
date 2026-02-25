import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trophy, Lock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { achievements, Achievement } from '@/mocks/premium';

type AchievementCategory = 'all' | 'trading' | 'creating' | 'social' | 'platform';

const levelThresholds = [
  { name: 'Bronze', minXP: 0, color: '#CD7F32' },
  { name: 'Silver', minXP: 500, color: '#C0C0C0' },
  { name: 'Gold', minXP: 1200, color: '#FFD700' },
  { name: 'Platinum', minXP: 2500, color: '#E5E4E2' },
];

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState<AchievementCategory>('all');

  const totalXP = useMemo(() => achievements.filter(a => a.unlocked).reduce((s, a) => s + a.xp, 0), []);

  const currentLevel = useMemo(() => {
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (totalXP >= levelThresholds[i].minXP) return levelThresholds[i];
    }
    return levelThresholds[0];
  }, [totalXP]);

  const nextLevel = useMemo(() => {
    const idx = levelThresholds.findIndex(l => l.name === currentLevel.name);
    return idx < levelThresholds.length - 1 ? levelThresholds[idx + 1] : null;
  }, [currentLevel]);

  const xpProgress = useMemo(() => {
    if (!nextLevel) return 1;
    const range = nextLevel.minXP - currentLevel.minXP;
    const current = totalXP - currentLevel.minXP;
    return Math.min(current / range, 1);
  }, [totalXP, currentLevel, nextLevel]);

  const filtered = useMemo(() =>
    selectedCat === 'all' ? achievements : achievements.filter(a => a.category === selectedCat),
  [selectedCat]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const cats: { key: AchievementCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'trading', label: 'Trading' },
    { key: 'creating', label: 'Creating' },
    { key: 'social', label: 'Social' },
    { key: 'platform', label: 'Platform' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Achievements</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.xpCard}>
          <View style={styles.levelRow}>
            <View style={[styles.levelBadge, { backgroundColor: currentLevel.color }]}>
              <Trophy size={18} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.levelName}>{currentLevel.name} Level</Text>
              <Text style={styles.xpText}>{totalXP} XP{nextLevel ? ` / ${nextLevel.minXP} XP` : ' (Max)'}</Text>
            </View>
            <View style={styles.achieveCount}>
              <Text style={styles.countNum}>{unlockedCount}</Text>
              <Text style={styles.countLabel}>/{achievements.length}</Text>
            </View>
          </View>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` as any }]} />
          </View>
          <View style={styles.milestonesRow}>
            {levelThresholds.map(l => (
              <View key={l.name} style={styles.milestone}>
                <View style={[styles.milestoneDot, { backgroundColor: totalXP >= l.minXP ? l.color : Colors.cardBorder }]} />
                <Text style={[styles.milestoneName, totalXP >= l.minXP && { color: Colors.textPrimary }]}>{l.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {cats.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[styles.catChip, selectedCat === c.key && styles.catChipActive]}
              onPress={() => setSelectedCat(c.key)}
            >
              <Text style={[styles.catText, selectedCat === c.key && styles.catTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {filtered.map(a => (
            <View key={a.id} style={[styles.achieveCard, a.unlocked && styles.achieveUnlocked]}>
              <View style={styles.achieveIconBox}>
                <Text style={styles.achieveIcon}>{a.icon}</Text>
                {!a.unlocked && (
                  <View style={styles.lockOverlay}>
                    <Lock size={14} color={Colors.white} />
                  </View>
                )}
              </View>
              <Text style={[styles.achieveName, !a.unlocked && styles.lockedText]}>{a.name}</Text>
              <Text style={styles.achieveDesc}>{a.description}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min((a.progress / a.maxProgress) * 100, 100)}%` as any }]} />
              </View>
              <Text style={styles.progressText}>
                {a.progress >= a.maxProgress ? 'Completed' : `${a.progress}/${a.maxProgress}`}
              </Text>
              <View style={styles.xpBadge}>
                <Text style={styles.xpBadgeText}>+{a.xp} XP</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  xpCard: { marginHorizontal: 16, backgroundColor: Colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.cardBorder },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  levelBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  levelName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  xpText: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  achieveCount: { flexDirection: 'row', alignItems: 'baseline' },
  countNum: { fontSize: 24, fontWeight: '900', color: Colors.accent },
  countLabel: { fontSize: 14, color: Colors.textTertiary, fontWeight: '600' },
  xpBarBg: { height: 8, backgroundColor: Colors.cardBorder, borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: 8, backgroundColor: Colors.accent, borderRadius: 4 },
  milestonesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  milestone: { alignItems: 'center', gap: 4 },
  milestoneDot: { width: 10, height: 10, borderRadius: 5 },
  milestoneName: { fontSize: 10, fontWeight: '600', color: Colors.textTertiary },
  catRow: { paddingHorizontal: 16, paddingTop: 20, gap: 8, paddingBottom: 4 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  catChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  catText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  catTextActive: { color: Colors.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 16, gap: 8 },
  achieveCard: { width: '47%' as any, backgroundColor: Colors.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.cardBorder, flexGrow: 1, margin: 2, opacity: 0.6 },
  achieveUnlocked: { opacity: 1, borderColor: Colors.primaryLight, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  achieveIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8F5E2', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  achieveIcon: { fontSize: 24 },
  lockOverlay: { position: 'absolute', width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  achieveName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  lockedText: { color: Colors.textTertiary },
  achieveDesc: { fontSize: 10, color: Colors.textTertiary, marginTop: 4, lineHeight: 14 },
  progressBarBg: { height: 4, backgroundColor: Colors.cardBorder, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progressBarFill: { height: 4, backgroundColor: Colors.accent, borderRadius: 2 },
  progressText: { fontSize: 9, color: Colors.textTertiary, marginTop: 4 },
  xpBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#E8F5E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  xpBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.accent },
});
