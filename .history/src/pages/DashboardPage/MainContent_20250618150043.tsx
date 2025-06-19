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
  const [globeDimensions, setGlobeDimensions] = useState({ width: 0, height: 0 });

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
          if (entry.contentRect && (entry.contentRect.width !== globeDimensions.width || entry.contentRect.height !== globeDimensions.height)) {
            setGlobeDimensions({
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
  }, [globeDimensions.width, globeDimensions.height]); // Rerun only when dimensions change

  return (
    <section className="flex-grow basis-2/5 bg-gradient-to-b from-slate-900/95 to-black/95 rounded-xl overflow-hidden p-3 border border-[#00d9ff]/40 shadow-[0_0_30px_rgba(0,217,255,0.15)] backdrop-blur-sm flex flex-col gap-3">
      {/* 上方区域 - 地球仪 */}
      <div
        ref={globeContainerRef}
        className="flex-grow bg-gradient-to-b from-slate-800/40 to-black/60 rounded-lg relative overflow-hidden border border-[#00d9ff]/20 shadow-[0_0_20px_rgba(0,217,255,0.1)]"
        style={{ minHeight: '60%' }}
      >
        {(finalArcsData.length > 0 || attackHotspots.length > 0) && globeDimensions.width > 0 && globeDimensions.height > 0 ? (
          <CyberGlobe
            arcsData={finalArcsData}
            pointsData={attackHotspots}
            width={globeDimensions.width}
            height={globeDimensions.height}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            {isLoading ? '加载地球数据...' : '地球数据不足或容器尺寸无效'}
          </div>
        )}
      </div>

      {/* 下方区域 - 图表 */}
      <div className="h-48 flex gap-2 shrink-0">
        <div className="flex-[2] bg-black/80 rounded-md p-2 shadow-lg border border-[#00d9ff]/20">
          <div className="h-full">
            {attackTrend.length > 0 ? (
              <AttackTrendChart
                data1={attackTrend}
                data2={attackTrend.map(d => ({ ...d, value: d.value * 0.7 }))}
                width={380}
                height={180}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-slate-500 text-xs text-center">无攻击趋势数据</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex-[3] bg-black/80 rounded-md p-2 shadow-lg border border-[#00d9ff]/20">
          <div className="h-full">
            {attackSourceInfo ? (
              <TopAttackSourcesChart
                domesticData={attackSourceInfo.topDomesticSources.map(s => ({ source: s.name, count: s.value }))}
                foreignData={attackSourceInfo.topForeignSources.map(s => ({ source: s.name, count: s.value }))}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-slate-500 text-xs text-center">无攻击源数据</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainContent; 