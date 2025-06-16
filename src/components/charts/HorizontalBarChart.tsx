import React from 'react';
import EChartComponent from './EChartComponent';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface HorizontalBarChartProps {
  data: { name: string; value: number }[];
  title?: string; 
  barColor?: string | echarts.graphic.LinearGradient;
  style?: React.CSSProperties;
  showFullYAxisLabels?: boolean; // New prop to control label truncation
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = 
  ({ data, title, barColor, style, showFullYAxisLabels = false }) => {
  
  const sortedData = [...data].sort((a, b) => a.value - b.value); // Sort ascending for ECharts horizontal bar (bottom to top)

  const defaultBarColor = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    { offset: 0, color: '#007bff' }, 
    { offset: 1, color: '#00d9ff' }  
  ]);

  const option: EChartsOption = {
    title: {
      text: title || '',
      show: false, // Title is now handled in App.tsx directly above the chart for better layout control
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: "{b} : {c}",
      backgroundColor: 'rgba(10, 25, 47, 0.9)',
      borderColor: '#00a8ff',
      borderWidth: 1,
      textStyle: { color: '#e6f1ff', fontSize: 11 },
      confine: true,
    },
    grid: {
      left: showFullYAxisLabels ? '20%' : '15%', // Adjust left for potentially longer labels
      right: '12%', // Make space for value labels on the right
      bottom: '5%',
      top: '5%',
      containLabel: false, // Set to false, will handle label space with grid percentages
    },
    xAxis: {
      type: 'value',
      splitLine: { show: true, lineStyle: { type: 'dashed', color: 'rgba(100, 116, 139, 0.2)' } },
      axisLabel: { show: true, color: '#94a3b8', fontSize: 9 },
      axisLine: { show: true, lineStyle: { color: '#475569' } },
    },
    yAxis: {
      type: 'category',
      data: sortedData.map(item => item.name),
      axisLabel: {
        color: '#cbd5e1',
        fontSize: 10,
        interval: 0,
        overflow: showFullYAxisLabels ? 'none' : 'truncate',
        width: showFullYAxisLabels ? undefined : 55, 
        lineHeight: 12,
        formatter: function (value: string) {
          // Simple truncation for very long IP addresses if not showing full
          if (!showFullYAxisLabels && value.length > 15 && value.includes('.')) { 
            return value.substring(0,13) + '...';
          }
          return value;
        }
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: title || '数据',
        type: 'bar',
        data: sortedData.map(item => item.value),
        barMaxWidth: 12, 
        itemStyle: {
          color: typeof barColor === 'function' ? barColor : (barColor || defaultBarColor),
          borderRadius: [0, 3, 3, 0] 
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}',
          color: '#e2e8f0',
          fontSize: 9,
          textShadowBlur: 2,
          textShadowColor: '#000'
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: typeof barColor === 'function' ? barColor : (barColor || defaultBarColor), // Keep original color or use a brighter version
            shadowBlur: 12,
            shadowColor: 'rgba(0, 217, 255, 0.6)',
          }
        }
      }
    ],
    backgroundColor: 'transparent'
  };

  const chartStyle = style || { height: '150px' }; // Reduced default height

  return <EChartComponent option={option} style={chartStyle} />;
};

export default HorizontalBarChart; 