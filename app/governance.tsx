import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Vote, Check, X, Clock, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';
import { proposals as initProposals, pastProposals, Proposal } from '@/mocks/premium';

export default function GovernanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useWallet();
  const [activeProposals, setActiveProposals] = useState<Proposal[]>(initProposals);
  const [showVoteModal, setShowVoteModal] = useState<boolean>(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedVote, setSelectedVote] = useState<'for' | 'against' | 'abstain' | null>(null);
  const [timers, setTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    const initial: Record<string, number> = {};
    activeProposals.forEach(p => { initial[p.id] = p.votingEndsIn; });
    setTimers(initial);
    const interval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => { if (next[k] > 0) next[k] -= 1; });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }, []);

  const handleVote = () => {
    if (!selectedProposal || !selectedVote) return;
    setActiveProposals(prev => prev.map(p => {
      if (p.id !== selectedProposal.id) return p;
      const updated = { ...p, totalVotes: p.totalVotes + 1 };
      if (selectedVote === 'for') updated.forVotes += 1;
      else if (selectedVote === 'against') updated.againstVotes += 1;
      else updated.abstainVotes += 1;
      return updated;
    }));
    setShowVoteModal(false);
    setSelectedVote(null);
    showToast(`Vote cast: ${selectedVote} on "${selectedProposal.title}"`);
  };

  const renderProposalCard = (p: Proposal, isActive: boolean) => {
    const forPct = p.totalVotes > 0 ? (p.forVotes / p.totalVotes) * 100 : 0;
    const againstPct = p.totalVotes > 0 ? (p.againstVotes / p.totalVotes) * 100 : 0;
    const quorumPct = Math.min((p.totalVotes / p.quorumNeeded) * 100, 100);

    return (
      <View key={p.id} style={styles.proposalCard}>
        <View style={styles.proposalHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: isActive ? '#E8F5E2' : (p.status === 'passed' ? '#E8F5E2' : '#FEE2E2') }]}>
            <Text style={[styles.categoryText, { color: isActive ? Colors.accent : (p.status === 'passed' ? Colors.accent : Colors.error) }]}>
              {isActive ? p.category : (p.status === 'passed' ? 'Passed' : 'Failed')}
            </Text>
          </View>
          {isActive && timers[p.id] !== undefined && (
            <View style={styles.timerBadge}>
              <Clock size={12} color={Colors.textTertiary} />
              <Text style={styles.timerText}>{formatTime(timers[p.id] ?? 0)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.proposalTitle}>{p.title}</Text>
        <Text style={styles.proposalDesc} numberOfLines={2}>{p.description}</Text>

        <View style={styles.voteBar}>
          <View style={[styles.voteBarFor, { flex: Math.max(forPct, 1) }]} />
          <View style={[styles.voteBarAgainst, { flex: Math.max(againstPct, 1) }]} />
          <View style={[styles.voteBarAbstain, { flex: Math.max(100 - forPct - againstPct, 1) }]} />
        </View>
        <View style={styles.voteLabels}>
          <Text style={[styles.voteLabel, { color: Colors.accent }]}>For {forPct.toFixed(0)}%</Text>
          <Text style={[styles.voteLabel, { color: Colors.error }]}>Against {againstPct.toFixed(0)}%</Text>
          <Text style={[styles.voteLabel, { color: Colors.textTertiary }]}>{p.totalVotes} votes</Text>
        </View>

        <View style={styles.quorumRow}>
          <Text style={styles.quorumLabel}>Quorum: {quorumPct.toFixed(0)}%</Text>
          <View style={styles.quorumBarBg}>
            <View style={[styles.quorumBarFill, { width: `${quorumPct}%` as any }]} />
          </View>
        </View>

        {isActive && (
          <TouchableOpacity
            style={styles.voteBtn}
            onPress={() => { setSelectedProposal(p); setShowVoteModal(true); }}
          >
            <Vote size={14} color={Colors.white} />
            <Text style={styles.voteBtnText}>Cast Vote</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Governance</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Shape the Future{'\n'}of the Platform</Text>
          <View style={styles.powerCard}>
            <Text style={styles.powerLabel}>Your Voting Power</Text>
            <Text style={styles.powerValue}>24.58 tokens</Text>
            <Text style={styles.powerSub}>3 votes available</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Proposals</Text>
          {activeProposals.map(p => renderProposalCard(p, true))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Proposals</Text>
          {pastProposals.map(p => renderProposalCard(p, false))}
        </View>
      </ScrollView>

      <Modal visible={showVoteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.voteModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cast Your Vote</Text>
              <TouchableOpacity onPress={() => { setShowVoteModal(false); setSelectedVote(null); }}>
                <X size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            {selectedProposal && (
              <Text style={styles.voteProposalTitle}>{selectedProposal.title}</Text>
            )}
            <View style={styles.voteOptions}>
              {(['for', 'against', 'abstain'] as const).map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.voteOption,
                    selectedVote === opt && (opt === 'for' ? styles.voteOptionFor : opt === 'against' ? styles.voteOptionAgainst : styles.voteOptionAbstain),
                  ]}
                  onPress={() => setSelectedVote(opt)}
                >
                  {selectedVote === opt && <Check size={16} color={opt === 'for' ? Colors.accent : opt === 'against' ? Colors.error : Colors.textTertiary} />}
                  <Text style={[
                    styles.voteOptionText,
                    selectedVote === opt && { color: opt === 'for' ? Colors.accent : opt === 'against' ? Colors.error : Colors.textSecondary },
                  ]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.confirmVoteBtn, !selectedVote && { opacity: 0.5 }]}
              onPress={handleVote}
              disabled={!selectedVote}
            >
              <Text style={styles.confirmVoteText}>Confirm Vote</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  heroSection: { paddingHorizontal: 16, marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5, lineHeight: 30 },
  powerCard: { backgroundColor: Colors.accent, borderRadius: 16, padding: 18, marginTop: 14 },
  powerLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  powerValue: { fontSize: 24, fontWeight: '900', color: Colors.white, marginTop: 2 },
  powerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  proposalCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 12 },
  proposalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 11, fontWeight: '700' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerText: { fontSize: 12, fontWeight: '600', color: Colors.textTertiary },
  proposalTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  proposalDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: 14 },
  voteBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 },
  voteBarFor: { backgroundColor: Colors.accent, borderRadius: 4 },
  voteBarAgainst: { backgroundColor: Colors.error, borderRadius: 4 },
  voteBarAbstain: { backgroundColor: Colors.cardBorder, borderRadius: 4 },
  voteLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  voteLabel: { fontSize: 10, fontWeight: '600' },
  quorumRow: { marginTop: 10, gap: 4 },
  quorumLabel: { fontSize: 10, color: Colors.textTertiary },
  quorumBarBg: { height: 4, backgroundColor: Colors.cardBorder, borderRadius: 2, overflow: 'hidden' },
  quorumBarFill: { height: 4, backgroundColor: Colors.accent, borderRadius: 2 },
  voteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 12, gap: 6, marginTop: 14 },
  voteBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 30 },
  voteModal: { backgroundColor: Colors.card, borderRadius: 20, padding: 24, width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  voteProposalTitle: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 20 },
  voteOptions: { gap: 10 },
  voteOption: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 14, borderWidth: 2, borderColor: Colors.cardBorder },
  voteOptionFor: { borderColor: Colors.accent, backgroundColor: '#E8F5E2' },
  voteOptionAgainst: { borderColor: Colors.error, backgroundColor: '#FEE2E2' },
  voteOptionAbstain: { borderColor: Colors.textTertiary, backgroundColor: '#F3F4F6' },
  voteOptionText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
  confirmVoteBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  confirmVoteText: { fontSize: 16, fontWeight: '800', color: Colors.white },
});
