import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Search, SlidersHorizontal, ChevronDown, X, Layers, Users as UsersIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { categories, AssetCategory, AssetStatus, Blockchain } from '@/mocks/assets';
import { collections } from '@/mocks/extended';
import { AssetCard } from '@/components/AssetCard';
import { useAssetsQuery } from '@/hooks/useAssets';

type SortOption = 'recent' | 'price_low' | 'price_high' | 'most_viewed';
type ExploreTab = 'assets' | 'collections';

const sortLabels: Record<SortOption, string> = {
  recent: 'Recently Listed',
  price_low: 'Price: Low → High',
  price_high: 'Price: High → Low',
  most_viewed: 'Most Viewed',
};

const statusOptions: AssetStatus[] = ['Buy Now', 'Auction', 'New'];
const blockchainOptions: Blockchain[] = ['Ethereum', 'Polygon'];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<SortOption>('recent');
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | 'All'>('All');
  const [selectedChain, setSelectedChain] = useState<Blockchain | 'All'>('All');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [exploreTab, setExploreTab] = useState<ExploreTab>('assets');

  const assetsQuery = useAssetsQuery();
  const allAssets = assetsQuery.data ?? [];

  const filteredAssets = useMemo(() => {
    let filtered = [...allAssets];
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'All') filtered = filtered.filter(a => a.category === selectedCategory);
    if (selectedStatus !== 'All') filtered = filtered.filter(a => a.status === selectedStatus);
    if (selectedChain !== 'All') filtered = filtered.filter(a => a.blockchain === selectedChain);
    if (priceMin) { const min = parseFloat(priceMin); if (!isNaN(min)) filtered = filtered.filter(a => a.price >= min); }
    if (priceMax) { const max = parseFloat(priceMax); if (!isNaN(max)) filtered = filtered.filter(a => a.price <= max); }
    switch (sort) {
      case 'price_low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price_high': filtered.sort((a, b) => b.price - a.price); break;
      case 'most_viewed': filtered.sort((a, b) => b.views - a.views); break;
      default: filtered.sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());
    }
    return filtered;
  }, [search, selectedCategory, selectedStatus, selectedChain, priceMin, priceMax, sort]);

  const filteredCollections = useMemo(() => {
    if (!search.trim()) return collections;
    const q = search.toLowerCase();
    return collections.filter(c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
  }, [search]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (selectedStatus !== 'All') count++;
    if (selectedChain !== 'All') count++;
    if (priceMin) count++;
    if (priceMax) count++;
    return count;
  }, [selectedCategory, selectedStatus, selectedChain, priceMin, priceMax]);

  const clearFilters = useCallback(() => {
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedChain('All');
    setPriceMin('');
    setPriceMax('');
  }, []);

  const renderAssetPair = useCallback(({ item }: { item: number }) => {
    const first = filteredAssets[item * 2];
    const second = filteredAssets[item * 2 + 1];
    return (
      <View style={styles.row}>
        {first && <AssetCard asset={first} />}
        {second ? <AssetCard asset={second} /> : <View style={{ flex: 1, margin: 6 }} />}
      </View>
    );
  }, [filteredAssets]);

  const pairCount = Math.ceil(filteredAssets.length / 2);
  const pairKeys = useMemo(() => Array.from({ length: pairCount }, (_, i) => i), [pairCount]);

  const renderHeader = useCallback(() => (
    <View>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>XJO Marketplace</Text>
        <Text style={styles.subtitle}>{exploreTab === 'assets' ? `${filteredAssets.length} assets` : `${filteredCollections.length} collections`}</Text>
      </View>

      <View style={styles.exploreTabRow}>
        <TouchableOpacity
          style={[styles.exploreTab, exploreTab === 'assets' && styles.exploreTabActive]}
          onPress={() => setExploreTab('assets')}
        >
          <Text style={[styles.exploreTabText, exploreTab === 'assets' && styles.exploreTabTextActive]}>Assets</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.exploreTab, exploreTab === 'collections' && styles.exploreTabActive]}
          onPress={() => setExploreTab('collections')}
        >
          <Layers size={14} color={exploreTab === 'collections' ? Colors.white : Colors.textSecondary} />
          <Text style={[styles.exploreTabText, exploreTab === 'collections' && styles.exploreTabTextActive]}>Collections</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput style={styles.searchInput} placeholder={exploreTab === 'assets' ? "Search marketplace..." : "Search collections..."} placeholderTextColor={Colors.textTertiary} value={search} onChangeText={setSearch} testID="explore-search" />
        </View>
        {exploreTab === 'assets' && (
          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setShowFilters(true)}
            testID="filter-btn"
          >
            <SlidersHorizontal size={18} color={activeFilterCount > 0 ? Colors.white : Colors.textPrimary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterCount}><Text style={styles.filterCountText}>{activeFilterCount}</Text></View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {exploreTab === 'assets' && (
        <>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSortDropdown(true)} testID="sort-btn">
            <Text style={styles.sortLabel}>{sortLabels[sort]}</Text>
            <ChevronDown size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFilters}>
            {(['All', ...categories] as const).map(cat => (
              <TouchableOpacity key={cat} style={[styles.chip, selectedCategory === cat && styles.chipActive]} onPress={() => setSelectedCategory(cat)}>
                <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  ), [insets.top, search, sort, selectedCategory, activeFilterCount, filteredAssets.length, filteredCollections.length, exploreTab]);

  if (exploreTab === 'collections') {
    return (
      <View style={styles.container}>
        <FlatList
          data={filteredCollections}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item: col }) => (
            <View style={styles.collectionCard}>
              <Image source={{ uri: col.cover }} style={styles.collectionCover} contentFit="cover" />
              <View style={styles.collectionInfo}>
                <View style={styles.collectionHeader}>
                  <Text style={styles.collectionName}>{col.name}</Text>
                  <View style={styles.collectionCatBadge}>
                    <Text style={styles.collectionCatText}>{col.category}</Text>
                  </View>
                </View>
                <Text style={styles.collectionDesc} numberOfLines={2}>{col.description}</Text>
                <View style={styles.collectionStats}>
                  <View style={styles.collectionStat}>
                    <Text style={styles.collectionStatValue}>{col.floorPrice} ETH</Text>
                    <Text style={styles.collectionStatLabel}>Floor</Text>
                  </View>
                  <View style={styles.collectionStatDivider} />
                  <View style={styles.collectionStat}>
                    <Text style={styles.collectionStatValue}>{col.totalVolume.toLocaleString()}</Text>
                    <Text style={styles.collectionStatLabel}>Volume</Text>
                  </View>
                  <View style={styles.collectionStatDivider} />
                  <View style={styles.collectionStat}>
                    <Text style={styles.collectionStatValue}>{col.items}</Text>
                    <Text style={styles.collectionStatLabel}>Items</Text>
                  </View>
                  <View style={styles.collectionStatDivider} />
                  <View style={styles.collectionStat}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <UsersIcon size={10} color={Colors.textTertiary} />
                      <Text style={styles.collectionStatValue}>{col.ownersCount}</Text>
                    </View>
                    <Text style={styles.collectionStatLabel}>Owners</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}><Text style={styles.emptyText}>No collections found</Text></View>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pairKeys}
        renderItem={renderAssetPair}
        keyExtractor={(item) => `explore-pair-${item}`}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No assets match your filters</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Text style={styles.clearBtnText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={showSortDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowSortDropdown(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Sort By</Text>
            {(Object.keys(sortLabels) as SortOption[]).map(key => (
              <TouchableOpacity key={key} style={[styles.dropdownItem, sort === key && styles.dropdownItemActive]} onPress={() => { setSort(key); setShowSortDropdown(false); }}>
                <Text style={[styles.dropdownItemText, sort === key && styles.dropdownItemTextActive]}>{sortLabels[key]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showFilters} transparent animationType="slide">
        <View style={styles.filterModal}>
          <View style={[styles.filterHeader, { paddingTop: insets.top + 12 }]}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}><X size={24} color={Colors.textPrimary} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.filterChips}>
              <TouchableOpacity style={[styles.chip, selectedStatus === 'All' && styles.chipActive]} onPress={() => setSelectedStatus('All')}>
                <Text style={[styles.chipText, selectedStatus === 'All' && styles.chipTextActive]}>All</Text>
              </TouchableOpacity>
              {statusOptions.map(s => (
                <TouchableOpacity key={s} style={[styles.chip, selectedStatus === s && styles.chipActive]} onPress={() => setSelectedStatus(s)}>
                  <Text style={[styles.chipText, selectedStatus === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.filterSectionTitle}>Blockchain</Text>
            <View style={styles.filterChips}>
              <TouchableOpacity style={[styles.chip, selectedChain === 'All' && styles.chipActive]} onPress={() => setSelectedChain('All')}>
                <Text style={[styles.chipText, selectedChain === 'All' && styles.chipTextActive]}>All</Text>
              </TouchableOpacity>
              {blockchainOptions.map(b => (
                <TouchableOpacity key={b} style={[styles.chip, selectedChain === b && styles.chipActive]} onPress={() => setSelectedChain(b)}>
                  <Text style={[styles.chipText, selectedChain === b && styles.chipTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.filterSectionTitle}>Price Range (ETH)</Text>
            <View style={styles.priceRow}>
              <TextInput style={styles.priceInput} placeholder="Min" placeholderTextColor={Colors.textTertiary} keyboardType="numeric" value={priceMin} onChangeText={setPriceMin} />
              <Text style={styles.priceDash}>—</Text>
              <TextInput style={styles.priceInput} placeholder="Max" placeholderTextColor={Colors.textTertiary} keyboardType="numeric" value={priceMax} onChangeText={setPriceMax} />
            </View>
          </ScrollView>
          <View style={[styles.filterFooter, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.clearFilterBtn} onPress={clearFilters}><Text style={styles.clearFilterText}>Clear All</Text></TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilters(false)}><Text style={styles.applyText}>Apply Filters</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.textTertiary, marginTop: 2 },
  exploreTabRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 8 },
  exploreTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  exploreTabActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  exploreTabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  exploreTabTextActive: { color: Colors.white },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 12 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, padding: 0 },
  filterBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  filterBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterCount: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.error, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  filterCountText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 20, marginTop: 12 },
  sortLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  quickFilters: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
  row: { flexDirection: 'row', paddingHorizontal: 10 },
  emptyState: { padding: 40, alignItems: 'center', gap: 16 },
  emptyText: { fontSize: 15, color: Colors.textTertiary },
  clearBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.accent, borderRadius: 10 },
  clearBtnText: { color: Colors.white, fontWeight: '600', fontSize: 13 },
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center' },
  dropdown: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, width: 280, gap: 4 },
  dropdownTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 },
  dropdownItemActive: { backgroundColor: '#E8F5E2' },
  dropdownItemText: { fontSize: 14, color: Colors.textSecondary },
  dropdownItemTextActive: { color: Colors.accent, fontWeight: '700' },
  filterModal: { flex: 1, backgroundColor: Colors.background },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  filterTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  filterContent: { flex: 1, padding: 20 },
  filterSectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12, marginTop: 20 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceInput: { flex: 1, backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.cardBorder },
  priceDash: { color: Colors.textTertiary, fontSize: 16 },
  filterFooter: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, gap: 12, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  clearFilterBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  clearFilterText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  applyBtn: { flex: 2, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: Colors.accent },
  applyText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  collectionCard: { backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  collectionCover: { width: '100%', height: 140 },
  collectionInfo: { padding: 16 },
  collectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  collectionName: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  collectionCatBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#E8F5E2' },
  collectionCatText: { fontSize: 10, fontWeight: '600', color: Colors.accent },
  collectionDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 6, lineHeight: 18 },
  collectionStats: { flexDirection: 'row', marginTop: 14, backgroundColor: Colors.background, borderRadius: 12, padding: 12 },
  collectionStat: { flex: 1, alignItems: 'center' },
  collectionStatValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  collectionStatLabel: { fontSize: 9, color: Colors.textTertiary, marginTop: 2 },
  collectionStatDivider: { width: 1, backgroundColor: Colors.cardBorder },
});
