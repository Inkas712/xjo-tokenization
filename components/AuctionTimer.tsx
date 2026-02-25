import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface AuctionTimerProps {
  endTime: Date;
  compact?: boolean;
}

function AuctionTimerComponent({ endTime, compact = false }: AuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [ended, setEnded] = useState<boolean>(false);

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const end = endTime.getTime();
    const diff = end - now;

    if (diff <= 0) {
      setEnded(true);
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }, [endTime]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  if (ended) {
    return (
      <View style={[styles.container, compact && styles.containerCompact, styles.endedContainer]}>
        <Text style={[styles.endedText, compact && styles.endedTextCompact]}>Auction Ended</Text>
      </View>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (compact) {
    return (
      <View style={[styles.container, styles.containerCompact]}>
        <Text style={styles.compactText}>
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.unitBox}>
        <Text style={styles.value}>{pad(timeLeft.days)}</Text>
        <Text style={styles.unit}>Days</Text>
      </View>
      <Text style={styles.separator}>:</Text>
      <View style={styles.unitBox}>
        <Text style={styles.value}>{pad(timeLeft.hours)}</Text>
        <Text style={styles.unit}>Hrs</Text>
      </View>
      <Text style={styles.separator}>:</Text>
      <View style={styles.unitBox}>
        <Text style={styles.value}>{pad(timeLeft.minutes)}</Text>
        <Text style={styles.unit}>Min</Text>
      </View>
      <Text style={styles.separator}>:</Text>
      <View style={styles.unitBox}>
        <Text style={styles.value}>{pad(timeLeft.seconds)}</Text>
        <Text style={styles.unit}>Sec</Text>
      </View>
    </View>
  );
}

export const AuctionTimer = React.memo(AuctionTimerComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  containerCompact: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  endedContainer: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  unitBox: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 48,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  value: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  unit: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  separator: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textTertiary,
  },
  compactText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.bid,
    fontFamily: 'monospace',
  },
  endedText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.error,
  },
  endedTextCompact: {
    fontSize: 10,
  },
});
