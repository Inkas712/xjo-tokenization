import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Tag, Sparkles, ShoppingCart, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { owners } from '@/mocks/assets';
import { useWallet } from '@/contexts/WalletContext';

const mockFeed = [
  { id: 'ff1', userId: 'u2', type: 'listed', text: 'Marcus Chen listed Digital Aurora #7 for 3.2 ETH', time: '15 min ago', icon: 'tag' },
  { id: 'ff2', userId: 'u3', type: 'minted', text: 'Aria Nakamura minted Abstract Dimension #12', time: '1 hour ago', icon: 'sparkles' },
  { id: 'ff3', userId: 'u2', type: 'sold', text: 'Marcus Chen sold Neo-Tokyo Drift #33 for 1.8 ETH', time: '3 hours ago', icon: 'sold' },
  { id: 'ff4', userId: 'u3', type: 'listed', text: 'Aria Nakamura listed Vintage Rolex Daytona Token for 45 ETH', time: '5 hours ago', icon: 'tag' },
  { id: 'ff5', userId: 'u2', type: 'minted', text: 'Marcus Chen minted Tokyo Apartment Complex token', time: '1 day ago', icon: 'sparkles' },
  { id: 'ff6', userId: 'u3', type: 'sold', text: 'Aria Nakamura sold Music Royalty: Echoes for 0.95 ETH', time: '2 days ago', icon: 'sold' },
];

export default function FollowingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { following } = useWallet();

  const followedUsers = useMemo(() => owners.filter(u => following.includes(u.id)), [following]);
  const feedItems = useMemo(() => mockFeed.filter(f => following.includes(f.userId)), [following]);

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'tag': return <Tag size={16} color={Colors.accent} />;
      case 'sparkles': return <Sparkles size={16} color={Colors.warning} />;
      case 'sold': return <CheckCircle size={16} color={Colors.success} />;
      default: return <ShoppingCart size={16} color={Colors.bid} />;
    }
  };

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

        {followedUsers.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarRow}>
            {followedUsers.map(u => (
              <View key={u.id} style={styles.avatarItem}>
                <Image source={{ uri: u.avatar }} style={styles.avatar} />
                <Text style={styles.avatarName} numberOfLines={1}>{u.name.split(' ')[0]}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.feedList}>
          {feedItems.length > 0 ? feedItems.map(item => {
            const user = owners.find(u => u.id === item.userId);
            return (
              <View key={item.id} style={styles.feedItem}>
                <View style={styles.feedIcon}>{getIcon(item.icon)}</View>
                <View style={{ flex: 1 }}>
                  <View style={styles.feedHeader}>
                    {user && <Image source={{ uri: user.avatar }} style={styles.feedAvatar} />}
                    <Text style={styles.feedText}>{item.text}</Text>
                  </View>
                  <Text style={styles.feedTime}>{item.time}</Text>
                </View>
              </View>
            );
          }) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No activity yet</Text>
              <Text style={styles.emptySubtitle}>Follow creators and traders to see their activity here</Text>
            </View>
          )}
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
