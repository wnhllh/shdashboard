import React from 'react';
import type { DashboardData, HighRiskEvent, ProvinceWarning } from '@/types/data';
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
      className="flex flex-col h-full gap-3 shrink-0 border-2 border-[#00d9ff]/30 rounded-lg p-2 bg-black/20 shadow-[0_0_20px_rgba(0,217,255,0.3)]"
      style={{ flexBasis: width, maxWidth: width, minWidth: width }}
    >
      {/* 邮件通知 */}
      <EmailNotification />
      <div
        className="bg-black p-4 rounded-lg shadow-glow-blue flex-grow min-h-0 border border-[#00d9ff]/20"
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
                  <div key={`original-${alert.id}`} className="flex flex-col py-2 px-3 bg-slate-800/60 rounded-lg mb-3" style={{height: '108px', minHeight: '108px'}}>
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
                  <div key={`repeat-${alert.id}`} className="flex flex-col py-2 px-3 bg-slate-800/60 rounded-lg mb-3" style={{height: '108px', minHeight: '108px'}}>
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

      {/* 网省预警 */}
      <div
        className="bg-black p-4 rounded-lg shadow-glow-blue flex-grow min-h-0 border border-[#00d9ff]/20"
        style={{ minHeight: '30%' }}
      >
        <h2 className="text-base font-medium relative flex items-center mb-3">
          <span className="text-[#00d9ff] uppercase tracking-widest text-lg">网省预警</span>
        </h2>
        {dashboardData.provinceWarnings && dashboardData.provinceWarnings.length > 0 ? (
          <div className="h-full overflow-hidden relative">
            {/* 未闭环预警 - 上层滑动 */}
            <div className="absolute inset-0 z-10">
              <div className="h-1/2 overflow-hidden">
                <h3 className="text-xs text-red-400 mb-2 font-medium">未闭环预警</h3>
                <div className="h-full overflow-hidden px-1 pt-1">
                  {dashboardData.provinceWarnings.filter(warning => !warning.is_closed).length > 0 ? (
                    <div
                      className="infinite-scroll-list"
                      style={{
                        animation: `provinceWarningScroll ${dashboardData.provinceWarnings.filter(warning => !warning.is_closed).length * 4}s infinite ease-in-out`
                      }}
                    >
                      <style>{`
                        @keyframes provinceWarningScroll {
                          ${dashboardData.provinceWarnings.filter(warning => !warning.is_closed).map((_, index) => {
                            const totalItems = dashboardData.provinceWarnings?.filter(warning => !warning.is_closed).length || 0;
                            const itemDuration = 100 / totalItems;
                            const stayPercent = itemDuration * 0.75;
                            const startPercent = index * itemDuration;
                            const stayEndPercent = startPercent + stayPercent;
                            const endPercent = (index + 1) * itemDuration;
                            const currentPosition = -index * 60;
                            const nextPosition = -(index + 1) * 60;
                            return `
                              ${startPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                              ${stayEndPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                              ${endPercent.toFixed(2)}% { transform: translateY(${nextPosition}px); }
                            `;
                          }).join('')}
                          100% { transform: translateY(-${(dashboardData.provinceWarnings?.filter(warning => !warning.is_closed).length || 0) * 60}px); }
                        }
                      `}</style>
                      {/* 原始未闭环列表 */}
                      {dashboardData.provinceWarnings.filter(warning => !warning.is_closed).map((warning) => (
                        <div key={`unclosed-${warning.id}`} className="flex items-center justify-between py-1 px-2 bg-red-900/40 rounded mb-1 border border-red-500/40" style={{height: '56px', minHeight: '56px'}}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className={`text-xxs font-bold px-1.5 py-0.5 rounded ${warning.level === '高' ? 'bg-red-500/30 text-red-200' : warning.level === '中' ? 'bg-orange-500/30 text-orange-200' : 'bg-yellow-500/30 text-yellow-200'}`}>{warning.level}</span>
                              <span className="text-xxs text-slate-300 font-medium">{warning.province}</span>
                              <span className="text-xxs text-slate-500">#{warning.warning_id}</span>
                            </div>
                            <h4 className="font-medium text-red-200 text-xs leading-tight truncate mb-0.5">{warning.title}</h4>
                            <div className="flex items-center gap-2 text-xxs text-slate-400">
                              <span>反馈: {warning.feedback_person}</span>
                              <span>下发: {new Date(warning.publish_time).toLocaleDateString()}</span>
                              <span className="text-orange-300">截止: {new Date(warning.deadline_time).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center ml-2">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse mb-0.5"></div>
                            <span className="text-xxs text-red-400 font-bold">未闭环</span>
                          </div>
                        </div>
                      ))}
                      {/* 重复未闭环列表 */}
                      {dashboardData.provinceWarnings.filter(warning => !warning.is_closed).map((warning) => (
                        <div key={`unclosed-repeat-${warning.id}`} className="flex items-center justify-between py-1 px-2 bg-red-900/40 rounded mb-1 border border-red-500/40" style={{height: '56px', minHeight: '56px'}}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className={`text-xxs font-bold px-1.5 py-0.5 rounded ${warning.level === '高' ? 'bg-red-500/30 text-red-200' : warning.level === '中' ? 'bg-orange-500/30 text-orange-200' : 'bg-yellow-500/30 text-yellow-200'}`}>{warning.level}</span>
                              <span className="text-xxs text-slate-300 font-medium">{warning.province}</span>
                              <span className="text-xxs text-slate-500">#{warning.warning_id}</span>
                            </div>
                            <h4 className="font-medium text-red-200 text-xs leading-tight truncate mb-0.5">{warning.title}</h4>
                            <div className="flex items-center gap-2 text-xxs text-slate-400">
                              <span>反馈: {warning.feedback_person}</span>
                              <span>下发: {new Date(warning.publish_time).toLocaleDateString()}</span>
                              <span className="text-orange-300">截止: {new Date(warning.deadline_time).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center ml-2">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse mb-0.5"></div>
                            <span className="text-xxs text-red-400 font-bold">未闭环</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs">暂无未闭环预警</p>
                  )}
                </div>
              </div>
            </div>

            {/* 已闭环预警 - 下层背景 */}
            <div className="absolute inset-0 z-0">
              <div className="h-full pt-20 overflow-hidden">
                <h3 className="text-xs text-green-400 mb-2 font-medium">已闭环预警</h3>
                <div className="h-full overflow-y-auto pr-1">
                  {dashboardData.provinceWarnings.filter(warning => warning.is_closed).length > 0 ? (
                    dashboardData.provinceWarnings.filter(warning => warning.is_closed).slice(0, 5).map((warning) => (
                      <div key={`closed-${warning.id}`} className="flex items-center justify-between py-2 px-3 bg-green-900/20 rounded-lg mb-2 border border-green-500/20 opacity-70" style={{height: '72px', minHeight: '72px'}}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xxs font-medium px-2 py-0.5 rounded ${warning.level === '高' ? 'bg-green-500/25 text-green-300' : warning.level === '中' ? 'bg-green-500/25 text-green-300' : 'bg-green-500/25 text-green-300'}`}>{warning.level}</span>
                            <span className="text-xxs text-slate-500">{warning.province}</span>
                          </div>
                          <h4 className="font-medium text-green-300 text-xs leading-tight truncate">{warning.title}</h4>
                          <p className="text-slate-500 text-xxs truncate">{warning.closed_by} • {warning.closed_time ? new Date(warning.closed_time).toLocaleDateString() : ''}</p>
                        </div>
                        <div className="flex flex-col items-center ml-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                          <span className="text-xxs text-green-400 font-medium">已闭环</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs">暂无已闭环预警</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-xs pl-1">无网省预警</p>
        )}
      </div>

      <div
        className="bg-black p-4 rounded-lg shadow-glow-blue flex-grow min-h-0 border border-[#00d9ff]/20"
        style={{ minHeight: '35%' }}
      >
        <h3 className="text-xs font-medium text-[#00d9ff] uppercase tracking-wider mb-2">预警平台</h3>
        {/* 选项卡切换 */}
        <div className="flex mb-3 relative">
          <div className="flex bg-black/80 rounded-lg p-1 relative">
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
                        {highRiskEvents.filter(item => 
                          item.alert_type.includes('主机') || 
                          item.alert_type.includes('病毒') || 
                          item.alert_type.includes('木马') || 
                          item.alert_type.includes('漏洞') || 
                          item.alert_type.includes('登录') || 
                          item.alert_type.includes('进程') || 
                          item.alert_type.includes('勒索') || 
                          item.alert_type.includes('挖矿') || 
                          item.alert_type.includes('口令') || 
                          item.alert_type.includes('外联')
                        ).slice(0, 8).map((item, idx) => (
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