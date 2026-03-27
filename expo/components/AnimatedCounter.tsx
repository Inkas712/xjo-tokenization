import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated } from 'react-native';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: object;
}

export function AnimatedCounter({ target, duration = 1500, prefix = '', suffix = '', style }: AnimatedCounterProps) {
  const [display, setDisplay] = useState<string>('0');
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = animValue.addListener(({ value }) => {
      const num = Math.floor(value);
      if (num >= 1000) {
        setDisplay((num / 1000).toFixed(1) + 'K');
      } else {
        setDisplay(num.toLocaleString());
      }
    });

    Animated.timing(animValue, {
      toValue: target,
      duration,
      useNativeDriver: false,
    }).start();

    return () => {
      animValue.removeListener(listener);
    };
  }, [target, duration, animValue]);

  return (
    <Text style={style}>{prefix}{display}{suffix}</Text>
  );
}
