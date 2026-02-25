import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, MessageCircle, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { faqItems } from '@/mocks/extended';
import { useWallet } from '@/contexts/WalletContext';

const faqCategories = ['All', 'Getting Started', 'Buying', 'Selling', 'Wallet', 'Fees', 'Security'];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useWallet();
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');

  const filteredFaqs = useMemo(() => {
    let filtered = faqItems;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(f => f.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    }
    return filtered;
  }, [search, selectedCategory]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const handleHelpful = useCallback((helpful: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast(helpful ? 'Thanks for the feedback!' : 'We\'ll improve this answer');
  }, [showToast]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Help Center</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help articles..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {faqCategories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.faqList}>
          {filteredFaqs.map(faq => (
            <View key={faq.id} style={styles.faqCard}>
              <TouchableOpacity style={styles.faqQuestion} onPress={() => toggleExpand(faq.id)}>
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                {expandedId === faq.id ? (
                  <ChevronUp size={18} color={Colors.accent} />
                ) : (
                  <ChevronDown size={18} color={Colors.textTertiary} />
                )}
              </TouchableOpacity>
              {expandedId === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  <View style={styles.helpfulRow}>
                    <Text style={styles.helpfulLabel}>Was this helpful?</Text>
                    <TouchableOpacity style={styles.helpfulBtn} onPress={() => handleHelpful(true)}>
                      <ThumbsUp size={14} color={Colors.success} />
                      <Text style={[styles.helpfulBtnText, { color: Colors.success }]}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.helpfulBtn} onPress={() => handleHelpful(false)}>
                      <ThumbsDown size={14} color={Colors.error} />
                      <Text style={[styles.helpfulBtnText, { color: Colors.error }]}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
          {filteredFaqs.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No matching questions found</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.contactBtn} onPress={() => setShowChat(true)}>
          <MessageCircle size={20} color={Colors.white} />
          <Text style={styles.contactText}>Contact Support</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showChat} transparent animationType="slide">
        <View style={styles.chatModal}>
          <View style={[styles.chatHeader, { paddingTop: insets.top + 12 }]}>
            <Text style={styles.chatTitle}>Support Chat</Text>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.chatContent}>
            <View style={styles.chatBubbleBot}>
              <Text style={styles.chatBubbleText}>Hi! How can we help you today? Our team typically responds within 2 hours.</Text>
            </View>
          </ScrollView>
          <View style={[styles.chatInputRow, { paddingBottom: insets.bottom + 12 }]}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type your message..."
              placeholderTextColor={Colors.textTertiary}
              value={chatMessage}
              onChangeText={setChatMessage}
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={() => {
                if (chatMessage.trim()) {
                  showToast('Message sent! We\'ll respond shortly.');
                  setChatMessage('');
                  setShowChat(false);
                }
              }}
            >
              <Text style={styles.sendText}>Send</Text>
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
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: Colors.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, padding: 0 },
  catRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  catChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  catText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  catTextActive: { color: Colors.white },
  faqList: { paddingHorizontal: 16, gap: 8 },
  faqCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  faqQuestion: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  faqQuestionText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary, lineHeight: 20 },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: Colors.cardBorder, paddingTop: 12 },
  faqAnswerText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  helpfulRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  helpfulLabel: { fontSize: 12, color: Colors.textTertiary },
  helpfulBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.background },
  helpfulBtnText: { fontSize: 12, fontWeight: '600' },
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: Colors.textTertiary },
  contactBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 24, paddingVertical: 16, borderRadius: 14, backgroundColor: Colors.accent },
  contactText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  chatModal: { flex: 1, backgroundColor: Colors.background },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  chatTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  chatContent: { flex: 1, padding: 20 },
  chatBubbleBot: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, maxWidth: '80%', borderWidth: 1, borderColor: Colors.cardBorder },
  chatBubbleText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  chatInputRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 10, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  chatInput: { flex: 1, backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.cardBorder },
  sendBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.accent, justifyContent: 'center' },
  sendText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
