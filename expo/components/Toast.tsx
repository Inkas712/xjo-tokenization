import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { CheckCircle, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';

function ToastComponent() {
  const { toastMessage, toastType } = useWallet();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (toastMessage) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 50, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [toastMessage, opacity, translateY]);

  if (!toastMessage) return null;

  const isError = toastType === 'error';

  return (
    <Animated.View style={[
      styles.container,
      isError && styles.errorContainer,
      { opacity, transform: [{ translateY }] },
    ]}>
      {isError ? (
        <AlertCircle size={18} color={Colors.error} />
      ) : (
        <CheckCircle size={18} color={Colors.accent} />
      )}
      <Text style={[styles.text, isError && styles.errorText]}>{toastMessage}</Text>
    </Animated.View>
  );
}

export const Toast = React.memo(ToastComponent);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: Colors.toastBg,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    zIndex: 9999,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  text: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accentDark,
    flex: 1,
  },
  errorText: {
    color: Colors.error,
  },
});
