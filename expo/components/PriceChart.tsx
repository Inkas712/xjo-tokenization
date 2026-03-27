import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Colors from '@/constants/colors';

interface PriceChartProps {
  data: { month: string; price: number }[];
  width?: number;
  height?: number;
}

function PriceChartComponent({ data, width = 320, height = 180 }: PriceChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return { linePath: '', areaPath: '', points: [], minPrice: 0, maxPrice: 0 };

    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;

    const padding = { top: 20, bottom: 30, left: 10, right: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const points = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartWidth,
      y: padding.top + chartHeight - ((d.price - minPrice) / range) * chartHeight,
      price: d.price,
      month: d.month,
    }));

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
      const cp1y = points[i - 1].y;
      const cp2x = points[i].x - (points[i].x - points[i - 1].x) / 3;
      const cp2y = points[i].y;
      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
    }

    const areaPath = linePath + ` L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

    return { linePath, areaPath, points, minPrice, maxPrice };
  }, [data, width, height]);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>
        {[0, 1, 2, 3].map(i => (
          <Rect
            key={i}
            x={10}
            y={20 + i * ((height - 50) / 3)}
            width={width - 20}
            height={1}
            fill={Colors.cardBorder}
            opacity={0.5}
          />
        ))}
        <Path d={chartData.areaPath} fill="url(#areaGrad)" />
        <Path d={chartData.linePath} stroke={Colors.accent} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {chartData.points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={Colors.white} stroke={Colors.accent} strokeWidth={2} />
        ))}
      </Svg>
      <View style={[styles.labels, { width }]}>
        {data.map((d, i) => (
          <Text key={i} style={styles.label}>{d.month}</Text>
        ))}
      </View>
    </View>
  );
}

export const PriceChart = React.memo(PriceChartComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center' as const,
  },
  labels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 14,
    marginTop: -22,
  },
  label: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500' as const,
  },
});
