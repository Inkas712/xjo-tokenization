import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { X, Camera, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { demoAssets } from '@/mocks/demo-data';
import { Asset } from '@/types';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [panelHeight] = useState(new Animated.Value(0));
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Camera Not Available',
        'QR scanning is not available on web. Please use the mobile app.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [router]);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setScannedData(data);
    console.log('QR Code scanned:', data);

    Animated.timing(panelHeight, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleConfirmPayment = () => {
    if (!selectedAsset) {
      Alert.alert('Error', 'Please select an asset to pay with');
      return;
    }

    try {
      const qrData = JSON.parse(scannedData);
      
      if (qrData.type === 'payment' && qrData.recipient) {
        router.push({
          pathname: '/(tabs)/payment',
          params: {
            recipient: qrData.recipient,
            amount: qrData.amount || '',
            method: 'nickname',
            assetId: selectedAsset.id,
          },
        });
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not a valid payment code.', [
          { text: 'Scan Again', onPress: handleCancelPayment },
        ]);
      }
    } catch {
      router.push({
        pathname: '/(tabs)/payment',
        params: {
          recipient: scannedData,
          method: 'nickname',
          assetId: selectedAsset.id,
        },
      });
    }
  };

  const handleCancelPayment = () => {
    Animated.timing(panelHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setScanned(false);
      setScannedData('');
      setSelectedAsset(null);
    });
  };

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.webPlaceholder}>
          <Camera size={64} color={Colors.textSecondary} />
          <Text style={styles.webText}>Camera not available on web</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color={Colors.primary} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            XJO needs camera access to scan QR codes for payments
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <SafeAreaView style={styles.overlay} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <X size={24} color={Colors.cardBackground} />
            </TouchableOpacity>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
            <Text style={styles.scanText}>Position QR code within frame</Text>
          </View>

          {scanned && (
            <Animated.View
              style={[
                styles.assetPanel,
                {
                  height: panelHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 400],
                  }),
                  opacity: panelHeight,
                },
              ]}
            >
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Select Payment Asset</Text>
                <TouchableOpacity onPress={handleCancelPayment} activeOpacity={0.7}>
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView
                style={styles.assetsList}
                showsVerticalScrollIndicator={false}
              >
                {demoAssets.map((asset) => (
                  <TouchableOpacity
                    key={asset.id}
                    style={[
                      styles.assetItem,
                      selectedAsset?.id === asset.id && styles.assetItemSelected,
                    ]}
                    onPress={() => handleAssetSelect(asset)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.assetItemLeft}>
                      <View style={[
                        styles.assetItemIcon,
                        { backgroundColor: asset.type === 'crypto' ? Colors.primary + '20' : '#F5F5F5' }
                      ]}>
                        <Text style={styles.assetItemIconText}>{asset.currency}</Text>
                      </View>
                      <View>
                        <Text style={styles.assetItemName}>{asset.name}</Text>
                        <Text style={styles.assetItemBalance}>
                          {asset.balance.toFixed(asset.type === 'crypto' ? 4 : 2)} {asset.currency}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.assetItemRight}>
                      <Text style={styles.assetItemValue}>
                        ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                      {selectedAsset?.id === asset.id && (
                        <View style={styles.selectedIndicator}>
                          <Check size={16} color={Colors.cardBackground} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedAsset && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirmPayment}
                activeOpacity={0.8}
                disabled={!selectedAsset}
              >
                <Text style={styles.confirmButtonText}>Confirm Payment</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.cardBackground,
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.cardBackground,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.cardBackground,
    marginTop: 32,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scannedContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scannedText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.cardBackground,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  webPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  webText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  assetPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  assetsList: {
    maxHeight: 240,
    marginBottom: 16,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  assetItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  assetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  assetItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetItemIconText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  assetItemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  assetItemBalance: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  assetItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  assetItemValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.cardBackground,
  },
});
