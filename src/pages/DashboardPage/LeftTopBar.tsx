import React, { useRef, useEffect, useState } from 'react';
import type { SankeyData, AttackTypeDistribution } from '@/types/data';
import D3SankeyAttackedSystemsChart from '@/components/charts/D3SankeyAttackedSystemsChart';
import D3AttackTypeDistributionChart from '@/components/charts/D3AttackTypeDistributionChart';

interface LeftTopBarProps {
  sankeyAttackedSystemsData: SankeyData | null;
  attackTypeDistribution: AttackTypeDistribution | null;
  width: string;
}

const LeftTopBar: React.FC<LeftTopBarProps> = ({
  sankeyAttackedSystemsData,
  attackTypeDistribution,
  width,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    if (sectionRef.current) {
      setChartWidth(sectionRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (sectionRef.current) {
        setChartWidth(sectionRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex flex-col gap-3 shrink-0 bg-slate-900 bg-opacity-40 backdrop-blur-md p-4 rounded-lg shadow-glow-blue overflow-y-auto"
      style={{ flexBasis: width, maxWidth: width, minWidth: width }}
    >
      <div>
        <div className="mb-3 pb-1 group relative">
          <h2 className="text-base font-medium relative flex items-center">
            <span className="text-[#00d9ff] uppercase tracking-widest text-sm">受攻击系统流向</span>
          </h2>
        </div>
        {sankeyAttackedSystemsData ? (
          <D3SankeyAttackedSystemsChart data={sankeyAttackedSystemsData} height={180} width={chartWidth > 0 ? chartWidth : undefined} />
        ) : <p className="text-slate-500 text-xs">无Sankey数据</p>}
      </div>
      <div>
        <div className="mb-3 pb-1 group relative">
          <h2 className="text-base font-medium relative flex items-center">
            <span className="text-[#00d9ff] uppercase tracking-widest text-sm">攻击类型分布</span>
          </h2>
        </div>
        {attackTypeDistribution && attackTypeDistribution.types.length > 0 ? (
          <D3AttackTypeDistributionChart data={attackTypeDistribution.types} idSuffix="attack-types-pie" height={200} width={chartWidth > 0 ? chartWidth : undefined} />
        ) : <p className="text-slate-500 text-xs">无攻击类型数据</p>}
      </div>
    </section>
  );
};

export default LeftTopBar; 