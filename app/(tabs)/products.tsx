import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Briefcase, 
  Heart, 
  Shield,
  Calculator,
  Info,
  CheckCircle,
  X
} from 'lucide-react-native';
import * as React from 'react';
import Colors from '@/constants/colors';
import { islamicProducts } from '@/mocks/demo-data';

const iconMap = {
  TrendingUp,
  Users,
  ShoppingBag,
  Briefcase,
  Heart,
  Shield,
};

export default function ProductsScreen() {
  const [calculatorVisible, setCalculatorVisible] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<typeof islamicProducts[0] | null>(null);
  const [calculatorValues, setCalculatorValues] = React.useState({
    amount: '',
    period: '',
    rate: '',
    totalCapital: '',
  });
  const [calculatorResult, setCalculatorResult] = React.useState<{
    totalReturn?: number;
    monthlyPayment?: number;
    totalCost?: number;
    profitShare?: number;
    ownershipShare?: number;
  } | null>(null);

  const handleApply = (productName: string) => {
    Keyboard.dismiss();
    alert('Application feature coming soon for ' + productName);
  };

  const handleCalculate = (product: typeof islamicProducts[0]) => {
    setSelectedProduct(product);
    setCalculatorValues({ amount: '', period: '', rate: '', totalCapital: '' });
    setCalculatorResult(null);
    setCalculatorVisible(true);
  };

  const handleLearnMore = (product: typeof islamicProducts[0]) => {
    alert(product.name + '\n\n' + product.details);
  };

  const calculateResults = React.useCallback(() => {
    if (!selectedProduct) return;
    
    const amount = parseFloat(calculatorValues.amount) || 0;
    const period = parseFloat(calculatorValues.period) || 0;
    const rate = parseFloat(calculatorValues.rate) || 0;
    const totalCapital = parseFloat(calculatorValues.totalCapital) || 0;

    if (amount <= 0) return;

    switch (selectedProduct.id) {
      case '1': // Mudaraba
      case '4': // Wakala
        if (period > 0 && rate > 0) {
          const yearlyReturn = amount * (rate / 100);
          const totalReturn = (yearlyReturn / 12) * period;
          setCalculatorResult({ totalReturn, monthlyPayment: totalReturn / period });
        }
        break;
      
      case '2': // Musharaka
        if (totalCapital > 0 && rate > 0 && period > 0) {
          const ownershipShare = (amount / totalCapital) * 100;
          const yearlyProfit = totalCapital * (rate / 100);
          const profitShare = (yearlyProfit / 12) * period * (ownershipShare / 100);
          setCalculatorResult({ profitShare, ownershipShare, totalReturn: amount + profitShare });
        }
        break;
      
      case '3': // Murabaha
        if (rate > 0 && period > 0) {
          const markup = amount * (rate / 100);
          const totalCost = amount + markup;
          const monthlyPayment = totalCost / period;
          setCalculatorResult({ totalCost, monthlyPayment });
        }
        break;
      
      case '5': // Qard Hasan
        if (period > 0) {
          const monthlyPayment = amount / period;
          setCalculatorResult({ totalCost: amount, monthlyPayment });
        }
        break;
      
      case '6': // Amanah Wallet
        setCalculatorResult({ totalReturn: amount });
        break;
    }
  }, [selectedProduct, calculatorValues]);

  React.useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Islamic Finance</Text>
        <Text style={styles.subtitle}>Shariah-compliant products</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {islamicProducts.map((product) => {
          const IconComponent = iconMap[product.icon as keyof typeof iconMap] || Shield;
          
          return (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.iconContainer}>
                  <IconComponent size={28} color={Colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.productTitleContainer}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productArabicName}>{product.arabicName}</Text>
                </View>
              </View>

              <Text style={styles.productDescription}>{product.description}</Text>

              {product.minAmount !== undefined && product.minAmount > 0 && (
                <View style={styles.productDetail}>
                  <Text style={styles.detailLabel}>Minimum Amount:</Text>
                  <Text style={styles.detailValue}>${product.minAmount.toLocaleString()}</Text>
                </View>
              )}

              {product.expectedReturn && (
                <View style={styles.productDetail}>
                  <Text style={styles.detailLabel}>Expected Return:</Text>
                  <Text style={styles.detailValue}>{product.expectedReturn}</Text>
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => handleApply(product.name)}
                  activeOpacity={0.8}
                >
                  <CheckCircle size={18} color={Colors.cardBackground} />
                  <Text style={styles.primaryButtonText}>Apply</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => handleCalculate(product)}
                  activeOpacity={0.7}
                >
                  <Calculator size={18} color={Colors.primary} />
                  <Text style={styles.secondaryButtonText}>Calculate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconOnlyButton}
                  onPress={() => handleLearnMore(product)}
                  activeOpacity={0.7}
                >
                  <Info size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Interest-Free Finance</Text>
          <Text style={styles.infoText}>
            All our products are designed according to Islamic finance principles. 
            We believe in transparency, fairness, and ethical wealth creation without riba (interest).
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={calculatorVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCalculatorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedProduct?.name} Calculator</Text>
                <Text style={styles.modalSubtitle}>{selectedProduct?.arabicName}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setCalculatorVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedProduct?.id === '1' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Investment Amount ($)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1000"
                      keyboardType="numeric"
                      value={calculatorValues.amount}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, amount: text })}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Investment Period (months)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="12"
                      keyboardType="numeric"
                      value={calculatorValues.period}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, period: text })}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Expected Return Rate (% annually)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="10"
                      keyboardType="numeric"
                      value={calculatorValues.rate}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, rate: text })}
                    />
                  </View>
                </>
              )}

              {selectedProduct?.id === '2' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Your Capital Contribution ($)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="5000"
                      keyboardType="numeric"
                      value={calculatorValues.amount}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, amount: text })}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Total Project Capital ($)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="20000"
                      keyboardType="numeric"
                      value={calculatorValues.totalCapital}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, totalCapital: text })}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Project Duration (months)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="24"
                      keyboardType="numeric"
                      value={calculatorValues.period}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, period: text })}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Expected Return Rate (% annually)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="12"
                      keyboardType="numeric"
                      value={calculatorValues.rate}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, rate: text })}
                    />
                  </View>
                </>
              )}

              {selectedProduct?.id === '3' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Asset Cost ($)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="10000"
                      keyboardType="numeric"
                      value={calculatorValues.amount}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, amount: text })}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Profit Margin (%)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="5"
                      keyboardType="numeric"
                      value={calculatorValues.rate}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, rate: text })}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Payment Period (months)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="24"
                      keyboardType="numeric"
                      value={calculatorValues.period}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, period: text })}
                    />
                  </View>
                </>
              )}

              {selectedProduct?.id === '4' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Investment Amount ($)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="10000"
                      keyboardType="numeric"
                      value={calculatorValues.amount}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, amount: text })}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Management Period (months)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="12"
                      keyboardType="numeric"
                      value={calculatorValues.period}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, period: text })}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Expected Return Rate (% annually)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="8"
                      keyboardType="numeric"
                      value={calculatorValues.rate}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, rate: text })}
                    />
                  </View>
                </>
              )}

              {selectedProduct?.id === '5' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Loan Amount ($)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="5000"
                      keyboardType="numeric"
                      value={calculatorValues.amount}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, amount: text })}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Repayment Period (months)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="12"
                      keyboardType="numeric"
                      value={calculatorValues.period}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, period: text })}
                    />
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxText}>✨ This is an interest-free loan. You only repay the principal amount.</Text>
                  </View>
                </>
              )}

              {selectedProduct?.id === '6' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Initial Deposit ($)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1000"
                      keyboardType="numeric"
                      value={calculatorValues.amount}
                      onChangeText={(text) => setCalculatorValues({ ...calculatorValues, amount: text })}
                    />
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxText}>💎 Amanah Wallet holds your funds securely without generating returns. Perfect for saving or zakah.</Text>
                  </View>
                </>
              )}

              {calculatorResult && (
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>Calculation Results</Text>
                  
                  {calculatorResult.ownershipShare !== undefined && (
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Your Ownership Share:</Text>
                      <Text style={styles.resultValue}>{calculatorResult.ownershipShare.toFixed(2)}%</Text>
                    </View>
                  )}
                  
                  {calculatorResult.profitShare !== undefined && (
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Your Profit Share:</Text>
                      <Text style={styles.resultValue}>${calculatorResult.profitShare.toFixed(2)}</Text>
                    </View>
                  )}
                  
                  {calculatorResult.totalReturn !== undefined && selectedProduct?.id !== '6' && (
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Total Return:</Text>
                      <Text style={styles.resultValue}>${calculatorResult.totalReturn.toFixed(2)}</Text>
                    </View>
                  )}
                  
                  {calculatorResult.totalCost !== undefined && selectedProduct?.id === '3' && (
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Total Cost:</Text>
                      <Text style={styles.resultValue}>${calculatorResult.totalCost.toFixed(2)}</Text>
                    </View>
                  )}
                  
                  {calculatorResult.monthlyPayment !== undefined && (selectedProduct?.id === '3' || selectedProduct?.id === '5') && (
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Monthly Payment:</Text>
                      <Text style={styles.resultValue}>${calculatorResult.monthlyPayment.toFixed(2)}</Text>
                    </View>
                  )}
                  
                  {calculatorResult.totalReturn !== undefined && selectedProduct?.id === '6' && (
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Wallet Balance:</Text>
                      <Text style={styles.resultValue}>${calculatorResult.totalReturn.toFixed(2)}</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setCalculatorVisible(false);
                  if (selectedProduct) {
                    handleApply(selectedProduct.name);
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Apply Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  productCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  productTitleContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  productArabicName: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  productDescription: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  productDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '700' as const,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.cardBackground,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  iconOnlyButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoBox: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  infoBoxText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  resultCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  resultValue: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.cardBackground,
  },
});
