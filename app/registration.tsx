import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Shield, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';

export default function RegistrationScreen() {
  const { registerUser } = useUser();
  const [name, setName] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [day, setDay] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleRegister = async () => {
    if (!name.trim() || !nickname.trim() || !day || !month || !year) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
      Alert.alert('Error', 'Please enter valid date numbers');
      return;
    }

    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      Alert.alert('Error', 'Please enter a valid date');
      return;
    }

    const dateOfBirth = new Date(yearNum, monthNum - 1, dayNum);
    const age = calculateAge(dateOfBirth);

    if (age < 18) {
      Alert.alert(
        'Age Restriction',
        'You must be 18+ to use this application',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser(name.trim(), nickname.trim(), dateOfBirth);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Shield size={48} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.title}>Welcome to XJO</Text>
            <Text style={styles.subtitle}>A decentralized hybrid financial platform</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nickname</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a unique nickname"
                placeholderTextColor={Colors.textSecondary}
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.dateContainer}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="DD"
                  placeholderTextColor={Colors.textSecondary}
                  value={day}
                  onChangeText={setDay}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="MM"
                  placeholderTextColor={Colors.textSecondary}
                  value={month}
                  onChangeText={setMonth}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.dateInputYear]}
                  placeholder="YYYY"
                  placeholderTextColor={Colors.textSecondary}
                  value={year}
                  onChangeText={setYear}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
              <View style={styles.ageWarning}>
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.ageWarningText}>You must be 18+ to use this app</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Creating Account...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our terms of service and privacy policy. 
            All transactions are values-based and interest-free.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    marginBottom: 4,
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    textAlign: 'center',
  },
  dateInputYear: {
    flex: 1.5,
    textAlign: 'center',
  },
  dateSeparator: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  ageWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  ageWarningText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.cardBackground,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
