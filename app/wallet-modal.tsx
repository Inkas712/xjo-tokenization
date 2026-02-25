import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Wallet, LogOut, ChevronRight, Shield, Zap, Globe, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useWallet, WalletType } from '@/contexts/WalletContext';

const walletOptions: { type: WalletType; name: string; color: string; icon: string }[] = [
  { type: 'MetaMask', name: 'MetaMask', color: '#F6851B', icon: '🦊' },
  { type: 'WalletConnect', name: 'WalletConnect', color: '#3B99FC', icon: '🔗' },
  { type: 'Coinbase Wallet', name: 'Coinbase Wallet', color: '#0052FF', icon: '🔵' },
];

export default function WalletModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    isConnected, walletType, address, balance, connectWallet, disconnectWallet,
    walletConnectProjectId, ethUsdPrice, connectionStatus, testConnections,
  } = useWallet();

  useEffect(() => {
    if (isConnected && !connectionStatus.lastTested) {
      testConnections();
    }
  }, [isConnected, connectionStatus.lastTested, testConnections]);

  const handleConnect = useCallback((type: WalletType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    connectWallet(type);
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 300);
  }, [connectWallet]);

  const handleDisconnect = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    disconnectWallet();
    router.back();
  }, [disconnectWallet, router]);

  const handleTestConnections = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    testConnections();
  }, [testConnections]);

  const getStatusIcon = (connected: boolean | null | undefined) => {
    if (connected === null || connected === undefined) {
      return <AlertCircle size={14} color={Colors.textTertiary} />;
    }
    return connected
      ? <CheckCircle size={14} color="#22C55E" />
      : <XCircle size={14} color="#EF4444" />;
  };

  const getStatusColor = (connected: boolean | null | undefined): string => {
    if (connected === null || connected === undefined) return Colors.textTertiary;
    return connected ? '#22C55E' : '#EF4444';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{isConnected ? 'Wallet' : 'Connect Wallet'}</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {isConnected ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.connectedContent} showsVerticalScrollIndicator={false}>
          <View style={styles.walletCard}>
            <View style={styles.walletIconLarge}>
              <Wallet size={28} color={Colors.accent} />
            </View>
            <Text style={styles.connectedLabel}>Connected with</Text>
            <Text style={styles.connectedType}>{walletType}</Text>
            <View style={styles.addressBox}>
              <Text style={styles.addressText}>{address}</Text>
            </View>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceValue}>{balance} ETH</Text>
              <Text style={styles.balanceUsd}>
                ${(parseFloat(balance) * ethUsdPrice).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Shield size={18} color={Colors.accent} />
              <Text style={styles.infoText}>Secure Connection</Text>
            </View>
            <View style={styles.infoCard}>
              <Zap size={18} color={Colors.warning} />
              <Text style={styles.infoText}>Gas Optimized</Text>
            </View>
            <View style={styles.infoCard}>
              <Globe size={18} color={Colors.bid} />
              <Text style={styles.infoText}>Multi-chain</Text>
            </View>
          </View>

          <View style={styles.serviceStatus}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceTitle}>Service Status</Text>
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={handleTestConnections}
                disabled={connectionStatus.testing}
              >
                {connectionStatus.testing ? (
                  <ActivityIndicator size="small" color={Colors.accent} />
                ) : (
                  <RefreshCw size={16} color={Colors.accent} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.serviceRow}>
              {getStatusIcon(connectionStatus.alchemy?.connected)}
              <Text style={styles.serviceLabel}>Alchemy RPC</Text>
              <Text style={[styles.serviceDetail, { color: getStatusColor(connectionStatus.alchemy?.connected) }]}>
                {connectionStatus.alchemy?.connected
                  ? `Block #${connectionStatus.alchemy.blockNumber ?? '?'}`
                  : connectionStatus.alchemy?.error ?? 'Not tested'}
              </Text>
            </View>

            <View style={styles.serviceRow}>
              {getStatusIcon(connectionStatus.supabase?.connected)}
              <Text style={styles.serviceLabel}>Supabase DB</Text>
              <Text style={[styles.serviceDetail, { color: getStatusColor(connectionStatus.supabase?.connected) }]}>
                {connectionStatus.supabase?.connected
                  ? `${connectionStatus.supabase.tables?.length ?? 0} tables`
                  : connectionStatus.supabase?.error ?? 'Not tested'}
              </Text>
            </View>

            <View style={styles.serviceRow}>
              {getStatusIcon(connectionStatus.pinata?.connected)}
              <Text style={styles.serviceLabel}>Pinata IPFS</Text>
              <Text style={[styles.serviceDetail, { color: getStatusColor(connectionStatus.pinata?.connected) }]}>
                {connectionStatus.pinata?.connected
                  ? `${connectionStatus.pinata.latencyMs}ms`
                  : connectionStatus.pinata?.error ?? 'Not tested'}
              </Text>
            </View>

            <View style={styles.serviceRow}>
              {getStatusIcon(connectionStatus.walletConnect.configured)}
              <Text style={styles.serviceLabel}>WalletConnect</Text>
              <Text style={[styles.serviceDetail, { color: getStatusColor(connectionStatus.walletConnect.configured) }]}>
                {connectionStatus.walletConnect.configured ? 'Configured' : 'Not set'}
              </Text>
            </View>

            {connectionStatus.lastTested && (
              <Text style={styles.lastTested}>
                Last tested: {new Date(connectionStatus.lastTested).toLocaleTimeString()}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
            <LogOut size={18} color={Colors.error} />
            <Text style={styles.disconnectText}>Disconnect Wallet</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.optionsContent}>
          <Text style={styles.optionsSubtitle}>
            Choose your preferred wallet to connect to AssetVault
          </Text>

          {walletOptions.map(wallet => (
            <TouchableOpacity
              key={wallet.type}
              style={styles.walletOption}
              onPress={() => handleConnect(wallet.type)}
              testID={`wallet-${wallet.type}`}
            >
              <View style={[styles.walletIcon, { backgroundColor: wallet.color + '15' }]}>
                <Text style={styles.walletEmoji}>{wallet.icon}</Text>
              </View>
              <Text style={styles.walletName}>{wallet.name}</Text>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}

          <View style={styles.securityNote}>
            <Shield size={16} color={Colors.textTertiary} />
            <Text style={styles.securityText}>
              Your private keys never leave your wallet. We only request view permissions.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  walletCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  walletIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  connectedLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  connectedType: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  addressBox: {
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  addressText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: Colors.textSecondary,
  },
  balanceCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  balanceLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  balanceUsd: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  infoText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  disconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: '#FEF2F2',
  },
  disconnectText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.error,
  },
  optionsContent: {
    padding: 20,
  },
  optionsSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletEmoji: {
    fontSize: 24,
  },
  walletName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 4,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  serviceStatus: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  serviceDetail: {
    fontSize: 11,
    fontWeight: '500' as const,
    maxWidth: 150,
    textAlign: 'right' as const,
  },
  lastTested: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center' as const,
    marginTop: 4,
  },
});
