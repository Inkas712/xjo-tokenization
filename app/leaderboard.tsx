import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, BadgeCheck, Trophy } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { leaderboardSellers, leaderboardBuyers, leaderboardCreators, LeaderboardUser } from '@/mocks/extended';

type LeaderTab = 'sellers' | 'buyers' | 'creators';
type TimePeriod = 'week' | 'month' | 'all';

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LeaderTab>('sellers');
  const [period, setPeriod] = useState<TimePeriod>('month');

  const data = useMemo(() => {
    const base = activeTab === 'sellers' ? leaderboardSellers : activeTab === 'buyers' ? leaderboardBuyers : leaderboardCreators;
    if (period === 'week') return base.map(u => ({ ...u, volume: u.volume * 0.3, transactions: Math.round(u.transactions * 0.3) }));
    if (period === 'all') return base.map(u => ({ ...u, volume: u.volume * 3.2, transactions: Math.round(u.transactions * 3.2) }));
    return base;
  }, [activeTab, period]);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return Colors.gold;
    if (rank === 2) return Colors.silver;
    if (rank === 3) return Colors.bronze;
    return 'transparent';
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Leaderboard</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tabRow}>
          {([
            { key: 'sellers' as LeaderTab, label: 'Top Sellers' },
            { key: 'buyers' as LeaderTab, label: 'Top Buyers' },
            { key: 'creators' as LeaderTab, label: 'Top Creators' },
          ]).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.periodRow}>
          {([
            { key: 'week' as TimePeriod, label: 'This Week' },
            { key: 'month' as TimePeriod, label: 'This Month' },
            { key: 'all' as TimePeriod, label: 'All Time' },
          ]).map(p => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {data.length > 2 && (
          <View style={styles.podium}>
            <View style={styles.podiumItem}>
              <Image source={{ uri: data[1].avatar }} style={styles.podiumAvatar2} />
              <View style={[styles.medalBadge, { backgroundColor: Colors.silver }]}>
                <Text style={styles.medalText}>2</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{data[1].name.split(' ')[0]}</Text>
              <Text style={styles.podiumVol}>{data[1].volume.toFixed(1)} ETH</Text>
            </View>
            <View style={[styles.podiumItem, styles.podiumFirst]}>
              <Trophy size={20} color={Colors.gold} style={{ marginBottom: 4 }} />
              <Image source={{ uri: data[0].avatar }} style={styles.podiumAvatar1} />
              <View style={[styles.medalBadge, { backgroundColor: Colors.gold }]}>
                <Text style={styles.medalText}>1</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{data[0].name.split(' ')[0]}</Text>
              <Text style={styles.podiumVol}>{data[0].volume.toFixed(1)} ETH</Text>
            </View>
            <View style={styles.podiumItem}>
              <Image source={{ uri: data[2].avatar }} style={styles.podiumAvatar3} />
              <View style={[styles.medalBadge, { backgroundColor: Colors.bronze }]}>
                <Text style={styles.medalText}>3</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{data[2].name.split(' ')[0]}</Text>
              <Text style={styles.podiumVol}>{data[2].volume.toFixed(1)} ETH</Text>
            </View>
          </View>
        )}

        <View style={styles.tableCard}>
          {data.map((user, index) => (
            <View key={user.id} style={styles.userRow}>
              <View style={[styles.rankBadge, index < 3 && { backgroundColor: getMedalColor(index + 1) + '20' }]}>
                <Text style={[styles.rankNum, index < 3 && { color: getMedalColor(index + 1), fontWeight: '800' as const }]}>{index + 1}</Text>
              </View>
              <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  {user.verified && <BadgeCheck size={14} color={Colors.verified} />}
                </View>
                <Text style={styles.userTx}>{user.transactions} transactions</Text>
              </View>
              <Text style={styles.userVolume}>{user.volume.toFixed(1)} ETH</Text>
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
  tabRow: { flexDirection: 'row', marginHorizontal: 16, gap: 6 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  tabActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  tabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  periodRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 8, justifyContent: 'center' },
  periodBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  periodBtnActive: { backgroundColor: '#E8F5E2', borderColor: Colors.primaryLight },
  periodText: { fontSize: 12, fontWeight: '600', color: Colors.textTertiary },
  periodTextActive: { color: Colors.accent },
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 32, marginTop: 24, gap: 12 },
  podiumItem: { alignItems: 'center', gap: 4 },
  podiumFirst: { marginBottom: 20 },
  podiumAvatar1: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: Colors.gold },
  podiumAvatar2: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: Colors.silver },
  podiumAvatar3: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: Colors.bronze },
  medalBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: -10 },
  medalText: { fontSize: 11, fontWeight: '800', color: Colors.white },
  podiumName: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, maxWidth: 80, textAlign: 'center' },
  podiumVol: { fontSize: 11, fontWeight: '600', color: Colors.accent },
  tableCard: { marginHorizontal: 16, marginTop: 20, backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  rankBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rankNum: { fontSize: 13, fontWeight: '600', color: Colors.textTertiary },
  userAvatar: { width: 36, height: 36, borderRadius: 18 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  userTx: { fontSize: 11, color: Colors.textTertiary },
  userVolume: { fontSize: 14, fontWeight: '700', color: Colors.accent },
});
