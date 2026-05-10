import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { User, CreditCard, Phone, Wallet } from 'lucide-react-native';
import Colors from '@/constants/colors';

type PaymentMethod = 'nickname' | 'phone' | 'card' | 'crypto';

export default function PaymentScreen() {
  const params = useLocalSearchParams<{ recipient?: string; amount?: string; method?: string; assetId?: string }>();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('nickname');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  useEffect(() => {
    if (params.recipient) {
      setRecipient(params.recipient);
    }
    if (params.amount) {
      setAmount(params.amount);
    }
    if (params.method && ['nickname', 'phone', 'card', 'crypto'].includes(params.method)) {
      setSelectedMethod(params.method as PaymentMethod);
    }
    if (params.assetId) {
      setSelectedAssetId(params.assetId);
    }
  }, [params]);

  const methods = [
    { id: 'nickname' as const, label: 'Nickname', icon: User },
    { id: 'phone' as const, label: 'Phone', icon: Phone },
    { id: 'card' as const, label: 'Card', icon: CreditCard },
    { id: 'crypto' as const, label: 'Crypto', icon: Wallet },
  ];

  const handleSend = () => {
    if (!recipient.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const assetInfo = selectedAssetId ? ` using asset ID ${selectedAssetId}` : '';
    Alert.alert(
      'Confirm Payment',
      `Send ${amount} to ${recipient}?${assetInfo}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert('Success', 'Payment sent successfully');
            setRecipient('');
            setAmount('');
            setSelectedAssetId(null);
          },
        },
      ]
    );
  };

  const getPlaceholder = () => {
    switch (selectedMethod) {
      case 'nickname':
        return 'Enter recipient nickname';
      case 'phone':
        return 'Enter phone number';
      case 'card':
        return 'Enter card number';
      case 'crypto':
        return 'Enter wallet address';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Send Money</Text>
        <Text style={styles.subtitle}>Fast, simple, and secure transfers</Text>

        <View style={styles.methodsContainer}>
          {methods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodButton, isSelected && styles.methodButtonSelected]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.methodIcon, isSelected && styles.methodIconSelected]}>
                  <Icon size={24} color={isSelected ? Colors.cardBackground : Colors.text} />
                </View>
                <Text style={[styles.methodLabel, isSelected && styles.methodLabelSelected]}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recipient</Text>
            <TextInput
              style={styles.input}
              placeholder={getPlaceholder()}
              placeholderTextColor={Colors.textSecondary}
              value={recipient}
              onChangeText={setRecipient}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount (USD)</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.quickAmounts}>
            {['10', '50', '100', '500'].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickAmountText}>${quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          activeOpacity={0.8}
        >
          <Text style={styles.sendButtonText}>Send Money</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Interest-Free Transfers</Text>
          <Text style={styles.infoText}>
            All transfers are instant and compliant with Islamic finance principles. 
            No hidden fees, no interest charges.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  methodsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  methodButtonSelected: {},
  methodIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  methodIconSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  methodLabelSelected: {
    color: Colors.primary,
  },
  form: {
    gap: 24,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.cardBackground,
  },
  infoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
