import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Search, Clock, X, Package, Users, Layers } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { assets as mockAssets, owners } from '@/mocks/assets';
import { collections } from '@/mocks/extended';
import { useAssetsQuery } from '@/hooks/useAssets';
import { mixpanel } from '@/services/mixpanel';

type ResultType = 'all' | 'assets' | 'collections' | 'users';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState<string>('');
  const [filter, setFilter] = useState<ResultType>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(['Penthouse', 'Gold', 'Art', 'Elena']);

  const assetsQuery = useAssetsQuery();
  const allAssets = assetsQuery.data ?? mockAssets;

  const filteredAssets = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allAssets.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.tokenId.includes(q) ||
      a.contractAddress.toLowerCase().includes(q)
    );
  }, [query, allAssets]);

  const filteredCollections = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return collections.filter(c => c.name.toLowerCase().includes(q));
  }, [query]);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return owners.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.wallet.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (text.trim().length > 2) {
      const total = filteredAssets.length + filteredCollections.length + filteredUsers.length;
      mixpanel.trackSearchPerformed(text.trim(), total);
    }
  }, [filteredAssets.length, filteredCollections.length, filteredUsers.length]);

  const selectRecent = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const removeRecent = useCallback((text: string) => {
    setRecentSearches(prev => prev.filter(s => s !== text));
  }, []);

  const hasResults = filteredAssets.length > 0 || filteredCollections.length > 0 || filteredUsers.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assets, collections, users..."
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.trim().length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {([
            { key: 'all' as ResultType, label: 'All' },
            { key: 'assets' as ResultType, label: `Assets (${filteredAssets.length})`, icon: <Package size={12} color={filter === 'assets' ? Colors.white : Colors.textSecondary} /> },
            { key: 'collections' as ResultType, label: `Collections (${filteredCollections.length})`, icon: <Layers size={12} color={filter === 'collections' ? Colors.white : Colors.textSecondary} /> },
            { key: 'users' as ResultType, label: `Users (${filteredUsers.length})`, icon: <Users size={12} color={filter === 'users' ? Colors.white : Colors.textSecondary} /> },
          ]).map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              {f.icon}
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {!query.trim() && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            {recentSearches.map(s => (
              <TouchableOpacity key={s} style={styles.recentItem} onPress={() => selectRecent(s)}>
                <Clock size={16} color={Colors.textTertiary} />
                <Text style={styles.recentText}>{s}</Text>
                <TouchableOpacity onPress={() => removeRecent(s)}>
                  <X size={14} color={Colors.textTertiary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {query.trim().length > 0 && !hasResults && (
          <View style={styles.emptyState}>
            <Search size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>Try different keywords or check your spelling</Text>
          </View>
        )}

        {(filter === 'all' || filter === 'assets') && filteredAssets.length > 0 && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Assets</Text>
            {filteredAssets.slice(0, filter === 'assets' ? 20 : 4).map(asset => (
              <TouchableOpacity
                key={asset.id}
                style={styles.resultItem}
                onPress={() => router.push(`/asset/${asset.id}` as any)}
              >
                <Image source={{ uri: asset.image }} style={styles.resultImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{asset.name}</Text>
                  <Text style={styles.resultMeta}>{asset.category} · {asset.price} ETH</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {(filter === 'all' || filter === 'collections') && filteredCollections.length > 0 && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Collections</Text>
            {filteredCollections.map(col => (
              <View key={col.id} style={styles.resultItem}>
                <Image source={{ uri: col.cover }} style={styles.resultImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{col.name}</Text>
                  <Text style={styles.resultMeta}>{col.items} items · Floor: {col.floorPrice} ETH</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {(filter === 'all' || filter === 'users') && filteredUsers.length > 0 && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Users</Text>
            {filteredUsers.map(user => (
              <View key={user.id} style={styles.resultItem}>
                <Image source={{ uri: user.avatar }} style={styles.resultAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{user.name}</Text>
                  <Text style={styles.resultMeta}>{user.wallet}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, padding: 0 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  recentSection: { padding: 20 },
  recentTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  recentText: { flex: 1, fontSize: 14, color: Colors.textSecondary },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: Colors.textTertiary },
  resultSection: { paddingHorizontal: 16, marginTop: 16 },
  resultTitle: { fontSize: 14, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  resultItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  resultImage: { width: 48, height: 48, borderRadius: 12 },
  resultAvatar: { width: 48, height: 48, borderRadius: 24 },
  resultName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  resultMeta: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
});
