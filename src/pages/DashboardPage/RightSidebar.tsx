import React from 'react';
import type { SankeyData, AttackTypeDistribution, DashboardData, HighRiskEvent } from '@/types/data';
import D3SankeyAttackedSystemsChart from '@/components/charts/D3SankeyAttackedSystemsChart';
import D3AttackTypeDistributionChart from '@/components/charts/D3AttackTypeDistributionChart';

interface RightSidebarProps {
  sankeyAttackedSystemsData: SankeyData | null;
  attackTypeDistribution: AttackTypeDistribution | null;
  dashboardData: Partial<DashboardData>;
  highRiskEvents: HighRiskEvent[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  sankeyAttackedSystemsData,
  attackTypeDistribution,
  dashboardData,
  highRiskEvents,
}) => {
  return (
    <section className="basis-[28%] flex flex-col h-full gap-3 shrink-0">
      <div className="flex flex-col space-y-3 overflow-y-auto bg-slate-900 bg-opacity-40 backdrop-blur-md p-4 rounded-lg shadow-glow-blue flex-grow-[2]" style={{maxHeight: '66.66%'}}>
        <div>
          <div className="mb-3 pb-1 group relative">
            <h2 className="text-base font-medium relative flex items-center">
              <span className="text-[#00d9ff] uppercase tracking-widest text-sm">受攻击系统流向</span>
            </h2>
          </div>
          {sankeyAttackedSystemsData ? (
            <D3SankeyAttackedSystemsChart data={sankeyAttackedSystemsData} height={180} />
          ) : <p className="text-slate-500 text-xs">无Sankey数据</p>}
        </div>
        <div>
          <div className="mb-3 pb-1 group relative">
            <h2 className="text-base font-medium relative flex items-center">
              <span className="text-[#00d9ff] uppercase tracking-widest text-sm">攻击类型分布</span>
            </h2>
          </div>
          {attackTypeDistribution && attackTypeDistribution.types.length > 0 ? (
            <D3AttackTypeDistributionChart data={attackTypeDistribution.types} idSuffix="attack-types-pie" height={200} />
          ) : <p className="text-slate-500 text-xs">无攻击类型数据</p>}
        </div>
      </div>
      <div className="bg-slate-900 bg-opacity-40 backdrop-blur-md p-4 rounded-lg shadow-glow-blue flex-grow min-h-0">
        <h2 className="text-base font-medium relative flex items-center mb-3">
          <span className="text-[#00d9ff] uppercase tracking-widest text-lg">S6000 网省联动</span>
        </h2>
        {dashboardData.securityAlerts && dashboardData.securityAlerts.length > 0 ? (
          <div className="h-full overflow-y-auto pr-1 security-alerts-container">
            <ul className="space-y-3 text-xs pt-1">
              {dashboardData.securityAlerts.map(alert => {
                // 提取纯文本内容摘要（去除HTML标签）
                const getTextContent = (html: string) => {
                  const div = document.createElement('div');
                  div.innerHTML = html;
                  return div.textContent || div.innerText || '';
                };
                const contentPreview = getTextContent(alert.content).substring(0, 80) + '...';
                
                return (
                  <li key={alert.id} className="flex flex-col py-2 px-3 bg-slate-800/60 rounded-lg border-l-2 border-[#00d9ff]/50">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-[#00d9ff] text-xxs font-medium bg-[#00d9ff]/10 px-2 py-0.5 rounded">
                        {alert.category}
                      </span>
                      <span className="text-slate-500 text-xxs">{alert.news_id}</span>
                    </div>
                    <h3 className="font-semibold text-[#ffb74d] text-sm mb-1 leading-tight">{alert.title}</h3>
                    <p className="text-slate-300 text-xxs mb-2 leading-relaxed">{contentPreview}</p>
                    <div className="flex items-center justify-between text-xxs text-slate-400">
                      <span>发布: {alert.creator}</span>
                      <div className="flex items-center gap-2">
                        <span>👁 {alert.hits}</span>
                        <span>{new Date(alert.publish_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : <p className="text-slate-500 text-xs pl-1">无安全预警</p>}
      </div>
       <div className="bg-slate-900 bg-opacity-40 backdrop-blur-md p-4 rounded-lg shadow-glow-blue flex-grow min-h-0">
        <h3 className="text-xs font-medium text-[#00d9ff] uppercase tracking-wider mb-2">预警平台 高危攻击事件&主机安全事件</h3>
        <div className="overflow-x-auto rounded">
          <table className="min-w-full text-xs text-left text-gray-200">
            <thead className="text-[#00d9ff] bg-[#0f2744dd]">
              <tr>
                <th className="px-3 py-2">源IP</th><th className="px-3 py-2">目的IP</th>
                <th className="px-3 py-2">告警类型</th><th className="px-3 py-2">等级</th><th className="px-3 py-2">状态</th>
              </tr>
            </thead>
            <tbody>
              {highRiskEvents.map((item, idx) => (
                <tr key={idx} className={`border-b border-[#00d9ff]/10 ${idx % 2 === 0 ? 'bg-[#112240dd]' : 'bg-[#0d1a30dd]'}`}>
                  <td className="px-3 py-2">{item.src_ip}</td><td className="px-3 py-2">{item.dst_ip}</td>
                  <td className="px-3 py-2">{item.alert_type}</td><td className="px-3 py-2">{item.alert_level}</td>
                  <td className="px-3 py-2">
                    <span className={item.attack_status === '成功' ? 'text-red-400' : 'text-green-400'}>{item.attack_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default RightSidebar; 