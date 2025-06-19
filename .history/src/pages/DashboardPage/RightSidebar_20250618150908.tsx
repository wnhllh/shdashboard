import React from 'react';
import type { DashboardData, HighRiskEvent } from '@/types/data';
import { useState, useEffect } from 'react';
import EmailNotification from '@/components/EmailNotification';

interface RightSidebarProps {
  dashboardData: Partial<DashboardData>;
  highRiskEvents: HighRiskEvent[];
  width: string;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  dashboardData,
  highRiskEvents,
  width,
}) => {
  const [activeTab, setActiveTab] = useState<'attack' | 'host'>('attack');

  // 自动切换功能
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab(prev => prev === 'attack' ? 'host' : 'attack');
    }, 5000); // 每5秒切换一次

    return () => clearInterval(interval);
  }, []);

  // 根据类别返回不同的颜色样式
  const getCategoryStyle = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('预警') || categoryLower.includes('警告')) {
      return 'text-red-400 bg-red-400/10';
    } else if (categoryLower.includes('通知') || categoryLower.includes('公告')) {
      return 'text-blue-400 bg-blue-400/10';
    } else if (categoryLower.includes('安全') || categoryLower.includes('防护')) {
      return 'text-green-400 bg-green-400/10';
    } else if (categoryLower.includes('漏洞') || categoryLower.includes('风险')) {
      return 'text-orange-400 bg-orange-400/10';
    } else if (categoryLower.includes('威胁') || categoryLower.includes('攻击')) {
      return 'text-purple-400 bg-purple-400/10';
    }
    return 'text-[#00d9ff] bg-[#00d9ff]/10'; // 默认颜色
  };

  return (
    <section
      className="flex flex-col h-full gap-4 shrink-0 border border-[#00d9ff]/15 rounded-2xl p-4 bg-gradient-to-b from-slate-900/20 to-black/40 shadow-[0_0_40px_rgba(0,217,255,0.08),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md relative"
      style={{ flexBasis: width, maxWidth: width, minWidth: width }}
    >
      {/* 邮件通知 */}
      <EmailNotification />
      <div
        className="bg-gradient-to-br from-slate-800/10 to-slate-900/20 p-4 rounded-xl shadow-[0_0_25px_rgba(0,217,255,0.06),inset_0_1px_0_rgba(255,255,255,0.03)] flex-grow min-h-0 border border-[#00d9ff]/8 backdrop-blur-sm"
        style={{ maxHeight: '100%', overflowY: 'auto' }}
      >
        <h2 className="text-base font-medium relative flex items-center mb-3">
          <span className="text-[#00d9ff] uppercase tracking-widest text-lg">S6000 网省联动</span>
        </h2>
        {dashboardData.securityAlerts && dashboardData.securityAlerts.length > 0 ? (
          <div className="h-full overflow-hidden pr-1 security-alerts-container relative">
            <div 
              className="infinite-scroll-list"
              style={{
                animation: `infiniteScroll ${dashboardData.securityAlerts.length * 4}s infinite ease-in-out`
              }}
            >
              <style>{`
                  @keyframes infiniteScroll {
                    ${(dashboardData.securityAlerts || []).map((_, index) => {
                      const totalItems = dashboardData.securityAlerts?.length || 0;
                    const itemDuration = 100 / totalItems;
                    const stayPercent = itemDuration * 0.75;
                      const startPercent = index * itemDuration;
                      const stayEndPercent = startPercent + stayPercent;
                      const endPercent = (index + 1) * itemDuration;
                      const currentPosition = -index * 120;
                      const nextPosition = -(index + 1) * 120;
                      return `
                        ${startPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                        ${stayEndPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                        ${endPercent.toFixed(2)}% { transform: translateY(${nextPosition}px); }
                      `;
                    }).join('')}
                    100% { transform: translateY(-${(dashboardData.securityAlerts?.length || 0) * 120}px); }
                  }
              `}</style>
              {/* 原始列表 */}
              {dashboardData.securityAlerts.map((alert) => {
                const getTextContent = (html: string) => {
                  const div = document.createElement('div');
                  div.innerHTML = html;
                  return div.textContent || div.innerText || '';
                };
                const contentPreview = getTextContent(alert.content).substring(0, 80) + '...';
                return (
                  <div key={`original-${alert.id}`} className="flex flex-col py-2 px-3 bg-gradient-to-br from-slate-800/20 to-slate-900/30 rounded-lg mb-3 border border-slate-700/10 shadow-[0_0_15px_rgba(0,217,255,0.04)] backdrop-blur-sm" style={{height: '108px', minHeight: '108px'}}>
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xxs font-medium px-2 py-0.5 rounded ${getCategoryStyle(alert.category)}`}>{alert.category}</span>
                        <h3 className="font-semibold text-[#ffb74d] text-sm leading-tight">{alert.title}</h3>
                      </div>
                    </div>
                    <p className="text-slate-300 text-xxs mb-2 leading-relaxed">{contentPreview}</p>
                    <div className="flex items-center justify-between text-xxs text-slate-400">
                      <span>发布: {alert.creator}</span>
                      <div className="flex items-center gap-2">
                        <span>{alert.news_id}</span>
                        <span>{new Date(alert.publish_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* 重复列表以实现无缝循环 */}
              {dashboardData.securityAlerts.map((alert) => {
                const getTextContent = (html: string) => {
                  const div = document.createElement('div');
                  div.innerHTML = html;
                  return div.textContent || div.innerText || '';
                };
                const contentPreview = getTextContent(alert.content).substring(0, 80) + '...';
                return (
                  <div key={`repeat-${alert.id}`} className="flex flex-col py-2 px-3 bg-gradient-to-br from-slate-800/20 to-slate-900/30 rounded-lg mb-3 border border-slate-700/10 shadow-[0_0_15px_rgba(0,217,255,0.04)] backdrop-blur-sm" style={{height: '108px', minHeight: '108px'}}>
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xxs font-medium px-2 py-0.5 rounded ${getCategoryStyle(alert.category)}`}>{alert.category}</span>
                        <h3 className="font-semibold text-[#ffb74d] text-sm leading-tight">{alert.title}</h3>
                      </div>
                    </div>
                    <p className="text-slate-300 text-xxs mb-2 leading-relaxed">{contentPreview}</p>
                    <div className="flex items-center justify-between text-xxs text-slate-400">
                      <span>发布: {alert.creator}</span>
                      <div className="flex items-center gap-2">
                        <span>{alert.news_id}</span>
                        <span>{new Date(alert.publish_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : <p className="text-slate-500 text-xs pl-1">无安全预警</p>}
      </div>
      <div
        className="bg-gradient-to-br from-slate-800/10 to-slate-900/20 p-4 rounded-xl shadow-[0_0_25px_rgba(0,217,255,0.06),inset_0_1px_0_rgba(255,255,255,0.03)] flex-grow min-h-0 border border-[#00d9ff]/8 backdrop-blur-sm"
        style={{ minHeight: '45%' }}
      >
        <h3 className="text-xs font-medium text-[#00d9ff] uppercase tracking-wider mb-2">预警平台</h3>
        {/* 选项卡切换 */}
        <div className="flex mb-3 relative">
          <div className="flex bg-black/40 rounded-lg p-1 relative border border-slate-700/20 shadow-inner">
            <button
              onClick={() => setActiveTab('attack')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${activeTab === 'attack' ? 'bg-[#00d9ff]/20 text-[#00d9ff] shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}
            >高危攻击事件</button>
            <button
              onClick={() => setActiveTab('host')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${activeTab === 'host' ? 'bg-[#00d9ff]/20 text-[#00d9ff] shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}
            >主机安全事件</button>
          </div>
          {/* 自动切换指示器 */}
          <div className="ml-2 flex items-center">
            <div className="w-2 h-2 bg-[#00d9ff] rounded-full animate-pulse"></div>
            <span className="ml-1 text-xs text-slate-400">自动切换</span>
          </div>
        </div>
        {/* 内容区域 */}
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(${activeTab === 'attack' ? '0%' : '-100%'})` }}>
            {/* 高危攻击事件 */}
            <div className="w-full flex-shrink-0">
              <div className="overflow-hidden">
                <div className="rounded-md overflow-hidden border border-slate-700/30 max-h-48">
                  <div className="overflow-y-auto max-h-48">
                    <table className="min-w-full text-xs table-fixed">
                      <colgroup>
                        <col className="min-w-[96px] max-w-[140px]" />
                        <col className="min-w-[96px] max-w-[140px]" />
                        <col className="w-12" />
                        <col className="w-10" />
                        <col className="w-10" />
                      </colgroup>
                      <thead className="sticky top-0">
                        <tr className="bg-slate-800/90 border-b border-slate-600/40">
                          <th className="px-1 py-2 text-left text-[#00d9ff] font-medium text-xs">源IP</th>
                          <th className="px-1 py-2 text-left text-[#00d9ff] font-medium text-xs">目的IP</th>
                          <th className="px-2 py-2 text-left text-[#00d9ff] font-medium text-xs">攻击类型</th>
                          <th className="px-1 py-2 text-left text-[#00d9ff] font-medium text-xs">级</th>
                          <th className="px-1 py-2 text-left text-[#00d9ff] font-medium text-xs">状态</th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-900/60">
                        {highRiskEvents.filter(item => item.alert_type.includes('攻击') || item.alert_type.includes('入侵')).slice(0, 8).map((item, idx) => (
                          <tr key={`attack-${idx}`} className={`border-b border-slate-700/20 hover:bg-slate-700/30 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/50'}`}>
                            <td className="px-1 py-1.5 font-mono text-xs text-slate-300 truncate" title={item.src_ip}>{item.src_ip}</td>
                            <td className="px-1 py-1.5 font-mono text-xs text-slate-300 truncate" title={item.dst_ip}>{item.dst_ip}</td>
                            <td className="px-2 py-1.5">
                              <span className="px-1.5 py-0.5 bg-red-500/25 text-red-300 rounded text-xs font-medium block truncate" title={item.alert_type}>{item.alert_type}</span>
                            </td>
                            <td className="px-1 py-1.5">
                              <span className={`px-1 py-0.5 rounded text-xs font-medium ${item.alert_level === '高' ? 'bg-red-500/25 text-red-300' : item.alert_level === '中' ? 'bg-orange-500/25 text-orange-300' : 'bg-yellow-500/25 text-yellow-300'}`}>{item.alert_level}</span>
                            </td>
                            <td className="px-1 py-1.5">
                              <span className={`px-1 py-0.5 rounded text-xs font-medium ${item.attack_status === '成功' ? 'bg-red-500/25 text-red-300' : 'bg-green-500/25 text-green-300'}`}>{item.attack_status === '成功' ? '成功' : '失败'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {/* 主机安全事件 */}
            <div className="w-full flex-shrink-0">
              <div className="overflow-hidden">
                <div className="rounded-md overflow-hidden border border-slate-700/30 max-h-48">
                  <div className="overflow-y-auto max-h-48">
                    <table className="min-w-full text-xs table-fixed">
                      <colgroup>
                        <col className="min-w-[96px] max-w-[140px]" />
                        <col className="w-12" />
                        <col className="w-10" />
                        <col className="w-12" />
                        <col className="w-12" />
                      </colgroup>
                      <thead className="sticky top-0">
                        <tr className="bg-slate-800/90 border-b border-slate-600/40">
                          <th className="px-1 py-2 text-left text-[#00d9ff] font-medium text-xs">主机IP</th>
                          <th className="px-2 py-2 text-left text-[#00d9ff] font-medium text-xs">事件类型</th>
                          <th className="px-1 py-2 text-left text-[#00d9ff] font-medium text-xs">级</th>
                          <th className="px-1 py-2 text-left text-[#00d9ff] font-medium text-xs">状态</th>
                          <th className="px-1 py-2 text-left text-[#00d9ff] font-medium text-xs">时间</th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-900/60">
                        {highRiskEvents.filter(item => item.alert_type.includes('主机') || item.alert_type.includes('病毒') || item.alert_type.includes('木马')).slice(0, 8).map((item, idx) => (
                          <tr key={`host-${idx}`} className={`border-b border-slate-700/20 hover:bg-slate-700/30 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/50'}`}>
                            <td className="px-1 py-1.5 font-mono text-xs text-slate-300 truncate" title={item.dst_ip}>{item.dst_ip}</td>
                            <td className="px-2 py-1.5">
                              <span className="px-1.5 py-0.5 bg-purple-500/25 text-purple-300 rounded text-xs font-medium block truncate" title={item.alert_type}>{item.alert_type}</span>
                            </td>
                            <td className="px-1 py-1.5">
                              <span className={`px-1 py-0.5 rounded text-xs font-medium ${item.alert_level === '高' ? 'bg-red-500/25 text-red-300' : item.alert_level === '中' ? 'bg-orange-500/25 text-orange-300' : 'bg-yellow-500/25 text-yellow-300'}`}>{item.alert_level}</span>
                            </td>
                            <td className="px-1 py-1.5">
                              <span className={`px-1 py-0.5 rounded text-xs font-medium truncate ${item.attack_status === '成功' ? 'bg-green-500/25 text-green-300' : item.attack_status === '阻断' ? 'bg-blue-500/25 text-blue-300' : 'bg-red-500/25 text-red-300'}`}>{item.attack_status.length > 2 ? item.attack_status.substring(0, 2) : item.attack_status}</span>
                            </td>
                            <td className="px-1 py-1.5 text-slate-400 font-mono text-xs">{new Date().toLocaleTimeString('zh-CN', { hour12: false }).substring(0, 5)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;