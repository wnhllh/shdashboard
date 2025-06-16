import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import 'echarts-gl'; // Import GL for 3D charts if needed, ensure it's installed if used

interface EChartComponentProps {
  option: echarts.EChartsOption;
  style?: React.CSSProperties;
  className?: string;
}

const EChartComponent: React.FC<EChartComponentProps> = ({ option, style, className }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    console.log('[EChartComponent] Mounting or option changed. Ref:', chartRef.current);
    console.log('[EChartComponent] Received option:', JSON.stringify(option).substring(0, 300) + '...'); // Log partial option

    if (chartRef.current) {
      console.log('[EChartComponent] Initializing ECharts...');
      try {
        chartInstance.current = echarts.init(chartRef.current, 'dark');
        console.log('[EChartComponent] ECharts instance created:', chartInstance.current);
        chartInstance.current.setOption(option);
        console.log('[EChartComponent] ECharts option set.');
      } catch (err) {
        console.error('[EChartComponent] Error initializing or setting option:', err);
      }
    } else {
      console.warn('[EChartComponent] chartRef.current is null during mount/option-update.');
    }

    const handleResize = () => {
      console.log('[EChartComponent] Resizing chart...');
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      console.log('[EChartComponent] Unmounting. Disposing chart instance:', chartInstance.current);
      chartInstance.current?.dispose();
      window.removeEventListener('resize', handleResize);
      console.log('[EChartComponent] Unmounted and disposed.');
    };
  }, [option]); // Ensure this runs when option changes, not just mount

  // This useEffect was problematic as it re-ran initialization logic too often.
  // The logic is now combined into the useEffect above, triggered by `option` changes.
  // useEffect(() => {
  //   if (chartInstance.current && option) {
  //     console.log('[EChartComponent] Option prop changed, updating chart.');
  //     chartInstance.current.setOption(option, true);
  //   }
  // }, [option]);

  console.log('[EChartComponent] Rendering div for chart...');
  return <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: '150px', ...style }} className={className} />;
};

export default EChartComponent; 