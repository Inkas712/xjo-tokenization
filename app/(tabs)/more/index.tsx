import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  LayoutDashboard,
  BarChart3,
  Trophy,
  Search,
  Bookmark,
  HelpCircle,
  Settings,
  ShieldCheck,
  FileText,
  BadgeCheck,
  Bell,
  Wallet,
  ChevronRight,
  Users,
  AlertTriangle,
  Crown,
  CreditCard,
  Award,
  Share2,
  Vote,
  Receipt,
  Anchor,
  Globe,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  route: string;
  color: string;
  proBadge?: boolean;
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { kycStatus, isPro } = useWallet();

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Trade & Analytics',
      items: [
        { icon: <LayoutDashboard size={20} color="#7AB648" />, label: 'Dashboard', subtitle: 'Portfolio overview & risk score', route: '/dashboard', color: '#E8F5E2' },
        { icon: <BarChart3 size={20} color="#3B82F6" />, label: 'Market Analytics', subtitle: 'Trading volume & trends', route: '/analytics', color: '#EFF6FF' },
        { icon: <Trophy size={20} color="#F59E0B" />, label: 'Leaderboard', subtitle: 'Top traders & creators', route: '/leaderboard', color: '#FFFBEB' },
        { icon: <Search size={20} color="#8B5CF6" />, label: 'Advanced Search', subtitle: 'Search assets, collections, users', route: '/search', color: '#F3E8FF' },
        { icon: <Anchor size={20} color="#0EA5E9" />, label: 'Whale Tracker', subtitle: 'Track large transactions', route: '/whales', color: '#F0F9FF', proBadge: true },
        { icon: <Receipt size={20} color="#10B981" />, label: 'Tax Report', subtitle: 'Capital gains & tax estimates', route: '/tax', color: '#ECFDF5', proBadge: true },
      ],
    },
    {
      title: 'Your Stuff',
      items: [
        { icon: <Bookmark size={20} color="#EC4899" />, label: 'Watchlist', subtitle: 'Saved assets', route: '/watchlist', color: '#FDF2F8' },
        { icon: <FileText size={20} color="#6366F1" />, label: 'Transaction History', subtitle: 'Full transaction log', route: '/transactions', color: '#EEF2FF' },
        { icon: <Bell size={20} color="#F97316" />, label: 'Notifications', subtitle: 'All alerts & updates', route: '/notifications', color: '#FFF7ED' },
        { icon: <Wallet size={20} color="#14B8A6" />, label: 'Wallet', subtitle: 'Manage wallet connection', route: '/wallet-modal', color: '#F0FDFA' },
      ],
    },
    {
      title: 'Pro & Rewards',
      items: [
        { icon: <Crown size={20} color="#FFD700" />, label: 'Pro Subscription', subtitle: isPro ? 'You are Pro!' : 'Unlock all features', route: '/pricing', color: '#FEF3C7' },
        { icon: <CreditCard size={20} color="#6366F1" />, label: 'Billing', subtitle: 'Manage plan & payments', route: '/billing', color: '#EEF2FF' },
        { icon: <Award size={20} color="#F59E0B" />, label: 'Achievements', subtitle: 'XP, badges & milestones', route: '/achievements', color: '#FFFBEB' },
        { icon: <Share2 size={20} color="#EC4899" />, label: 'Referral Program', subtitle: 'Earn from referrals', route: '/referral', color: '#FDF2F8' },
      ],
    },
    {
      title: 'Community & Governance',
      items: [
        { icon: <Vote size={20} color="#8B5CF6" />, label: 'Governance', subtitle: 'Vote on proposals', route: '/governance', color: '#F3E8FF' },
        { icon: <Users size={20} color="#F59E0B" />, label: 'Following Feed', subtitle: 'Activity from followed users', route: '/following', color: '#FFFBEB' },
      ],
    },
    {
      title: 'Verification & Security',
      items: [
        { icon: <BadgeCheck size={20} color="#3B82F6" />, label: 'Asset Verification', subtitle: 'Apply for verified badge', route: '/verification', color: '#EFF6FF' },
        { icon: <ShieldCheck size={20} color="#10B981" />, label: 'KYC Verification', subtitle: kycStatus === 'verified' ? 'Verified ✓' : kycStatus === 'pending' ? 'Under Review' : 'Complete verification', route: '/kyc', color: '#ECFDF5' },
        { icon: <AlertTriangle size={20} color="#EF4444" />, label: 'Report & Disputes', subtitle: 'Report issues or disputes', route: '/report', color: '#FEF2F2' },
      ],
    },
    {
      title: 'General',
      items: [
        { icon: <HelpCircle size={20} color="#8B5CF6" />, label: 'Help Center', subtitle: 'FAQ & support', route: '/help', color: '#F3E8FF' },
        { icon: <Settings size={20} color="#6B7280" />, label: 'Settings', subtitle: 'Profile, currency, language, display', route: '/settings', color: '#F3F4F6' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.title}>More</Text>
          <Text style={styles.subtitle}>All features & tools</Text>
        </View>

        {menuSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, index < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => router.push(item.route as any)}
                  testID={`more-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                    {item.icon}
                  </View>
                  <View style={styles.menuContent}>
                    <View style={styles.menuLabelRow}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      {item.proBadge && !isPro && (
                        <View style={styles.proBadge}>
                          <Crown size={8} color="#FFD700" />
                          <Text style={styles.proBadgeText}>PRO</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <ChevronRight size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  menuContent: {
    flex: 1,
  },
  menuLabelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  proBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 8,
    fontWeight: '800' as const,
    color: '#92400E',
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
  },
});
