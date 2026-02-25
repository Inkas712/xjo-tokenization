import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  X,
  Gavel,
  CheckCircle,
  TrendingDown,
  ArrowRightLeft,
  Sparkles,
  Bell,
  UserPlus,
  AlertCircle,
  Settings,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';
import { mixpanel } from '@/services/mixpanel';
import { Notification } from '@/mocks/notifications';

type NotifFilter = 'all' | 'unread' | 'bids' | 'sales' | 'alerts';

const getNotifIcon = (type: Notification['type']) => {
  switch (type) {
    case 'bid': return <Gavel size={18} color={Colors.bid} />;
    case 'sold': return <CheckCircle size={18} color={Colors.success} />;
    case 'price_drop': return <TrendingDown size={18} color={Colors.error} />;
    case 'transfer': return <ArrowRightLeft size={18} color={Colors.polygon} />;
    case 'welcome': return <Sparkles size={18} color={Colors.warning} />;
    case 'outbid': return <AlertCircle size={18} color={Colors.error} />;
    case 'follow': return <UserPlus size={18} color={Colors.accent} />;
    case 'alert': return <Bell size={18} color={Colors.warning} />;
    case 'system': return <Settings size={18} color={Colors.textSecondary} />;
    default: return <Bell size={18} color={Colors.textTertiary} />;
  }
};

const getNotifBg = (type: Notification['type']) => {
  switch (type) {
    case 'bid': return '#EFF6FF';
    case 'sold': return '#ECFDF5';
    case 'price_drop': return '#FEF2F2';
    case 'transfer': return '#F3E8FF';
    case 'welcome': return '#FFFBEB';
    case 'outbid': return '#FEF2F2';
    case 'follow': return '#E8F5E2';
    case 'alert': return '#FFFBEB';
    case 'system': return '#F3F4F6';
    default: return '#F3F4F6';
  }
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useWallet();
  const [filter, setFilter] = useState<NotifFilter>('all');

  const handleMarkAllRead = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markAllRead();
  }, [markAllRead]);

  const handleClearAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearAll();
  }, [clearAll]);

  const filteredNotifs = useMemo(() => {
    switch (filter) {
      case 'unread': return notifications.filter(n => !n.read);
      case 'bids': return notifications.filter(n => n.type === 'bid' || n.type === 'outbid');
      case 'sales': return notifications.filter(n => n.type === 'sold' || n.type === 'transfer');
      case 'alerts': return notifications.filter(n => n.type === 'price_drop' || n.type === 'alert');
      default: return notifications;
    }
  }, [notifications, filter]);

  const sections = useMemo(() => {
    const groups: Record<string, Notification[]> = { today: [], week: [], earlier: [] };
    filteredNotifs.forEach(n => {
      const group = n.group || 'earlier';
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    });
    const result: { title: string; data: Notification[] }[] = [];
    if (groups.today.length > 0) result.push({ title: 'Today', data: groups.today });
    if (groups.week.length > 0) result.push({ title: 'This Week', data: groups.week });
    if (groups.earlier.length > 0) result.push({ title: 'Earlier', data: groups.earlier });
    return result;
  }, [filteredNotifs]);

  const filters: { key: NotifFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'bids', label: 'Bids' },
    { key: 'sales', label: 'Sales' },
    { key: 'alerts', label: 'Alerts' },
  ];

  const renderItem = useCallback(({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notifCard, !item.read && styles.notifCardUnread]}
      onPress={() => {
        markRead(item.id);
        mixpanel.trackNotificationOpened(item.type);
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.notifIcon, { backgroundColor: getNotifBg(item.type) }]}>
        {getNotifIcon(item.type)}
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifMessage}>{item.message}</Text>
        <Text style={styles.notifTime}>{item.timestamp}</Text>
      </View>
    </TouchableOpacity>
  ), [markRead]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleClearAll}>
              <Trash2 size={18} color={Colors.error} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <X size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark all as read ({unreadCount})</Text>
        </TouchableOpacity>
      )}

      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  headerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  markAllBtn: { marginHorizontal: 20, marginBottom: 8, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: '#E8F5E2' },
  markAllText: { fontSize: 13, fontWeight: '600', color: Colors.accent },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 8, marginLeft: 4 },
  notifCard: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  notifCardUnread: { borderColor: Colors.primaryLight, backgroundColor: '#FDFFF8' },
  notifIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1, gap: 3 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  unreadDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.accent },
  notifMessage: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  notifTime: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textTertiary },
});
