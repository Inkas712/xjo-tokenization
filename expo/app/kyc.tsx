import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Upload, User, FileText, Eye, ChevronRight, ChevronLeft, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';

type KycStep = 1 | 2 | 3;

export default function KycScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { kycStatus, setKycStatus, showToast } = useWallet();
  const [step, setStep] = useState<KycStep>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [fullName, setFullName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [idFront, setIdFront] = useState<boolean>(false);
  const [idBack, setIdBack] = useState<boolean>(false);
  const [selfie, setSelfie] = useState<boolean>(false);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setKycStatus('pending');
    setSubmitting(false);
    showToast('KYC application submitted');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [setKycStatus, showToast]);

  if (kycStatus === 'verified') {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>KYC Verification</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.statusCenter}>
          <View style={[styles.statusCircle, { backgroundColor: '#ECFDF5' }]}>
            <CheckCircle size={48} color={Colors.success} />
          </View>
          <Text style={styles.statusTitle}>Verified</Text>
          <Text style={styles.statusSubtitle}>Your identity has been verified. You can access all regulated assets.</Text>
        </View>
      </View>
    );
  }

  if (kycStatus === 'pending') {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>KYC Verification</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.statusCenter}>
          <View style={[styles.statusCircle, { backgroundColor: '#FFFBEB' }]}>
            <Clock size={48} color={Colors.warning} />
          </View>
          <Text style={styles.statusTitle}>Under Review</Text>
          <Text style={styles.statusSubtitle}>Your documents are being reviewed. This typically takes 24-48 hours.</Text>
          <View style={styles.progressSteps}>
            {['Submitted', 'Document Review', 'Identity Check', 'Approved'].map((s, i) => (
              <View key={s} style={styles.progressStep}>
                <View style={[styles.progressDot, i < 2 && styles.progressDotActive]} />
                <Text style={[styles.progressLabel, i < 2 && styles.progressLabelActive]}>{s}</Text>
              </View>
            ))}
          </View>
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
          <Text style={styles.title}>KYC Verification</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>

        <View style={styles.stepsRow}>
          {[1, 2, 3].map(s => (
            <View key={s} style={styles.stepIndicator}>
              <View style={[styles.stepCircle, s <= step && styles.stepCircleActive]}>
                {s < step ? <CheckCircle size={14} color={Colors.white} /> : <Text style={[styles.stepNum, s <= step && styles.stepNumActive]}>{s}</Text>}
              </View>
              <Text style={[styles.stepLabel, s <= step && styles.stepLabelActive]}>
                {s === 1 ? 'Personal' : s === 2 ? 'Documents' : 'Review'}
              </Text>
            </View>
          ))}
        </View>

        {step === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Full Name *</Text>
            <TextInput style={styles.input} placeholder="Enter your full legal name" placeholderTextColor={Colors.textTertiary} value={fullName} onChangeText={setFullName} />
            <Text style={styles.fieldLabel}>Date of Birth *</Text>
            <TextInput style={styles.input} placeholder="DD/MM/YYYY" placeholderTextColor={Colors.textTertiary} value={dob} onChangeText={setDob} />
            <Text style={styles.fieldLabel}>Country *</Text>
            <TextInput style={styles.input} placeholder="e.g. United States" placeholderTextColor={Colors.textTertiary} value={country} onChangeText={setCountry} />
            <Text style={styles.fieldLabel}>Address *</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Full residential address" placeholderTextColor={Colors.textTertiary} value={address} onChangeText={setAddress} multiline numberOfLines={3} textAlignVertical="top" />
          </View>
        )}

        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.docTitle}>Upload Documents</Text>
            <TouchableOpacity style={[styles.uploadCard, idFront && styles.uploadCardDone]} onPress={() => setIdFront(true)}>
              <View style={[styles.uploadIcon, idFront && { backgroundColor: '#ECFDF5' }]}>
                {idFront ? <CheckCircle size={24} color={Colors.success} /> : <Upload size={24} color={Colors.textTertiary} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadLabel}>ID Front</Text>
                <Text style={styles.uploadHint}>{idFront ? 'Document uploaded' : 'Passport, driver\'s license, or national ID'}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.uploadCard, idBack && styles.uploadCardDone]} onPress={() => setIdBack(true)}>
              <View style={[styles.uploadIcon, idBack && { backgroundColor: '#ECFDF5' }]}>
                {idBack ? <CheckCircle size={24} color={Colors.success} /> : <FileText size={24} color={Colors.textTertiary} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadLabel}>ID Back</Text>
                <Text style={styles.uploadHint}>{idBack ? 'Document uploaded' : 'Back side of your ID document'}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.uploadCard, selfie && styles.uploadCardDone]} onPress={() => setSelfie(true)}>
              <View style={[styles.uploadIcon, selfie && { backgroundColor: '#ECFDF5' }]}>
                {selfie ? <CheckCircle size={24} color={Colors.success} /> : <User size={24} color={Colors.textTertiary} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadLabel}>Selfie</Text>
                <Text style={styles.uploadHint}>{selfie ? 'Photo uploaded' : 'Clear photo of your face'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && !submitting && (
          <View style={styles.formSection}>
            <Text style={styles.docTitle}>Review Submission</Text>
            <View style={styles.reviewCard}>
              {[
                ['Full Name', fullName || 'Not provided'],
                ['Date of Birth', dob || 'Not provided'],
                ['Country', country || 'Not provided'],
                ['ID Front', idFront ? 'Uploaded ✓' : 'Not uploaded'],
                ['ID Back', idBack ? 'Uploaded ✓' : 'Not uploaded'],
                ['Selfie', selfie ? 'Uploaded ✓' : 'Not uploaded'],
              ].map(([label, value]) => (
                <View key={label} style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>{label}</Text>
                  <Text style={styles.reviewValue}>{value}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.reviewNote}>By submitting, you confirm all information is accurate and matches your official documents.</Text>
          </View>
        )}

        {submitting && (
          <View style={styles.statusCenter}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.statusTitle}>Submitting...</Text>
            <Text style={styles.statusSubtitle}>Uploading your documents securely</Text>
          </View>
        )}
      </ScrollView>

      {!submitting && kycStatus === 'none' && (
        <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 12 }]}>
          {step > 1 && (
            <TouchableOpacity style={styles.navBackBtn} onPress={() => setStep(prev => Math.max(1, prev - 1) as KycStep)}>
              <ChevronLeft size={18} color={Colors.textSecondary} />
              <Text style={styles.navBackText}>Back</Text>
            </TouchableOpacity>
          )}
          {step < 3 ? (
            <TouchableOpacity style={styles.navNextBtn} onPress={() => setStep(prev => Math.min(3, prev + 1) as KycStep)}>
              <Text style={styles.navNextText}>Continue</Text>
              <ChevronRight size={18} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Submit Application</Text>
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
  progressBar: { height: 4, backgroundColor: Colors.cardBorder, borderRadius: 2, marginHorizontal: 20, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 14, marginBottom: 8 },
  stepIndicator: { alignItems: 'center', gap: 6 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { backgroundColor: Colors.accent },
  stepNum: { fontSize: 12, fontWeight: '700', color: Colors.textTertiary },
  stepNumActive: { color: Colors.white },
  stepLabel: { fontSize: 11, fontWeight: '500', color: Colors.textTertiary },
  stepLabelActive: { color: Colors.accent, fontWeight: '600' },
  formSection: { padding: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.cardBorder },
  textArea: { minHeight: 80, paddingTop: 14 },
  docTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16 },
  uploadCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  uploadCardDone: { borderColor: Colors.success, backgroundColor: '#FAFFF8' },
  uploadIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  uploadHint: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  reviewCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  reviewLabel: { fontSize: 13, color: Colors.textTertiary },
  reviewValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  reviewNote: { fontSize: 12, color: Colors.textTertiary, lineHeight: 18, marginTop: 16, textAlign: 'center' },
  statusCenter: { alignItems: 'center', paddingVertical: 60, gap: 12, paddingHorizontal: 40 },
  statusCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statusTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary },
  statusSubtitle: { fontSize: 14, color: Colors.textTertiary, textAlign: 'center', lineHeight: 20 },
  progressSteps: { marginTop: 24, gap: 12, width: '100%' },
  progressStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.cardBorder },
  progressDotActive: { backgroundColor: Colors.accent },
  progressLabel: { fontSize: 13, color: Colors.textTertiary },
  progressLabelActive: { color: Colors.textPrimary, fontWeight: '600' },
  bottomActions: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, gap: 10, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  navBackBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 4, borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  navBackText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  navNextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.accent },
  navNextText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  submitBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: Colors.accent },
  submitText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
