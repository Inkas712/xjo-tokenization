import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, AlertTriangle, X, Check, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';

const categories = ['Fraud', 'Copyright Violation', 'Incorrect Description', 'Spam', 'Other'];

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [showCatPicker, setShowCatPicker] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const ticketNumber = '#' + Math.floor(Math.random() * 9000 + 1000);

  const handleSubmit = () => {
    if (!selectedCategory) {
      showToast('Please select a category');
      return;
    }
    if (!details.trim()) {
      showToast('Please provide details');
      return;
    }
    setSubmitted(true);
    showToast('Report submitted successfully');
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Report</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Check size={32} color={Colors.accent} />
          </View>
          <Text style={styles.successTitle}>Report Submitted</Text>
          <Text style={styles.successTicket}>Ticket {ticketNumber}</Text>
          <Text style={styles.successDesc}>We'll review your report within 48 hours and take appropriate action.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Report Issue</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.warningCard}>
          <AlertTriangle size={20} color={Colors.warning} />
          <Text style={styles.warningText}>Please provide accurate information. False reports may result in account restrictions.</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity style={styles.selectBtn} onPress={() => setShowCatPicker(true)}>
            <Text style={[styles.selectText, !selectedCategory && { color: Colors.textTertiary }]}>
              {selectedCategory || 'Select category'}
            </Text>
            <ChevronDown size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          <Text style={styles.label}>Details</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={Colors.textTertiary}
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Evidence (optional)</Text>
          <TouchableOpacity style={styles.uploadBtn}>
            <Text style={styles.uploadText}>+ Attach files</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showCatPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCatPicker(false)}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Category</Text>
            {categories.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.pickerItem, selectedCategory === c && styles.pickerItemActive]}
                onPress={() => { setSelectedCategory(c); setShowCatPicker(false); }}
              >
                <Text style={[styles.pickerText, selectedCategory === c && styles.pickerTextActive]}>{c}</Text>
                {selectedCategory === c && <Check size={16} color={Colors.accent} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  warningCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, backgroundColor: '#FEF3C7', borderRadius: 14, padding: 16, marginBottom: 20 },
  warningText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
  formSection: { paddingHorizontal: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, marginTop: 16 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  selectText: { fontSize: 14, color: Colors.textPrimary },
  textArea: { backgroundColor: Colors.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.cardBorder, minHeight: 120 },
  uploadBtn: { backgroundColor: Colors.card, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.cardBorder, borderStyle: 'dashed' },
  uploadText: { fontSize: 14, fontWeight: '600', color: Colors.accent },
  submitBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitText: { fontSize: 16, fontWeight: '800', color: Colors.white },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 30 },
  pickerModal: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, width: '100%' },
  pickerTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 },
  pickerItemActive: { backgroundColor: '#E8F5E2' },
  pickerText: { fontSize: 15, color: Colors.textSecondary },
  pickerTextActive: { color: Colors.accent, fontWeight: '600' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E2', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary },
  successTicket: { fontSize: 16, fontWeight: '600', color: Colors.accent, marginTop: 8 },
  successDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  doneBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, marginTop: 24 },
  doneBtnText: { fontSize: 16, fontWeight: '800', color: Colors.white },
});
