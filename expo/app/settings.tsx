import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Bell, Shield, Palette, Check, Globe, ChevronRight, Wifi, RefreshCw, CheckCircle, XCircle, AlertCircle, Database, Cloud, Link2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';
import { Currency, Language, currencyFlags, languageNames, languageFlags } from '@/mocks/premium';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'display' | 'connections';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode, toggleDarkMode, showToast, currency, setCurrency, language, setLanguage, connectionStatus, testConnections } = useWallet();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const [username, setUsername] = useState<string>('Elena Voss');
  const [bio, setBio] = useState<string>('Digital asset collector & real estate tokenization enthusiast');
  const [twitter, setTwitter] = useState<string>('@elenav_web3');
  const [discord, setDiscord] = useState<string>('elenav#1234');

  const [notifBids, setNotifBids] = useState<boolean>(true);
  const [notifSales, setNotifSales] = useState<boolean>(true);
  const [notifPriceAlerts, setNotifPriceAlerts] = useState<boolean>(true);
  const [notifFollows, setNotifFollows] = useState<boolean>(false);
  const [notifEmail, setNotifEmail] = useState<boolean>(false);
  const [digestEnabled, setDigestEnabled] = useState<boolean>(true);
  const [digestDay, setDigestDay] = useState<string>('Monday');

  const [twoFactor, setTwoFactor] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab === 'connections' && !connectionStatus.lastTested) {
      testConnections();
    }
  }, [activeTab, connectionStatus.lastTested, testConnections]);

  const handleSave = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast('Settings saved successfully');
  }, [showToast]);

  const handleTestConnections = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    testConnections();
  }, [testConnections]);

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'Profile', icon: <User size={14} color={activeTab === 'profile' ? Colors.white : Colors.textSecondary} /> },
    { key: 'notifications', label: 'Alerts', icon: <Bell size={14} color={activeTab === 'notifications' ? Colors.white : Colors.textSecondary} /> },
    { key: 'security', label: 'Security', icon: <Shield size={14} color={activeTab === 'security' ? Colors.white : Colors.textSecondary} /> },
    { key: 'display', label: 'Display', icon: <Palette size={14} color={activeTab === 'display' ? Colors.white : Colors.textSecondary} /> },
    { key: 'connections', label: 'APIs', icon: <Wifi size={14} color={activeTab === 'connections' ? Colors.white : Colors.textSecondary} /> },
  ];

  const currencies: Currency[] = ['ETH', 'USD', 'EUR', 'BTC'];
  const languages: Language[] = ['en', 'ru', 'es', 'zh'];

  const getStatusDot = (connected: boolean | null | undefined) => {
    if (connected === null || connected === undefined) return Colors.textTertiary;
    return connected ? '#22C55E' : '#EF4444';
  };

  const getStatusLabel = (connected: boolean | null | undefined) => {
    if (connected === null || connected === undefined) return 'Not tested';
    return connected ? 'Connected' : 'Error';
  };

  const getStatusIcon = (connected: boolean | null | undefined) => {
    if (connected === null || connected === undefined) {
      return <AlertCircle size={18} color={Colors.textTertiary} />;
    }
    return connected
      ? <CheckCircle size={18} color="#22C55E" />
      : <XCircle size={18} color="#EF4444" />;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === 'profile' && (
          <View style={styles.section}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarPlaceholder}>
                <User size={32} color={Colors.textTertiary} />
              </View>
              <TouchableOpacity style={styles.changeAvatarBtn}>
                <Text style={styles.changeAvatarText}>Change Avatar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} />
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} multiline numberOfLines={3} textAlignVertical="top" />
            <Text style={styles.fieldLabel}>Twitter</Text>
            <TextInput style={styles.input} value={twitter} onChangeText={setTwitter} />
            <Text style={styles.fieldLabel}>Discord</Text>
            <TextInput style={styles.input} value={discord} onChangeText={setDiscord} />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Check size={18} color={Colors.white} />
              <Text style={styles.saveText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'notifications' && (
          <View style={styles.section}>
            <View style={styles.toggleCard}>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Bid Notifications</Text>
                  <Text style={styles.toggleDesc}>When someone bids on your assets</Text>
                </View>
                <Switch value={notifBids} onValueChange={setNotifBids} trackColor={{ true: Colors.accent, false: Colors.cardBorder }} />
              </View>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Sale Notifications</Text>
                  <Text style={styles.toggleDesc}>When your assets are sold</Text>
                </View>
                <Switch value={notifSales} onValueChange={setNotifSales} trackColor={{ true: Colors.accent, false: Colors.cardBorder }} />
              </View>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Price Alerts</Text>
                  <Text style={styles.toggleDesc}>When watched assets change price</Text>
                </View>
                <Switch value={notifPriceAlerts} onValueChange={setNotifPriceAlerts} trackColor={{ true: Colors.accent, false: Colors.cardBorder }} />
              </View>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Follow Notifications</Text>
                  <Text style={styles.toggleDesc}>When someone follows you</Text>
                </View>
                <Switch value={notifFollows} onValueChange={setNotifFollows} trackColor={{ true: Colors.accent, false: Colors.cardBorder }} />
              </View>
              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Email Notifications</Text>
                  <Text style={styles.toggleDesc}>Receive updates via email</Text>
                </View>
                <Switch value={notifEmail} onValueChange={setNotifEmail} trackColor={{ true: Colors.accent, false: Colors.cardBorder }} />
              </View>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Weekly Digest</Text>
            <View style={styles.toggleCard}>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Enable Weekly Digest</Text>
                  <Text style={styles.toggleDesc}>Portfolio summary, trending assets, news</Text>
                </View>
                <Switch value={digestEnabled} onValueChange={setDigestEnabled} trackColor={{ true: Colors.accent, false: Colors.cardBorder }} />
              </View>
              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Delivery Day</Text>
                  <Text style={styles.toggleDesc}>{digestDay}</Text>
                </View>
                <ChevronRight size={18} color={Colors.textTertiary} />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { marginTop: 12 }]}
              onPress={() => showToast('Digest sent to your email')}
            >
              <Text style={styles.saveText}>Send Me a Digest Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Check size={18} color={Colors.white} />
              <Text style={styles.saveText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'security' && (
          <View style={styles.section}>
            <View style={styles.toggleCard}>
              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Two-Factor Authentication</Text>
                  <Text style={styles.toggleDesc}>Add extra security to your account</Text>
                </View>
                <Switch value={twoFactor} onValueChange={setTwoFactor} trackColor={{ true: Colors.accent, false: Colors.cardBorder }} />
              </View>
            </View>
            <View style={styles.securityInfo}>
              <Shield size={20} color={Colors.accent} />
              <Text style={styles.securityText}>Your wallet connection is secured with end-to-end encryption. We never store your private keys.</Text>
            </View>
          </View>
        )}

        {activeTab === 'display' && (
          <View style={styles.section}>
            <View style={styles.toggleCard}>
              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Dark Mode</Text>
                  <Text style={styles.toggleDesc}>Switch to dark theme</Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={() => {
                    toggleDarkMode();
                    showToast(isDarkMode ? 'Light mode activated' : 'Dark mode activated');
                  }}
                  trackColor={{ true: Colors.accent, false: Colors.cardBorder }}
                />
              </View>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Currency</Text>
            <View style={styles.currencyGrid}>
              {currencies.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.currencyBtn, currency === c && styles.currencyBtnActive]}
                  onPress={() => { setCurrency(c); showToast(`Currency set to ${c}`); }}
                >
                  <Text style={styles.currencyFlag}>{currencyFlags[c]}</Text>
                  <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>{c}</Text>
                  {currency === c && <Check size={14} color={Colors.white} />}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Language</Text>
            <View style={styles.langGrid}>
              {languages.map(l => (
                <TouchableOpacity
                  key={l}
                  style={[styles.langBtn, language === l && styles.langBtnActive]}
                  onPress={() => { setLanguage(l); showToast(`Language set to ${languageNames[l]}`); }}
                >
                  <Text style={styles.langFlag}>{languageFlags[l]}</Text>
                  <Text style={[styles.langText, language === l && styles.langTextActive]}>{languageNames[l]}</Text>
                  {language === l && <Check size={14} color={Colors.accent} />}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.displayNote}>Theme changes will apply on next app restart for full effect.</Text>
          </View>
        )}

        {activeTab === 'connections' && (
          <View style={styles.section}>
            <View style={styles.connectionHeader}>
              <Text style={styles.connectionTitle}>API Connections</Text>
              <TouchableOpacity
                style={styles.testAllBtn}
                onPress={handleTestConnections}
                disabled={connectionStatus.testing}
              >
                {connectionStatus.testing ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <RefreshCw size={16} color={Colors.white} />
                )}
                <Text style={styles.testAllText}>
                  {connectionStatus.testing ? 'Testing...' : 'Test All'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.connectionCard}>
              <View style={styles.connectionRow}>
                <View style={styles.connectionIconWrap}>
                  <Database size={20} color={Colors.accent} />
                </View>
                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionName}>Supabase Database</Text>
                  <Text style={styles.connectionDesc}>Asset storage, bids, transactions</Text>
                </View>
                {getStatusIcon(connectionStatus.supabase?.connected)}
              </View>
              <View style={styles.connectionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[styles.detailValue, { color: getStatusDot(connectionStatus.supabase?.connected) }]}>
                    {getStatusLabel(connectionStatus.supabase?.connected)}
                  </Text>
                </View>
                {connectionStatus.supabase?.tables && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tables</Text>
                    <Text style={styles.detailValue}>{connectionStatus.supabase.tables.join(', ')}</Text>
                  </View>
                )}
                {connectionStatus.supabase?.latencyMs !== undefined && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Latency</Text>
                    <Text style={styles.detailValue}>{connectionStatus.supabase.latencyMs}ms</Text>
                  </View>
                )}
                {connectionStatus.supabase?.error && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Error</Text>
                    <Text style={[styles.detailValue, { color: '#EF4444' }]} numberOfLines={2}>{connectionStatus.supabase.error}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.connectionCard}>
              <View style={styles.connectionRow}>
                <View style={[styles.connectionIconWrap, { backgroundColor: '#EEF2FF' }]}>
                  <Globe size={20} color="#627EEA" />
                </View>
                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionName}>Alchemy RPC</Text>
                  <Text style={styles.connectionDesc}>Ethereum blockchain, balances, NFTs</Text>
                </View>
                {getStatusIcon(connectionStatus.alchemy?.connected)}
              </View>
              <View style={styles.connectionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[styles.detailValue, { color: getStatusDot(connectionStatus.alchemy?.connected) }]}>
                    {getStatusLabel(connectionStatus.alchemy?.connected)}
                  </Text>
                </View>
                {connectionStatus.alchemy?.blockNumber && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Block</Text>
                    <Text style={styles.detailValue}>#{connectionStatus.alchemy.blockNumber.toLocaleString()}</Text>
                  </View>
                )}
                {connectionStatus.alchemy?.ethPrice && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ETH Price</Text>
                    <Text style={styles.detailValue}>${connectionStatus.alchemy.ethPrice.toLocaleString()}</Text>
                  </View>
                )}
                {connectionStatus.alchemy?.latencyMs !== undefined && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Latency</Text>
                    <Text style={styles.detailValue}>{connectionStatus.alchemy.latencyMs}ms</Text>
                  </View>
                )}
                {connectionStatus.alchemy?.error && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Error</Text>
                    <Text style={[styles.detailValue, { color: '#EF4444' }]} numberOfLines={2}>{connectionStatus.alchemy.error}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.connectionCard}>
              <View style={styles.connectionRow}>
                <View style={[styles.connectionIconWrap, { backgroundColor: '#FFF7ED' }]}>
                  <Cloud size={20} color="#F59E0B" />
                </View>
                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionName}>Pinata IPFS</Text>
                  <Text style={styles.connectionDesc}>Direct file uploads, metadata storage</Text>
                </View>
                {getStatusIcon(connectionStatus.pinata?.connected)}
              </View>
              <View style={styles.connectionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[styles.detailValue, { color: getStatusDot(connectionStatus.pinata?.connected) }]}>
                    {getStatusLabel(connectionStatus.pinata?.connected)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>API</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>Pinata v3 Direct</Text>
                </View>
                {connectionStatus.pinata?.latencyMs !== undefined && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Latency</Text>
                    <Text style={styles.detailValue}>{connectionStatus.pinata.latencyMs}ms</Text>
                  </View>
                )}
                {connectionStatus.pinata?.error && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Error</Text>
                    <Text style={[styles.detailValue, { color: '#EF4444' }]} numberOfLines={2}>{connectionStatus.pinata.error}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.connectionCard}>
              <View style={styles.connectionRow}>
                <View style={[styles.connectionIconWrap, { backgroundColor: '#EFF6FF' }]}>
                  <Link2 size={20} color="#3B99FC" />
                </View>
                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionName}>WalletConnect</Text>
                  <Text style={styles.connectionDesc}>Wallet connection protocol</Text>
                </View>
                {getStatusIcon(connectionStatus.walletConnect.configured)}
              </View>
              <View style={styles.connectionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[styles.detailValue, { color: getStatusDot(connectionStatus.walletConnect.configured) }]}>
                    {connectionStatus.walletConnect.configured ? 'Configured' : 'Not configured'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Project ID</Text>
                  <Text style={styles.detailValue}>
                    {connectionStatus.walletConnect.configured ? 'Set' : 'Missing'}
                  </Text>
                </View>
              </View>
            </View>

            {connectionStatus.lastTested && (
              <Text style={styles.lastTestedText}>
                Last tested: {new Date(connectionStatus.lastTested).toLocaleString()}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800' as const, color: Colors.textPrimary, textAlign: 'center' as const },
  tabRow: { paddingHorizontal: 16, gap: 6, paddingBottom: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  tabActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  tabText: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  section: { padding: 16, marginTop: 8 },
  avatarSection: { alignItems: 'center', marginBottom: 16 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.cardBorder },
  changeAvatarBtn: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E8F5E2' },
  changeAvatarText: { fontSize: 12, fontWeight: '600' as const, color: Colors.accent },
  fieldLabel: { fontSize: 13, fontWeight: '700' as const, color: Colors.textPrimary, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.cardBorder },
  textArea: { minHeight: 80, paddingTop: 14 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.accent, marginTop: 24 },
  saveText: { fontSize: 14, fontWeight: '700' as const, color: Colors.white },
  toggleCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  toggleLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.textPrimary },
  toggleDesc: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  securityInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, backgroundColor: '#E8F5E2', borderRadius: 12, padding: 16 },
  securityText: { flex: 1, fontSize: 13, color: Colors.accentDark, lineHeight: 18 },
  displayNote: { fontSize: 12, color: Colors.textTertiary, marginTop: 12, textAlign: 'center' as const },
  currencyGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  currencyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  currencyBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  currencyFlag: { fontSize: 16 },
  currencyText: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary },
  currencyTextActive: { color: Colors.white },
  langGrid: { gap: 8 },
  langBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  langBtnActive: { borderColor: Colors.accent, backgroundColor: '#E8F5E2' },
  langFlag: { fontSize: 18 },
  langText: { flex: 1, fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary },
  langTextActive: { color: Colors.accent },
  connectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  connectionTitle: { fontSize: 18, fontWeight: '800' as const, color: Colors.textPrimary },
  testAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.accent },
  testAllText: { fontSize: 13, fontWeight: '600' as const, color: Colors.white },
  connectionCard: { backgroundColor: Colors.card, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden' },
  connectionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  connectionIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E8F5E2', alignItems: 'center', justifyContent: 'center' },
  connectionInfo: { flex: 1 },
  connectionName: { fontSize: 15, fontWeight: '700' as const, color: Colors.textPrimary },
  connectionDesc: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  connectionDetails: { borderTopWidth: 1, borderTopColor: Colors.cardBorder, paddingHorizontal: 16, paddingVertical: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  detailLabel: { fontSize: 12, color: Colors.textTertiary },
  detailValue: { fontSize: 12, fontWeight: '600' as const, color: Colors.textPrimary, maxWidth: '60%', textAlign: 'right' as const },
  lastTestedText: { fontSize: 11, color: Colors.textTertiary, textAlign: 'center' as const, marginTop: 8 },
});
