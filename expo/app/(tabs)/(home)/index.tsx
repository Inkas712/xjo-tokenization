import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Search, Bell, Wallet, TrendingUp, BarChart3, Users, ChevronRight, Plug, Upload, DollarSign, ShoppingCart, Star, ChevronDown, ChevronUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { categories, AssetCategory } from '@/mocks/assets';
import { AssetCard } from '@/components/AssetCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { useWallet } from '@/contexts/WalletContext';
import { useAssetsQuery, usePlatformStats } from '@/hooks/useAssets';

const testimonials = [
  { id: 't1', name: 'Alex Morgan', role: 'Real Estate Investor', text: 'XJO made fractional property investment accessible. I now own shares in 3 premium properties.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop' },
  { id: 't2', name: 'Priya Sharma', role: 'Art Collector', text: 'The verification system gives me confidence. Every asset is authenticated and stored securely.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop' },
  { id: 't3', name: 'David Kim', role: 'Portfolio Manager', text: 'The analytics dashboard helps me track my tokenized assets portfolio performance in real time.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop' },
];

const faqPreview = [
  { id: 'fp1', q: 'What is asset tokenization?', a: 'Asset tokenization is the process of converting real-world assets into digital tokens on the blockchain, enabling fractional ownership and easy trading.' },
  { id: 'fp2', q: 'How are physical assets secured?', a: 'All physical assets are stored in bonded, insured vaults with third-party verification. Each token is backed by a real asset.' },
  { id: 'fp3', q: 'What blockchains are supported?', a: 'XJO currently supports Ethereum and Polygon networks, with plans to add more chains in the future.' },
  { id: 'fp4', q: 'Are there any fees?', a: 'A 2.5% fee is charged on sales. Gas fees vary by network. Minting on Polygon is nearly free.' },
  { id: 'fp5', q: 'Can I sell my tokens anytime?', a: 'Yes! You can list your tokens for sale on the marketplace at any time with fixed pricing or auction format.' },
  { id: 'fp6', q: 'How do royalties work?', a: 'Creators earn a percentage of every secondary sale. Set your royalty rate when minting your token.' },
];

type ViewMode = 'buyers' | 'sellers';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isConnected, address, unreadCount } = useWallet();
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'All'>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('buyers');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const assetsQuery = useAssetsQuery();
  const statsQuery = usePlatformStats();
  const allAssets = assetsQuery.data ?? [];
  const stats = statsQuery.data ?? { totalVolume: 0, assetsListed: 0, activeUsers: 0 };

  const filteredAssets = useMemo(() => {
    let filtered = allAssets;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [search, selectedCategory, allAssets]);

  const featuredAssets = useMemo(() => filteredAssets.slice(0, 8), [filteredAssets]);

  const steps = [
    { icon: <Plug size={24} color={Colors.accent} />, title: 'Connect Wallet', desc: 'Link your crypto wallet securely' },
    { icon: <Upload size={24} color={Colors.accent} />, title: 'Upload Asset', desc: 'Add details and documentation' },
    { icon: <DollarSign size={24} color={Colors.accent} />, title: 'Set Price', desc: 'Choose fixed price or auction' },
    { icon: <ShoppingCart size={24} color={Colors.accent} />, title: 'Sell', desc: 'List on the marketplace instantly' },
  ];

  const buyerBenefits = ['Fractional ownership of premium assets', 'Transparent pricing and history', 'Secure blockchain-backed transactions', 'Earn rental income & appreciation'];
  const sellerBenefits = ['Tokenize any real-world asset', 'Set custom royalties on resales', 'Reach global buyer network', 'Instant settlement to your wallet'];

  const renderHeader = useCallback(() => (
    <View>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.logo}>XJO<Text style={styles.logoAccent}> Tokenization</Text></Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/notifications' as any)} testID="notifications-btn">
            <Bell size={20} color={Colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.connectBtn, isConnected && styles.connectedBtn]}
            onPress={() => router.push('/wallet-modal' as any)}
            testID="wallet-btn"
          >
            <Wallet size={16} color={isConnected ? Colors.accent : Colors.white} />
            <Text style={[styles.connectText, isConnected && styles.connectedText]}>
              {isConnected ? address : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <LinearGradient colors={['#E8F5E2', '#F5F0E8', '#FAF7F2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroTitle}>Tokenize{'\n'}Your Assets</Text>
        <Text style={styles.heroSub}>Transform real-world assets into tradeable digital tokens on the blockchain</Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/(tabs)/create' as any)} testID="cta-tokenize">
          <Text style={styles.ctaText}>Start Tokenizing</Text>
          <ChevronRight size={18} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <TrendingUp size={18} color={Colors.accent} />
          <AnimatedCounter target={stats.totalVolume} prefix="$" style={styles.statValue} />
          <Text style={styles.statLabel}>Total Volume</Text>
        </View>
        <View style={styles.statCard}>
          <BarChart3 size={18} color={Colors.accent} />
          <AnimatedCounter target={stats.assetsListed} style={styles.statValue} />
          <Text style={styles.statLabel}>Assets Listed</Text>
        </View>
        <View style={styles.statCard}>
          <Users size={18} color={Colors.accent} />
          <AnimatedCounter target={stats.activeUsers} style={styles.statValue} />
          <Text style={styles.statLabel}>Active Users</Text>
        </View>
      </View>

      <View style={styles.howItWorks}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsRow}>
          {steps.map((s, i) => (
            <View key={i} style={styles.stepCard}>
              <View style={styles.stepIconBox}>{s.icon}</View>
              <Text style={styles.stepNumber}>{i + 1}</Text>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.benefitsSection}>
        <View style={styles.benefitsToggle}>
          <TouchableOpacity
            style={[styles.benefitTab, viewMode === 'buyers' && styles.benefitTabActive]}
            onPress={() => setViewMode('buyers')}
          >
            <Text style={[styles.benefitTabText, viewMode === 'buyers' && styles.benefitTabTextActive]}>For Buyers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.benefitTab, viewMode === 'sellers' && styles.benefitTabActive]}
            onPress={() => setViewMode('sellers')}
          >
            <Text style={[styles.benefitTabText, viewMode === 'sellers' && styles.benefitTabTextActive]}>For Sellers</Text>
          </TouchableOpacity>
        </View>
        {(viewMode === 'buyers' ? buyerBenefits : sellerBenefits).map((b, i) => (
          <View key={i} style={styles.benefitItem}>
            <View style={styles.benefitDot} />
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.textTertiary} />
        <TextInput style={styles.searchInput} placeholder="Search assets..." placeholderTextColor={Colors.textTertiary} value={search} onChangeText={setSearch} testID="search-input" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
        <TouchableOpacity style={[styles.categoryChip, selectedCategory === 'All' && styles.categoryChipActive]} onPress={() => setSelectedCategory('All')}>
          <Text style={[styles.categoryText, selectedCategory === 'All' && styles.categoryTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity key={cat} style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]} onPress={() => setSelectedCategory(cat)}>
            <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Assets</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/explore' as any)}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [insets.top, isConnected, address, unreadCount, search, selectedCategory, viewMode, router, steps]);

  const renderFooter = useCallback(() => (
    <View>
      <View style={styles.testimonialsSection}>
        <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>What Our Users Say</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.testimonialScroll}>
          {testimonials.map(t => (
            <View key={t.id} style={styles.testimonialCard}>
              <View style={styles.testimonialHeader}>
                <Image source={{ uri: t.avatar }} style={styles.testimonialAvatar} />
                <View>
                  <Text style={styles.testimonialName}>{t.name}</Text>
                  <Text style={styles.testimonialRole}>{t.role}</Text>
                </View>
              </View>
              <Text style={styles.testimonialText}>"{t.text}"</Text>
              <View style={styles.testimonialStars}>
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} color={Colors.gold} fill={Colors.gold} />)}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.partnersSection}>
        <Text style={styles.partnersTitle}>Powered By</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partnersRow}>
          {['Ethereum', 'Polygon', 'Chainlink', 'OpenZeppelin', 'IPFS'].map(p => (
            <View key={p} style={styles.partnerBadge}>
              <Text style={styles.partnerText}>{p}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.faqSection}>
        <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>FAQ</Text>
        <View style={styles.faqList}>
          {faqPreview.map(faq => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
            >
              <View style={styles.faqQuestion}>
                <Text style={styles.faqQuestionText}>{faq.q}</Text>
                {expandedFaq === faq.id ? <ChevronUp size={16} color={Colors.accent} /> : <ChevronDown size={16} color={Colors.textTertiary} />}
              </View>
              {expandedFaq === faq.id && (
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  ), [expandedFaq]);

  const renderAssetPair = useCallback(({ item }: { item: number }) => {
    const first = featuredAssets[item * 2];
    const second = featuredAssets[item * 2 + 1];
    return (
      <View style={styles.row}>
        {first && <AssetCard asset={first} />}
        {second ? <AssetCard asset={second} /> : <View style={{ flex: 1, margin: 6 }} />}
      </View>
    );
  }, [featuredAssets]);

  const pairCount = Math.ceil(featuredAssets.length / 2);
  const pairKeys = useMemo(() => Array.from({ length: pairCount }, (_, i) => i), [pairCount]);

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <FlatList
        data={pairKeys}
        renderItem={renderAssetPair}
        keyExtractor={(item) => `pair-${item}`}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}><Text style={styles.emptyText}>No assets found</Text></View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, backgroundColor: Colors.background },
  logo: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  logoAccent: { color: Colors.accent },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: Colors.error, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  connectBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.accent, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  connectedBtn: { backgroundColor: '#E8F5E2', borderWidth: 1, borderColor: Colors.primaryLight },
  connectText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  connectedText: { color: Colors.accent },
  hero: { marginHorizontal: 16, borderRadius: 20, padding: 24, marginTop: 4 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -1, lineHeight: 38 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 8, lineHeight: 20, maxWidth: 280 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accent, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, alignSelf: 'flex-start', marginTop: 20, gap: 6, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  ctaText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 20 },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: '500' },
  howItWorks: { marginTop: 28, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, marginBottom: 14 },
  stepsRow: { flexDirection: 'row', gap: 8 },
  stepCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.cardBorder },
  stepIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F5E2', alignItems: 'center', justifyContent: 'center' },
  stepNumber: { fontSize: 10, fontWeight: '800', color: Colors.accent, backgroundColor: '#E8F5E2', width: 18, height: 18, borderRadius: 9, textAlign: 'center', lineHeight: 18 },
  stepTitle: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  stepDesc: { fontSize: 9, color: Colors.textTertiary, textAlign: 'center', lineHeight: 13 },
  benefitsSection: { marginTop: 24, paddingHorizontal: 16 },
  benefitsToggle: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 14 },
  benefitTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  benefitTabActive: { backgroundColor: Colors.accent },
  benefitTabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  benefitTabTextActive: { color: Colors.white },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  benefitDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  benefitText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, marginHorizontal: 16, marginTop: 24, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, padding: 0 },
  categoriesRow: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  categoryChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  categoryText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  categoryTextActive: { color: Colors.white },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 8 },
  seeAll: { fontSize: 13, color: Colors.accent, fontWeight: '600' },
  row: { flexDirection: 'row', paddingHorizontal: 10 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: Colors.textTertiary },
  testimonialsSection: { marginTop: 28 },
  testimonialScroll: { paddingHorizontal: 16, gap: 12 },
  testimonialCard: { width: 260, backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  testimonialHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  testimonialAvatar: { width: 36, height: 36, borderRadius: 18 },
  testimonialName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  testimonialRole: { fontSize: 10, color: Colors.textTertiary },
  testimonialText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, fontStyle: 'italic' },
  testimonialStars: { flexDirection: 'row', gap: 2, marginTop: 8 },
  partnersSection: { marginTop: 24, paddingHorizontal: 16 },
  partnersTitle: { fontSize: 13, fontWeight: '600', color: Colors.textTertiary, textAlign: 'center', marginBottom: 12 },
  partnersRow: { gap: 10, justifyContent: 'center' },
  partnerBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  partnerText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  faqSection: { marginTop: 28, paddingBottom: 20 },
  faqList: { paddingHorizontal: 16, gap: 6 },
  faqItem: { backgroundColor: Colors.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  faqQuestion: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  faqQuestionText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  faqAnswer: { paddingHorizontal: 14, paddingBottom: 14, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
});
