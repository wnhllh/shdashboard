import React, { useRef, useEffect, useState } from 'react';
import type { SankeyData, AttackTypeDistribution, WorkProgressData } from '@/types/data';
import D3SankeyAttackedSystemsChart from '@/components/charts/D3SankeyAttackedSystemsChart';
import D3AttackTypeDistributionChart from '@/components/charts/D3AttackTypeDistributionChart';
import WorkProgressChart from '@/components/charts/WorkProgressChart';

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

  // 模拟工作进度数据（从图片中提取）
  const workProgressData: WorkProgressData = {
    items: [
      {
        id: "01",
        title: "抓责任落实",
        progress: 95,
        tasks: [
          { name: "网络安全三书签订", progress: 100 },
          { name: "网络安全到基层活动", progress: 92 },
          { name: "高级管理人员培训", progress: 93 }
        ]
      },
      {
        id: "02",
        title: "抓清单落实",
        progress: 100,
        tasks: [
          { name: "梳理企业架构", progress: 100 },
          { name: "完善资产清单", progress: 100 },
          { name: "梳理风险清单", progress: 100 },
          { name: "制定责任清单", progress: 100 }
        ]
      },
      {
        id: "03",
        title: "抓边界防护",
        progress: 94,
        tasks: [
          { name: "强化互联网出口归一", progress: 100 },
          { name: "强化边界攻击拦截能力", progress: 100 },
          { name: "强化互联网暴露面监控", progress: 90 },
          { name: "强化纵向边界管控", progress: 92 },
          { name: "强化边界设备自身防护", progress: 100 }
        ]
      },
      {
        id: "04",
        title: "抓数据安全",
        progress: 91,
        tasks: [
          { name: "强化数据安全风险监控", progress: 95 },
          { name: "深化数据安全基础能力建设", progress: 90 },
          { name: "强化数据安全风险评估与预警", progress: 88 }
        ]
      },
      {
        id: "05",
        title: "抓新业务安全",
        progress: 90,
        tasks: [
          { name: "强化新型电力系统业务安全", progress: 95 },
          { name: "强化面向大众的新业务安全", progress: 92 },
          { name: "强化基础设施及新技术安全", progress: 88 },
          { name: "强化自主可控安全", progress: 85 }
        ]
      },
      {
        id: "06",
        title: "抓基础合规",
        progress: 92,
        tasks: [
          { name: "落实等级保护及关基保护要求", progress: 98 },
          { name: "两表一箱治理", progress: 90 },
          { name: "扫雷专项工作", progress: 88 },
          { name: "专项合规工作(作废)", progress: 92 },
          { name: "强化升级合规", progress: 95 }
        ]
      },
      {
        id: "07",
        title: "抓研发安全",
        progress: 96,
        tasks: [
          { name: "严格遵守研发运维\"十不准\"", progress: 100 },
          { name: "强化研发安全责任落实", progress: 90 },
          { name: "明确外部研发单位安全责任", progress: 100 },
          { name: "开展研发安全专项检查", progress: 95 }
        ]
      },
      {
        id: "08",
        title: "抓供应链安全",
        progress: 91,
        tasks: [
          { name: "硬件设备供应链安全", progress: 88 },
          { name: "软件代码供应链安全", progress: 90 },
          { name: "服务支持供应链安全", progress: 100 },
          { name: "外部联动供应链安全", progress: 86 }
        ]
      },
      {
        id: "09",
        title: "抓态势感知",
        progress: 93,
        tasks: [
          { name: "推动关键指标动态运营", progress: 90 },
          { name: "加强基础数据治理", progress: 100 },
          { name: "增强威胁发现能力", progress: 88 },
          { name: "强化全网联防联控", progress: 95 }
        ]
      },
      {
        id: "10",
        title: "抓队伍提升",
        progress: 90,
        tasks: [
          { name: "提升红队能力", progress: 88 },
          { name: "提升蓝队能力", progress: 92 }
        ]
      },
      {
        id: "11",
        title: "抓实战能力",
        progress: 92,
        tasks: [
          { name: "强化应急处置能力", progress: 95 },
          { name: "强化实战对抗能力", progress: 89 }
        ]
      },
      {
        id: "12",
        title: "抓稽查通报",
        progress: 94,
        tasks: [
          { name: "建立并用好网络安全全景\"微脚本\"", progress: 98 },
          { name: "加大督查力度", progress: 92 },
          { name: "强化通报警示", progress: 92 }
        ]
      }
    ]
  };

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
      className="flex flex-col gap-4 shrink-0 bg-gradient-to-b from-slate-900/95 to-black/95 p-4 rounded-xl overflow-y-auto border border-[#00d9ff]/40 shadow-[0_0_30px_rgba(0,217,255,0.15)] backdrop-blur-sm"
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
      <div>
        <div className="mb-3 pb-1 group relative">
          <h2 className="text-base font-medium relative flex items-center">
            <span className="text-[#00d9ff] uppercase tracking-widest text-sm">第二协作组工作进度</span>
          </h2>
        </div>
        <WorkProgressChart data={workProgressData} height={250} />
      </div>
    </section>
  );
};

export default LeftTopBar; 