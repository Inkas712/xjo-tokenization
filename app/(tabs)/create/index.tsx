import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  ImageIcon,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { categories, AssetCategory } from '@/mocks/assets';
import { useMintAsset } from '@/hooks/useAssets';
import { useWallet } from '@/contexts/WalletContext';
import { mixpanel } from '@/services/mixpanel';

type Step = 1 | 2 | 3;

interface FormData {
  image: string;
  name: string;
  description: string;
  category: AssetCategory | '';
  price: string;
  saleType: 'fixed' | 'auction';
  royalty: number;
  supply: string;
}

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const { isConnected, address, fullAddress, showToast } = useWallet();
  const mintAsset = useMintAsset();
  const [step, setStep] = useState<Step>(1);
  const [mintResult, setMintResult] = useState<{ txHash: string; tokenId: string; ipfsHash?: string } | null>(null);
  const [form, setForm] = useState<FormData>({
    image: '',
    name: '',
    description: '',
    category: '',
    price: '',
    saleType: 'fixed',
    royalty: 5,
    supply: '1',
  });

  const updateForm = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      updateForm('image', result.assets[0].uri);
    }
  }, [updateForm]);

  const validateStep1 = useCallback(() => {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter an asset name.');
      return false;
    }
    if (!form.description.trim()) {
      Alert.alert('Required', 'Please add a description.');
      return false;
    }
    if (!form.category) {
      Alert.alert('Required', 'Please select a category.');
      return false;
    }
    return true;
  }, [form.name, form.description, form.category]);

  const validateStep2 = useCallback(() => {
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return false;
    }
    const supply = parseInt(form.supply);
    if (isNaN(supply) || supply < 1) {
      Alert.alert('Invalid Supply', 'Supply must be at least 1.');
      return false;
    }
    return true;
  }, [form.price, form.supply]);

  const goNext = useCallback(() => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(prev => Math.min(prev + 1, 3) as Step);
  }, [step, validateStep1, validateStep2]);

  const goBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(prev => Math.max(prev - 1, 1) as Step);
  }, []);

  const handleMint = useCallback(async () => {
    if (!isConnected) {
      Alert.alert('Connect Wallet', 'Please connect your wallet to mint a token.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    console.log('[Create] Starting mint with Pinata IPFS upload...');
    try {
      const result = await mintAsset.mutateAsync({
        imageUri: form.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        name: form.name,
        description: form.description,
        category: form.category as AssetCategory,
        price: parseFloat(form.price) || 0,
        saleType: form.saleType,
        royalty: form.royalty,
        supply: parseInt(form.supply) || 1,
        ownerWallet: fullAddress || '0x0000',
      });
      setMintResult({
        txHash: result.txHash,
        tokenId: result.tokenId,
        ipfsHash: result.ipfsHash,
      });
      console.log('[Create] Mint successful:', result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Token minted successfully!');
      mixpanel.trackAssetMinted(
        form.name,
        form.category,
        parseFloat(form.price) || 0,
        form.royalty,
      );
    } catch (err: any) {
      console.error('[Create] Mint failed:', err);
      const errorMsg = err?.message || 'Something went wrong during minting.';
      showToast(errorMsg, 'error');
    }
  }, [isConnected, fullAddress, form, mintAsset, showToast]);

  const resetForm = useCallback(() => {
    setForm({
      image: '',
      name: '',
      description: '',
      category: '',
      price: '',
      saleType: 'fixed',
      royalty: 5,
      supply: '1',
    });
    setStep(1);
    setMintResult(null);
    mintAsset.reset();
  }, [mintAsset]);

  const royaltyOptions = [0, 2.5, 5, 7.5, 10, 15];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Create Asset</Text>
        <Text style={styles.subtitle}>XJO — Tokenize your real-world or digital asset</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <View style={styles.stepsRow}>
          {[1, 2, 3].map(s => (
            <View key={s} style={styles.stepIndicator}>
              <View style={[styles.stepCircle, s <= step && styles.stepCircleActive, s < step && styles.stepCircleDone]}>
                {s < step ? (
                  <CheckCircle size={14} color={Colors.white} />
                ) : (
                  <Text style={[styles.stepNum, s <= step && styles.stepNumActive]}>{s}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, s <= step && styles.stepLabelActive]}>
                {s === 1 ? 'Details' : s === 2 ? 'Pricing' : 'Preview'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <View style={styles.stepContent}>
            <TouchableOpacity style={styles.uploadArea} onPress={pickImage} testID="upload-image">
              {form.image ? (
                <Image source={{ uri: form.image }} style={styles.uploadedImage} contentFit="cover" />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <ImageIcon size={32} color={Colors.textTertiary} />
                  <Text style={styles.uploadText}>Tap to upload image</Text>
                  <Text style={styles.uploadHint}>PNG, JPG, SVG, GIF</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Asset Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Manhattan Penthouse Token"
              placeholderTextColor={Colors.textTertiary}
              value={form.name}
              onChangeText={v => updateForm('name', v)}
              testID="asset-name-input"
            />

            <Text style={styles.fieldLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your asset, its value, and what the token represents..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={form.description}
              onChangeText={v => updateForm('description', v)}
              testID="asset-description-input"
            />

            <Text style={styles.fieldLabel}>Category *</Text>
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryOption, form.category === cat && styles.categoryOptionActive]}
                  onPress={() => updateForm('category', cat)}
                >
                  <Text style={[styles.categoryOptionText, form.category === cat && styles.categoryOptionTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.fieldLabel}>Sale Type</Text>
            <View style={styles.saleTypeRow}>
              <TouchableOpacity
                style={[styles.saleOption, form.saleType === 'fixed' && styles.saleOptionActive]}
                onPress={() => updateForm('saleType', 'fixed')}
              >
                <Text style={[styles.saleOptionTitle, form.saleType === 'fixed' && styles.saleOptionTitleActive]}>Fixed Price</Text>
                <Text style={[styles.saleOptionDesc, form.saleType === 'fixed' && styles.saleOptionDescActive]}>Set price, instant buy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saleOption, form.saleType === 'auction' && styles.saleOptionActive]}
                onPress={() => updateForm('saleType', 'auction')}
              >
                <Text style={[styles.saleOptionTitle, form.saleType === 'auction' && styles.saleOptionTitleActive]}>Auction</Text>
                <Text style={[styles.saleOptionDesc, form.saleType === 'auction' && styles.saleOptionDescActive]}>Bidders compete</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Price (ETH) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={form.price}
              onChangeText={v => updateForm('price', v)}
              testID="price-input"
            />

            <Text style={styles.fieldLabel}>Royalty %</Text>
            <View style={styles.royaltyRow}>
              {royaltyOptions.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.royaltyChip, form.royalty === r && styles.royaltyChipActive]}
                  onPress={() => updateForm('royalty', r)}
                >
                  <Text style={[styles.royaltyText, form.royalty === r && styles.royaltyTextActive]}>{r}%</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Supply</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={form.supply}
              onChangeText={v => updateForm('supply', v)}
              testID="supply-input"
            />
          </View>
        )}

        {step === 3 && !mintAsset.isPending && !mintAsset.isSuccess && (
          <View style={styles.stepContent}>
            <Text style={styles.previewTitle}>Review Your Token</Text>
            <View style={styles.previewCard}>
              {form.image ? (
                <Image source={{ uri: form.image }} style={styles.previewImage} contentFit="cover" />
              ) : (
                <View style={[styles.previewImage, styles.previewPlaceholder]}>
                  <ImageIcon size={40} color={Colors.textTertiary} />
                </View>
              )}
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{form.name || 'Untitled'}</Text>
                <Text style={styles.previewCategory}>{form.category || 'No category'}</Text>
                <Text style={styles.previewPrice}>{form.price || '0'} ETH</Text>
              </View>
            </View>

            <View style={styles.previewDetails}>
              {[
                ['Sale Type', form.saleType === 'fixed' ? 'Fixed Price' : 'Auction'],
                ['Royalty', `${form.royalty}%`],
                ['Supply', form.supply || '1'],
                ['Blockchain', 'Ethereum'],
                ['Token Standard', parseInt(form.supply) > 1 ? 'ERC-1155' : 'ERC-721'],
              ].map(([label, value]) => (
                <View key={label} style={styles.previewRow}>
                  <Text style={styles.previewLabel}>{label}</Text>
                  <Text style={styles.previewValue}>{value}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.previewDesc} numberOfLines={3}>{form.description}</Text>
          </View>
        )}

        {mintAsset.isPending && (
          <View style={styles.mintingCenter}>
            <View style={styles.mintingAnimation}>
              <Sparkles size={48} color={Colors.accent} />
            </View>
            <Text style={styles.mintingTitle}>Minting Your Token...</Text>
            <Text style={styles.mintingSubtext}>Uploading to IPFS & broadcasting to Ethereum</Text>
            <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 20 }} />
          </View>
        )}

        {mintAsset.isSuccess && mintResult && (
          <View style={styles.mintingCenter}>
            <View style={styles.successCircle}>
              <CheckCircle size={48} color={Colors.accent} />
            </View>
            <Text style={styles.successTitle}>Token Minted!</Text>
            <Text style={styles.successSub}>Your asset is now on the blockchain</Text>
            <View style={styles.txCard}>
              <Text style={styles.txLabel}>Transaction Hash</Text>
              <Text style={styles.txHash}>{mintResult.txHash.slice(0, 10)}...{mintResult.txHash.slice(-8)}</Text>
            </View>
            <View style={styles.txCard}>
              <Text style={styles.txLabel}>Token ID</Text>
              <Text style={styles.txHash}>#{mintResult.tokenId}</Text>
            </View>
            {mintResult.ipfsHash && (
              <View style={styles.txCard}>
                <Text style={styles.txLabel}>IPFS Hash</Text>
                <Text style={styles.txHash}>{mintResult.ipfsHash.slice(0, 12)}...</Text>
              </View>
            )}
            <TouchableOpacity style={styles.newTokenBtn} onPress={resetForm}>
              <Text style={styles.newTokenText}>Create Another</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {!mintAsset.isPending && !mintAsset.isSuccess && (
        <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 12 }]}>
          {step > 1 && (
            <TouchableOpacity style={styles.backBtn} onPress={goBack}>
              <ChevronLeft size={20} color={Colors.textSecondary} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          {step < 3 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <ChevronRight size={18} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.mintBtn} onPress={handleMint} testID="mint-btn">
              <Sparkles size={18} color={Colors.white} />
              <Text style={styles.mintBtnText}>Mint Token</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.textTertiary, marginTop: 2 },
  progressContainer: { paddingHorizontal: 20, marginTop: 20 },
  progressBar: { height: 4, backgroundColor: Colors.cardBorder, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  stepIndicator: { alignItems: 'center', gap: 6 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { backgroundColor: Colors.accent },
  stepCircleDone: { backgroundColor: Colors.accent },
  stepNum: { fontSize: 12, fontWeight: '700', color: Colors.textTertiary },
  stepNumActive: { color: Colors.white },
  stepLabel: { fontSize: 11, fontWeight: '500', color: Colors.textTertiary },
  stepLabelActive: { color: Colors.accent, fontWeight: '600' },
  formScroll: { flex: 1 },
  stepContent: { padding: 20 },
  uploadArea: { height: 180, borderRadius: 16, borderWidth: 2, borderColor: Colors.cardBorder, borderStyle: 'dashed', overflow: 'hidden', marginBottom: 20 },
  uploadedImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.card, gap: 8 },
  uploadText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  uploadHint: { fontSize: 11, color: Colors.textTertiary },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.cardBorder },
  textArea: { minHeight: 100, paddingTop: 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryOption: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  categoryOptionActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  categoryOptionText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  categoryOptionTextActive: { color: Colors.white },
  saleTypeRow: { flexDirection: 'row', gap: 10 },
  saleOption: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: Colors.card, borderWidth: 2, borderColor: Colors.cardBorder, alignItems: 'center', gap: 4 },
  saleOptionActive: { borderColor: Colors.accent, backgroundColor: '#E8F5E2' },
  saleOptionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  saleOptionTitleActive: { color: Colors.accent },
  saleOptionDesc: { fontSize: 11, color: Colors.textTertiary },
  saleOptionDescActive: { color: Colors.textSecondary },
  royaltyRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  royaltyChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  royaltyChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  royaltyText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  royaltyTextActive: { color: Colors.white },
  previewTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16 },
  previewCard: { backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  previewImage: { width: '100%', height: 200 },
  previewPlaceholder: { backgroundColor: Colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  previewInfo: { padding: 16, gap: 4 },
  previewName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  previewCategory: { fontSize: 12, color: Colors.textTertiary, fontWeight: '500' },
  previewPrice: { fontSize: 20, fontWeight: '900', color: Colors.accent, marginTop: 4 },
  previewDetails: { backgroundColor: Colors.card, borderRadius: 14, marginTop: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  previewLabel: { fontSize: 13, color: Colors.textTertiary },
  previewValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  previewDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginTop: 16 },
  bottomActions: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, gap: 10, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 4, borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  backBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  nextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.accent },
  nextBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  mintBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.accent, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  mintBtnText: { fontSize: 15, fontWeight: '800', color: Colors.white },
  mintingCenter: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  mintingAnimation: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8F5E2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  mintingTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  mintingSubtext: { fontSize: 14, color: Colors.textTertiary },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8F5E2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary },
  successSub: { fontSize: 14, color: Colors.textTertiary, marginBottom: 20 },
  txCard: { backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center', gap: 4, width: '80%', marginBottom: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  txLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500' },
  txHash: { fontSize: 14, fontFamily: 'monospace', color: Colors.accent, fontWeight: '600' },
  newTokenBtn: { marginTop: 16, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.accent },
  newTokenText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
