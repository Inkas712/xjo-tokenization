import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, BadgeCheck, Upload, CheckCircle, ChevronRight, ChevronLeft, FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';

type VStep = 1 | 2 | 3;

export default function VerificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useWallet();
  const [step, setStep] = useState<VStep>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [ownershipDoc, setOwnershipDoc] = useState<boolean>(false);
  const [appraisalDoc, setAppraisalDoc] = useState<boolean>(false);
  const [assetName, setAssetName] = useState<string>('');
  const [assetDescription, setAssetDescription] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSubmitted(true);
    setSubmitting(false);
    showToast('Verification application submitted');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [showToast]);

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Verification</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.statusCenter}>
          <View style={styles.statusCircle}>
            <BadgeCheck size={48} color={Colors.verified} />
          </View>
          <Text style={styles.statusTitle}>Under Review</Text>
          <Text style={styles.statusSubtitle}>Your verification application has been submitted. Our team will review your documents within 3-5 business days.</Text>
          <View style={styles.ticketCard}>
            <Text style={styles.ticketLabel}>Reference Number</Text>
            <Text style={styles.ticketNumber}>VRF-2026-{Math.floor(Math.random() * 9000 + 1000)}</Text>
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Asset Verification</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.infoBanner}>
          <BadgeCheck size={20} color={Colors.verified} />
          <Text style={styles.infoText}>Verified assets display a blue checkmark badge, increasing trust and visibility on the marketplace.</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>

        {step === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.stepTitle}>Upload Ownership Documents</Text>
            <TouchableOpacity style={[styles.uploadCard, ownershipDoc && styles.uploadCardDone]} onPress={() => setOwnershipDoc(true)}>
              <View style={[styles.uploadIcon, ownershipDoc && { backgroundColor: '#ECFDF5' }]}>
                {ownershipDoc ? <CheckCircle size={24} color={Colors.success} /> : <Upload size={24} color={Colors.textTertiary} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadLabel}>Proof of Ownership</Text>
                <Text style={styles.uploadHint}>{ownershipDoc ? 'Document uploaded' : 'Title deed, certificate, receipt'}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.uploadCard, appraisalDoc && styles.uploadCardDone]} onPress={() => setAppraisalDoc(true)}>
              <View style={[styles.uploadIcon, appraisalDoc && { backgroundColor: '#ECFDF5' }]}>
                {appraisalDoc ? <CheckCircle size={24} color={Colors.success} /> : <FileText size={24} color={Colors.textTertiary} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadLabel}>Appraisal Document</Text>
                <Text style={styles.uploadHint}>{appraisalDoc ? 'Document uploaded' : 'Third-party valuation report'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.stepTitle}>Asset Details</Text>
            <Text style={styles.fieldLabel}>Asset Name *</Text>
            <TextInput style={styles.input} placeholder="Exact name of the asset" placeholderTextColor={Colors.textTertiary} value={assetName} onChangeText={setAssetName} />
            <Text style={styles.fieldLabel}>Description *</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Detailed description including provenance" placeholderTextColor={Colors.textTertiary} value={assetDescription} onChangeText={setAssetDescription} multiline numberOfLines={4} textAlignVertical="top" />
            <Text style={styles.fieldLabel}>Serial / Reference Number</Text>
            <TextInput style={styles.input} placeholder="e.g. GIA-12345678" placeholderTextColor={Colors.textTertiary} value={serialNumber} onChangeText={setSerialNumber} />
          </View>
        )}

        {step === 3 && !submitting && (
          <View style={styles.formSection}>
            <Text style={styles.stepTitle}>Review & Submit</Text>
            <View style={styles.reviewCard}>
              {[
                ['Ownership Proof', ownershipDoc ? 'Uploaded ✓' : 'Missing'],
                ['Appraisal', appraisalDoc ? 'Uploaded ✓' : 'Missing'],
                ['Asset Name', assetName || 'Not provided'],
                ['Serial Number', serialNumber || 'N/A'],
              ].map(([label, value]) => (
                <View key={label} style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>{label}</Text>
                  <Text style={styles.reviewValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {submitting && (
          <View style={styles.statusCenter}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.statusTitle}>Submitting...</Text>
          </View>
        )}
      </ScrollView>

      {!submitting && !submitted && (
        <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 12 }]}>
          {step > 1 && (
            <TouchableOpacity style={styles.navBackBtn} onPress={() => setStep(prev => Math.max(1, prev - 1) as VStep)}>
              <ChevronLeft size={18} color={Colors.textSecondary} />
              <Text style={styles.navBackText}>Back</Text>
            </TouchableOpacity>
          )}
          {step < 3 ? (
            <TouchableOpacity style={styles.navNextBtn} onPress={() => setStep(prev => Math.min(3, prev + 1) as VStep)}>
              <Text style={styles.navNextText}>Continue</Text>
              <ChevronRight size={18} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Submit for Verification</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  infoBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14 },
  infoText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 18 },
  progressBar: { height: 4, backgroundColor: Colors.cardBorder, borderRadius: 2, marginHorizontal: 20, marginTop: 16, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  formSection: { padding: 20 },
  stepTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16 },
  uploadCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  uploadCardDone: { borderColor: Colors.success, backgroundColor: '#FAFFF8' },
  uploadIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  uploadHint: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.cardBorder },
  textArea: { minHeight: 100, paddingTop: 14 },
  reviewCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  reviewLabel: { fontSize: 13, color: Colors.textTertiary },
  reviewValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  statusCenter: { alignItems: 'center', paddingVertical: 60, gap: 12, paddingHorizontal: 40 },
  statusCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statusTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary },
  statusSubtitle: { fontSize: 14, color: Colors.textTertiary, textAlign: 'center', lineHeight: 20 },
  ticketCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  ticketLabel: { fontSize: 11, color: Colors.textTertiary },
  ticketNumber: { fontSize: 16, fontWeight: '700', fontFamily: 'monospace', color: Colors.accent, marginTop: 4 },
  doneBtn: { paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.accent, marginTop: 16 },
  doneText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  bottomActions: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, gap: 10, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  navBackBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 4, borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  navBackText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  navNextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.accent },
  navNextText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  submitBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: Colors.accent },
  submitText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
