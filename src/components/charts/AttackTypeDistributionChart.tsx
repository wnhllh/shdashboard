import React from 'react';
import EChartComponent from './EChartComponent';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface AttackTypeDistributionChartProps {
  data: { name: string; value: number }[];
  style?: React.CSSProperties;
}

const AttackTypeDistributionChart: React.FC<AttackTypeDistributionChartProps> = ({ data, style }) => {
  const colorPalette = [
    '#00d9ff', // Bright Cyan
    '#00a8ff', // Cyber Blue
    '#5865f2', // Blurple
    '#8a58f2', // Purple
    '#23a5f0', // Bright Blue
    '#40c4ff', // Sky Blue
    '#ff7eb9'  // Pinkish
  ];

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: "{a} <br/>{b} : {c} ({d}%)",
      backgroundColor: 'rgba(10, 25, 47, 0.9)', 
      borderColor: '#00a8ff',
      borderWidth: 1,
      textStyle: { color: '#e6f1ff', fontSize: 12 },
      confine: true,
    },
    legend: {
      orient: 'horizontal',
      left: 'center',
      bottom: '2%',
      textStyle: { color: '#bac4d2', fontSize: 10 },
      itemGap: 8,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      data: data.map(item => item.name),
      inactiveColor: '#555'
    },
    series: [
      {
        name: '攻击类型',
        type: 'pie',
        radius: ['50%', '75%'], 
        center: ['50%', '42%'], // Adjusted for bottom legend
        avoidLabelOverlap: true,
        itemStyle: {
          // No border for a flatter, more modern look, rely on spacing or subtle bg differences
          // borderColor: 'rgba(10, 25, 47, 0.7)',
          // borderWidth: 1,
          // borderRadius: 3, // Subtle rounding
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 600,
            formatter: '{b}\n{d}%',
            color: '#fff',
            textShadowBlur: 5,
            textShadowColor: '#000'
          },
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 217, 255, 0.6)' // Brighter cyan glow
          }
        },
        labelLine: { show: false },
        data: data.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0.5, 0, 0.5, 1, [
              { offset: 0, color: echarts.color.lift(colorPalette[index % colorPalette.length], -0.1) },
              { offset: 1, color: colorPalette[index % colorPalette.length] }
            ])
          }
        })),
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: idx => Math.random() * 200 + idx * 50,
      }
    ],
    backgroundColor: 'transparent'
  };

  const chartStyle = style || { height: '220px' };

  return <EChartComponent option={option} style={chartStyle} />;
};

export default AttackTypeDistributionChart; 