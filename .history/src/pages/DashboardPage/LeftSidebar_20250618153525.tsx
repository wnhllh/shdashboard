import React from 'react';
import type { OverallStats, AttackSourceInfo } from '@/types/data';
// import EmailNotification from '@/components/EmailNotification';
import DeviceStatusPanel from '@/components/DeviceStatusPanel';
import SmartIPCards from '@/components/charts/SmartIPCards';
import InterceptionRateChart from '@/components/charts/InterceptionRateChart';
import DDoSMonitoringCharts from '@/components/charts/DDoSMonitoringCharts';

interface LeftSidebarProps {
  overallStats: OverallStats | null;
  attackSourceInfo: AttackSourceInfo | null;
  width: string;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ overallStats, attackSourceInfo, width }) => {
  const techBlueMain = '#00d9ff';

  return (
    <section
      className="bg-black p-4 rounded-lg shadow-glow-blue overflow-y-auto flex flex-col space-y-3 shrink-0 border-2 border-[#00d9ff]/30 shadow-[0_0_20px_rgba(0,217,255,0.3)]"
      style={{ flexBasis: width, maxWidth: width, minWidth: width }}
    >
      {/* 设备状态监控面板 */}
      <DeviceStatusPanel />
      {/* <div>
        <div className="mb-3 pb-1 group relative">
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00d9ff] to-transparent bottom-0"></div>
          <h2 className="text-base font-medium relative flex items-center">
            <span className="w-1 h-4 bg-[#00d9ff] mr-2 shadow-[0_0_8px_#00d9ff] rounded-sm"></span>
            <span className="text-[#00d9ff] uppercase tracking-widest text-sm">总体攻击数据</span>
          </h2>
        </div>
        {overallStats ? (
          <ul className="space-y-2 text-xs pl-1 mt-2">
             <li className="flex justify-between items-center p-1 hover:bg-black/40 rounded transition-colors">
                <span className="text-slate-300">总攻击:</span> 
                <span className="font-medium text-[#ffb74d]">{overallStats.totalAttacks.toLocaleString()}</span>
            </li>
            <li className="flex justify-between items-center p-1 hover:bg-black/40 rounded transition-colors">
                <span className="text-slate-300">国内攻击:</span> 
                <span className="font-medium text-[#56ccf2]">{overallStats.domesticAttacks.toLocaleString()}</span>
            </li>
            <li className="flex justify-between items-center p-1 hover:bg-black/40 rounded transition-colors">
                <span className="text-slate-300">国外攻击:</span> 
                <span className="font-medium text-[#ff6d6d]">{overallStats.foreignAttacks.toLocaleString()}</span>
            </li>
            <li className="flex justify-between items-center p-1 hover:bg-black/40 rounded transition-colors">
                <span className="text-slate-300">已阻断:</span> 
                <span className="font-medium text-[#4ade80]">{overallStats.blockedAttacks.toLocaleString()}</span>
            </li>
          </ul>
        ) : <p className="text-slate-500 text-xs">无总体数据</p>}
      </div> */}

      {/* {attackSourceInfo && (
        <div>
          <div className="mb-2 bg-black/80 px-2 py-1 border-b border-[#00d9ff]/40 flex items-center">
            <h3 className="text-xs font-medium text-[#00d9ff] uppercase tracking-wider">TOP 5 攻击源 IP</h3>
          </div>
            {attackSourceInfo.topSourceIPs.length > 0 ? (
              <SmartIPCards data={attackSourceInfo.topSourceIPs.map(item => ({...item}))} baseColor={techBlueMain} />
            ) : <p className="text-slate-500 text-xs">无IP源数据</p>}
        </div>
      )} */}

      <div className="pt-2">
        <div className="mb-3 pb-1 group relative">
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00d9ff] to-transparent bottom-0"></div>
          <h2 className="text-base font-medium relative flex items-center">
            <span className="w-1 h-4 bg-[#00d9ff] mr-2 shadow-[0_0_8px_#00d9ff] rounded-sm"></span>
            <span className="text-[#00d9ff] uppercase tracking-widest text-sm">抗DDoS监测</span>
          </h2>
        </div>
        <DDoSMonitoringCharts />
      </div>

      <div className="pt-2">
        <div className="mb-2 bg-black/80 px-2 py-1 border-b border-[#00d9ff]/40">
          <h3 className="text-xs font-medium text-[#00d9ff] uppercase tracking-wider">真实拦截率</h3>
        </div>
        <InterceptionRateChart />
      </div>
    </section>
  );
};

export default LeftSidebar; 