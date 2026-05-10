import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Scan, QrCode } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function QREntryScreen() {
  const router = useRouter();

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
            <Text style={styles.title}>QR Payment</Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              activeOpacity={0.9}
              onPress={() => router.push('/qr-scanner')}
            >
              <View style={[styles.iconContainer, { backgroundColor: Colors.text }]}>
                <Scan size={40} color={Colors.cardBackground} strokeWidth={2} />
              </View>
              <Text style={styles.optionTitle}>Pay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              activeOpacity={0.9}
              onPress={() => router.push('/qr-receive')}
            >
              <View style={[styles.iconContainer, { backgroundColor: Colors.primary }]}>
                <QrCode size={40} color={Colors.cardBackground} strokeWidth={2} />
              </View>
              <Text style={styles.optionTitle}>Receive</Text>
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
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  optionCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
