import React, { useRef, useState, useEffect } from 'react';
import type { AttackHotspot, HistoricalTrend, AttackSourceInfo } from '@/types/data';
import CyberGlobe from '@/components/CyberGlobe';
import AttackTrendChart from '@/components/charts/AttackTrendChart';
import TopAttackSourcesChart from '@/components/charts/TopAttackSourcesChart';

interface MainContentProps {
  globeArcs: any[];
  attackHotspots: AttackHotspot[];
  attackTrend: HistoricalTrend[];
  attackSourceInfo: AttackSourceInfo | null;
  isLoading: boolean;
}

const MainContent: React.FC<MainContentProps> = ({
  globeArcs,
  attackHotspots,
  attackTrend,
  attackSourceInfo,
  isLoading,
}) => {
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  console.log('[MainContent] Received props:');
  console.log('[MainContent] - globeArcs:', globeArcs);
  console.log('[MainContent] - globeArcs length:', globeArcs?.length || 0);
  console.log('[MainContent] - attackHotspots:', attackHotspots);
  console.log('[MainContent] - attackHotspots length:', attackHotspots?.length || 0);

  // 如果没有飞线数据，创建一些测试数据
  const testArcsData = [
    { startLat: 40.7128, startLng: -74.0060, endLat: 31.2304, endLng: 121.4737, color: '#ff0000', label: '纽约 -> 上海' },
    { startLat: 51.5074, startLng: -0.1278, endLat: 31.2304, endLng: 121.4737, color: '#ff6666', label: '伦敦 -> 上海' },
    { startLat: 35.6762, startLng: 139.6503, endLat: 31.2304, endLng: 121.4737, color: '#ff0000', label: '东京 -> 上海' },
    { startLat: -33.8688, startLng: 151.2093, endLat: 31.2304, endLng: 121.4737, color: '#ff9999', label: '悉尼 -> 上海' },
    { startLat: 48.8566, startLng: 2.3522, endLat: 31.2304, endLng: 121.4737, color: '#ff6666', label: '巴黎 -> 上海' },
  ];

  // 使用测试数据如果原始数据为空
  const finalArcsData = (globeArcs && globeArcs.length > 0) ? globeArcs : testArcsData;
  
  console.log('[MainContent] Final arcs data:', finalArcsData);
  console.log('[MainContent] Final arcs data length:', finalArcsData?.length || 0);

  useEffect(() => {
    let ro: ResizeObserver | null = null;
    const currentGlobeContainer = globeContainerRef.current;

    if (currentGlobeContainer) {
      ro = new ResizeObserver(entries => {
        if (entries && entries.length > 0) {
          const entry = entries[0];
          if (entry.contentRect && (entry.contentRect.width !== dimensions.width || entry.contentRect.height !== dimensions.height)) {
            setDimensions({
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            });
          }
        }
      });
      ro.observe(currentGlobeContainer);
    }

    return () => {
      if (ro && currentGlobeContainer) {
        ro.unobserve(currentGlobeContainer);
      }
      if (ro) ro.disconnect();
    };
  }, [dimensions.width, dimensions.height]); // Rerun only when dimensions change

  return (
    <section ref={globeContainerRef} className="flex-grow basis-2/5 bg-slate-900 bg-opacity-40 backdrop-blur-md rounded-lg shadow-glow-blue relative overflow-hidden p-1">
      {(finalArcsData.length > 0 || attackHotspots.length > 0) && dimensions.width > 0 && dimensions.height > 0 ? (
        <CyberGlobe
          arcsData={finalArcsData}
          pointsData={attackHotspots}
          width={dimensions.width}
          height={dimensions.height}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          {isLoading ? '加载地球数据...' : '地球数据不足或容器尺寸无效'}
        </div>
      )}
      <div className="absolute bottom-2 left-2 right-2 h-1/4 flex space-x-2">
        <div className="flex-[2] bg-slate-900/50 backdrop-blur-sm rounded-md p-2 shadow-lg">
          {attackTrend.length > 0 ? (
            <AttackTrendChart
              data1={attackTrend}
              data2={attackTrend.map(d => ({ ...d, value: d.value * 0.7 }))}
              width={380}
              height={250}
            />
          ) : (
            <p className="text-slate-500 text-xs text-center">无攻击趋势数据</p>
          )}
        </div>
        <div className="flex-[3] bg-slate-900/50 backdrop-blur-sm rounded-md p-2 shadow-lg">
          {attackSourceInfo ? (
            <TopAttackSourcesChart
              domesticData={attackSourceInfo.topDomesticSources.map(s => ({ source: s.name, count: s.value }))}
              foreignData={attackSourceInfo.topForeignSources.map(s => ({ source: s.name, count: s.value }))}
            />
          ) : (
            <p className="text-slate-500 text-xs text-center">无攻击源数据</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default MainContent; 