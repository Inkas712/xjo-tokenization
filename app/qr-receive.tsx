import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Copy, Share2 } from 'lucide-react-native';
import QRCodeUtil from 'qrcode';
import * as Clipboard from 'expo-clipboard';
import Svg, { Rect } from 'react-native-svg';
import Colors from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';

export default function QRReceiveScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [copied, setCopied] = useState<boolean>(false);
  const [qrMatrix, setQrMatrix] = useState<boolean[][]>([]);

  const qrData = JSON.stringify({
    type: 'payment',
    recipient: user?.nickname || 'user',
    userId: user?.id,
  });

  const generateQRCode = useCallback(async () => {
    try {
      const matrix = await QRCodeUtil.create(qrData, { errorCorrectionLevel: 'M' });
      const modules = matrix.modules;
      const size = modules.size;
      const data: boolean[][] = [];
      
      for (let i = 0; i < size; i++) {
        const row: boolean[] = [];
        for (let j = 0; j < size; j++) {
          row.push(modules.get(i, j) === 1);
        }
        data.push(row);
      }
      setQrMatrix(data);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  }, [qrData]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(user?.nickname || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Copied', 'Your payment details have been copied');
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      Alert.alert('Error', 'Failed to copy payment details');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Pay me on XJO: ${user?.nickname}`,
        title: 'XJO Payment',
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const QRCodeRenderer = ({ matrix, size }: { matrix: boolean[][]; size: number }) => {
    const moduleSize = size / matrix.length;
    return (
      <Svg width={size} height={size}>
        {matrix.map((row, i) =>
          row.map((cell, j) =>
            cell ? (
              <Rect
                key={`${i}-${j}`}
                x={j * moduleSize}
                y={i * moduleSize}
                width={moduleSize}
                height={moduleSize}
                fill={Colors.text}
              />
            ) : null
          )
        )}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Receive</Text>
            <Text style={styles.subtitle}>Share this QR code to receive payment</Text>
          </View>

          <View style={styles.qrSection}>
            <View style={styles.qrCard}>
              {qrMatrix.length > 0 && (
                <QRCodeRenderer matrix={qrMatrix} size={240} />
              )}
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.nickname}>@{user?.nickname || 'user'}</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={handleCopy}
            >
              <Copy size={20} color={Colors.text} />
              <Text style={styles.actionText}>{copied ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={handleShare}
            >
              <Share2 size={20} color={Colors.text} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  titleContainer: {
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  qrSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  qrCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 32,
    padding: 32,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 32,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
