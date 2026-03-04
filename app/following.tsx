import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';

export default function FollowingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { following } = useWallet();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Following Feed</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.feedList}>
          <View style={styles.emptyState}>
            <Users size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>{following.length > 0 ? 'No activity yet' : 'Not following anyone'}</Text>
            <Text style={styles.emptySubtitle}>Follow creators and traders to see their activity here</Text>
          </View>
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
  avatarRow: { paddingHorizontal: 16, gap: 16, paddingBottom: 16 },
  avatarItem: { alignItems: 'center', gap: 4 },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: Colors.primaryLight },
  avatarName: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, maxWidth: 60, textAlign: 'center' },
  feedList: { paddingHorizontal: 16 },
  feedItem: { flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  feedIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  feedHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  feedAvatar: { width: 20, height: 20, borderRadius: 10, marginTop: 1 },
  feedText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },
  feedTime: { fontSize: 11, color: Colors.textTertiary, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: Colors.textTertiary, textAlign: 'center' },
});
