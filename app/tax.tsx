import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Download, FileText, AlertTriangle, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';
import { taxRecords } from '@/mocks/premium';

type Year = '2025' | '2026';

export default function TaxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast, isPro } = useWallet();
  const [selectedYear, setSelectedYear] = useState<Year>('2026');

  const records = useMemo(() =>
    taxRecords.filter(r => r.sellDate.startsWith(selectedYear)),
  [selectedYear]);

  const totalGains = useMemo(() => records.filter(r => r.gainLoss > 0).reduce((s, r) => s + r.gainLoss, 0), [records]);
  const totalLosses = useMemo(() => records.filter(r => r.gainLoss < 0).reduce((s, r) => s + Math.abs(r.gainLoss), 0), [records]);
  const netPL = totalGains - totalLosses;
  const taxRate = 0.20;
  const estimatedTax = Math.max(netPL * taxRate, 0);

  const shortTermGains = useMemo(() => records.filter(r => r.type === 'short' && r.gainLoss > 0).reduce((s, r) => s + r.gainLoss, 0), [records]);
  const longTermGains = useMemo(() => records.filter(r => r.type === 'long' && r.gainLoss > 0).reduce((s, r) => s + r.gainLoss, 0), [records]);
  const totalPositiveGains = shortTermGains + longTermGains;

  const unrealizedLosses = 2.4;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Tax Report</Text>
          <View style={{ width: 40 }} />
        </View>

        {!isPro && (
          <View style={styles.proBanner}>
            <AlertTriangle size={16} color={Colors.warning} />
            <Text style={styles.proBannerText}>Pro feature — Upgrade for full tax reports</Text>
            <TouchableOpacity onPress={() => router.push('/pricing' as any)}>
              <Text style={styles.upgradeLink}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.yearSelector}>
          {(['2025', '2026'] as Year[]).map(y => (
            <TouchableOpacity
              key={y}
              style={[styles.yearBtn, selectedYear === y && styles.yearBtnActive]}
              onPress={() => setSelectedYear(y)}
            >
              <Text style={[styles.yearText, selectedYear === y && styles.yearTextActive]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { borderLeftColor: Colors.success }]}>
            <Text style={styles.summaryLabel}>Total Gains</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>{totalGains.toFixed(2)} ETH</Text>
            <Text style={styles.summaryUsd}>${(totalGains * 3200).toFixed(0)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: Colors.error }]}>
            <Text style={styles.summaryLabel}>Total Losses</Text>
            <Text style={[styles.summaryValue, { color: Colors.error }]}>{totalLosses.toFixed(2)} ETH</Text>
            <Text style={styles.summaryUsd}>${(totalLosses * 3200).toFixed(0)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: Colors.accent }]}>
            <Text style={styles.summaryLabel}>Net P&L</Text>
            <Text style={[styles.summaryValue, { color: netPL >= 0 ? Colors.success : Colors.error }]}>{netPL >= 0 ? '+' : ''}{netPL.toFixed(2)} ETH</Text>
            <Text style={styles.summaryUsd}>${(netPL * 3200).toFixed(0)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: Colors.warning }]}>
            <Text style={styles.summaryLabel}>Est. Tax (20%)</Text>
            <Text style={styles.summaryValue}>{estimatedTax.toFixed(2)} ETH</Text>
            <Text style={styles.summaryUsd}>${(estimatedTax * 3200).toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gains Breakdown</Text>
          <View style={styles.breakdownCard}>
            <View style={styles.donutRow}>
              <View style={styles.donutPlaceholder}>
                <View style={[styles.donutSegment, { backgroundColor: Colors.accent }]}>
                  <Text style={styles.donutText}>{totalPositiveGains > 0 ? Math.round((longTermGains / totalPositiveGains) * 100) : 0}%</Text>
                  <Text style={styles.donutSubtext}>Long</Text>
                </View>
              </View>
              <View style={styles.breakdownLegend}>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
                  <Text style={styles.legendLabel}>Long-term ({longTermGains.toFixed(2)} ETH)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.bid }]} />
                  <Text style={styles.legendLabel}>Short-term ({shortTermGains.toFixed(2)} ETH)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <View style={styles.tableCard}>
            {records.map((r, i) => (
              <View key={r.id} style={[styles.txRow, i < records.length - 1 && styles.txBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txAsset}>{r.asset}</Text>
                  <Text style={styles.txDates}>{r.buyDate} → {r.sellDate}</Text>
                </View>
                <View style={{ alignItems: 'center' as const }}>
                  <Text style={styles.txPrices}>{r.buyPrice} → {r.sellPrice}</Text>
                  <View style={[styles.typeBadge, r.type === 'long' ? styles.longBadge : styles.shortBadge]}>
                    <Text style={[styles.typeText, r.type === 'long' ? styles.longText : styles.shortText]}>
                      {r.type === 'long' ? 'Long' : 'Short'}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' as const, minWidth: 60 }}>
                  <Text style={[styles.txGain, { color: r.gainLoss >= 0 ? Colors.success : Colors.error }]}>
                    {r.gainLoss >= 0 ? '+' : ''}{r.gainLoss.toFixed(3)}
                  </Text>
                  <Text style={styles.txHolding}>{r.holdingDays}d</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tipCard}>
          <AlertTriangle size={16} color={Colors.warning} />
          <Text style={styles.tipText}>Tax optimization tip: You have ${(unrealizedLosses * 3200).toLocaleString()} in unrealized losses you could harvest before year end.</Text>
        </View>

        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportBtn} onPress={() => showToast('PDF report downloading...')}>
            <FileText size={16} color={Colors.white} />
            <Text style={styles.exportBtnText}>Export PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtnOutline} onPress={() => showToast('CSV exported!')}>
            <Download size={16} color={Colors.accent} />
            <Text style={styles.exportBtnOutlineText}>Export CSV</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>This is an estimate only. Consult a tax professional for accurate tax advice.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  proBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, marginBottom: 16 },
  proBannerText: { flex: 1, fontSize: 12, color: '#92400E', fontWeight: '500' },
  upgradeLink: { fontSize: 12, fontWeight: '700', color: Colors.accent },
  yearSelector: { flexDirection: 'row', marginHorizontal: 16, gap: 8, marginBottom: 16 },
  yearBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  yearBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  yearText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  yearTextActive: { color: Colors.white },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  summaryCard: { width: '47%' as any, backgroundColor: Colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, borderLeftWidth: 4, flexGrow: 1, margin: 2 },
  summaryLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500' },
  summaryValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  summaryUsd: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  breakdownCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.cardBorder },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  donutPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.bid, alignItems: 'center', justifyContent: 'center' },
  donutSegment: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  donutText: { fontSize: 16, fontWeight: '800', color: Colors.white },
  donutSubtext: { fontSize: 8, color: 'rgba(255,255,255,0.8)' },
  breakdownLegend: { flex: 1, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 13, color: Colors.textSecondary },
  tableCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  txBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  txAsset: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  txDates: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  txPrices: { fontSize: 11, color: Colors.textSecondary },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2 },
  longBadge: { backgroundColor: '#E8F5E2' },
  shortBadge: { backgroundColor: '#EFF6FF' },
  typeText: { fontSize: 9, fontWeight: '600' },
  longText: { color: Colors.accent },
  shortText: { color: Colors.bid },
  txGain: { fontSize: 13, fontWeight: '700' },
  txHolding: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginHorizontal: 16, marginTop: 24, backgroundColor: '#FEF3C7', borderRadius: 14, padding: 16 },
  tipText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
  exportRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 20 },
  exportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16 },
  exportBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  exportBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.card, borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: Colors.accent },
  exportBtnOutlineText: { fontSize: 14, fontWeight: '700', color: Colors.accent },
  disclaimer: { fontSize: 11, color: Colors.textTertiary, textAlign: 'center', marginTop: 16, paddingHorizontal: 32 },
});
