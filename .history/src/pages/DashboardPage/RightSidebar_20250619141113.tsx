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
  const [activeWarningTab, setActiveWarningTab] = useState<'unclosed' | 'closed'>('unclosed');

  // 自动切换功能
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab(prev => prev === 'attack' ? 'host' : 'attack');
    }, 5000); // 每5秒切换一次

    return () => clearInterval(interval);
  }, []);



  return (
    <section
      className="flex flex-col h-full gap-3 shrink-0 border-2 border-[#00d9ff]/30 rounded-lg p-2 bg-black/20 shadow-[0_0_20px_rgba(0,217,255,0.3)]"
      style={{ flexBasis: width, maxWidth: width, minWidth: width }}
    >
      {/* 邮件通知 */}
      <EmailNotification />

      {/* S6000 网省联动 - 瀑布流布局 */}
      <div
        className="bg-black p-3 rounded-lg shadow-glow-blue flex-grow min-h-0 border border-[#00d9ff]/20 overflow-y-auto"
        style={{ minHeight: '35%' }}
      >
        <h2 className="text-sm font-medium relative flex items-center justify-between mb-3">
          <span className="text-[#00d9ff] uppercase tracking-widest">S6000 网省联动</span>
        </h2>

        {/* 瀑布流内容区域 */}
        <div className="space-y-4">
          {/* 1. 工作任务 - 三栏布局 */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/50">
            <div className="px-3 py-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-orange-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                工作任务
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded border border-orange-500/30">
                  待处理 {dashboardData.workTasks?.filter(t => t.feedback_status === '未反馈').length || 0}
                </span>
                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded border border-green-500/30">
                  已完成 {dashboardData.workTasks?.filter(t => t.feedback_status === '已反馈').length || 0}
                </span>
              </div>
            </div>

            {dashboardData.workTasks && dashboardData.workTasks.length > 0 ? (
              <div className="p-3 space-y-3">
                {/* 状态概览 */}
                <div className="bg-slate-800/50 rounded-lg p-2">
                  {dashboardData.workTasks.filter(t => t.feedback_status === '未反馈').length > 0 ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div>
                          <div className="text-sm text-orange-300 font-medium">
                            {dashboardData.workTasks.filter(t => t.feedback_status === '未反馈').length} 个任务待处理
                          </div>
                          <div className="text-xs text-slate-400">
                            最近截止: {dashboardData.workTasks
                              .filter(t => t.feedback_status === '未反馈')
                              .sort((a, b) => new Date(a.deadline_time).getTime() - new Date(b.deadline_time).getTime())[0]?.deadline_time
                              ? new Date(dashboardData.workTasks
                                  .filter(t => t.feedback_status === '未反馈')
                                  .sort((a, b) => new Date(a.deadline_time).getTime() - new Date(b.deadline_time).getTime())[0].deadline_time
                                ).toLocaleDateString()
                              : '无'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/30">
                        需关注
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-300 font-medium">所有任务已完成</span>
                    </div>
                  )}
                </div>

                {/* 待处理任务 */}
                {dashboardData.workTasks.filter(t => t.feedback_status === '未反馈').length > 0 && (
                  <div>
                    <div className="text-xs text-slate-400 mb-1 px-1">待处理任务</div>
                    <div className="h-44 overflow-hidden bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <div
                        className="infinite-scroll-list p-2"
                        style={{
                          animation: `workTasksUnfinishedScroll ${dashboardData.workTasks.filter(t => t.feedback_status === '未反馈').length * 6}s infinite ease-in-out`
                        }}
                      >
                        <style>{`
                          @keyframes workTasksUnfinishedScroll {
                            ${dashboardData.workTasks.filter(t => t.feedback_status === '未反馈').map((_, index) => {
                              const totalItems = dashboardData.workTasks?.filter(t => t.feedback_status === '未反馈').length || 0;
                              const itemDuration = 100 / totalItems;
                              const stayPercent = itemDuration * 0.85;
                              const startPercent = index * itemDuration;
                              const stayEndPercent = startPercent + stayPercent;
                              const endPercent = (index + 1) * itemDuration;
                              const currentPosition = -index * 85;
                              const nextPosition = -(index + 1) * 85;
                              return `
                                ${startPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                                ${stayEndPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                                ${endPercent.toFixed(2)}% { transform: translateY(${nextPosition}px); }
                              `;
                            }).join('')}
                            100% { transform: translateY(-${(dashboardData.workTasks?.filter(t => t.feedback_status === '未反馈').length || 0) * 85}px); }
                          }
                        `}</style>
                        {dashboardData.workTasks.filter(t => t.feedback_status === '未反馈').map((task) => (
                          <div key={`task-unfinished-${task.id}`} className="bg-slate-800/60 hover:bg-slate-700/60 rounded-lg p-3 mb-2 border border-orange-500/40 transition-colors" style={{height: '85px', minHeight: '85px'}}>
                            <div className="flex items-start gap-3 h-full">
                              <div className="flex-shrink-0">
                                <span className="inline-block px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded border-2 border-orange-400">
                                  {task.type}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-yellow-400 text-sm leading-tight mb-1">{task.title}</h4>
                                <p className="text-white text-xs leading-relaxed mb-2 line-clamp-2">{task.description}</p>
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span>发布: {new Date(task.publish_time).toLocaleDateString()}</span>
                                  <span>截止: {new Date(task.deadline_time).toLocaleDateString()}</span>
                                  <span className="text-orange-300">#{task.task_id}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {dashboardData.workTasks.filter(t => t.feedback_status === '未反馈').map((task) => (
                          <div key={`task-unfinished-repeat-${task.id}`} className="bg-slate-800/60 hover:bg-slate-700/60 rounded-lg p-3 mb-2 border border-orange-500/40 transition-colors" style={{height: '85px', minHeight: '85px'}}>
                            <div className="flex items-start gap-3 h-full">
                              <div className="flex-shrink-0">
                                <span className="inline-block px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded border-2 border-orange-400">
                                  {task.type}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-yellow-400 text-sm leading-tight mb-1">{task.title}</h4>
                                <p className="text-white text-xs leading-relaxed mb-2 line-clamp-2">{task.description}</p>
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span>发布: {new Date(task.publish_time).toLocaleDateString()}</span>
                                  <span>截止: {new Date(task.deadline_time).toLocaleDateString()}</span>
                                  <span className="text-orange-300">#{task.task_id}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 已完成任务 */}
                <div>
                  <div className="text-xs text-slate-400 mb-1 px-1">已完成任务</div>
                  <div className="h-36 overflow-hidden bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <div
                      className="infinite-scroll-list p-2"
                      style={{
                        animation: `workTasksFinishedScroll ${dashboardData.workTasks.filter(t => t.feedback_status === '已反馈').length * 6}s infinite ease-in-out`
                      }}
                    >
                      <style>{`
                        @keyframes workTasksFinishedScroll {
                          ${dashboardData.workTasks.filter(t => t.feedback_status === '已反馈').map((_, index) => {
                            const totalItems = dashboardData.workTasks?.filter(t => t.feedback_status === '已反馈').length || 0;
                            const itemDuration = 100 / totalItems;
                            const stayPercent = itemDuration * 0.85;
                            const startPercent = index * itemDuration;
                            const stayEndPercent = startPercent + stayPercent;
                            const endPercent = (index + 1) * itemDuration;
                            const currentPosition = -index * 70;
                            const nextPosition = -(index + 1) * 70;
                            return `
                              ${startPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                              ${stayEndPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                              ${endPercent.toFixed(2)}% { transform: translateY(${nextPosition}px); }
                            `;
                          }).join('')}
                          100% { transform: translateY(-${(dashboardData.workTasks?.filter(t => t.feedback_status === '已反馈').length || 0) * 70}px); }
                        }
                      `}</style>
                      {dashboardData.workTasks.filter(t => t.feedback_status === '已反馈').map((task) => (
                        <div key={`task-finished-${task.id}`} className="bg-slate-800/40 hover:bg-slate-700/40 rounded-lg p-3 mb-2 border border-slate-600/30 transition-colors opacity-80" style={{height: '65px', minHeight: '65px'}}>
                          <div className="flex items-start justify-between h-full">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-green-300">
                                  {task.task_id}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-slate-600/50 text-slate-400 rounded border border-slate-500/50">{task.type}</span>
                              </div>
                              <h4 className="font-semibold text-orange-400 text-sm leading-tight mb-1">{task.title}</h4>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">发布: {new Date(task.publish_time).toLocaleDateString()}</span>
                                <span className="text-green-400">反馈人: {task.feedback_person}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-400 mt-1">已完成</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {dashboardData.workTasks.filter(t => t.feedback_status === '已反馈').map((task) => (
                        <div key={`task-finished-repeat-${task.id}`} className="bg-slate-800/40 hover:bg-slate-700/40 rounded-lg p-3 mb-2 border border-slate-600/30 transition-colors opacity-80" style={{height: '65px', minHeight: '65px'}}>
                          <div className="flex items-start justify-between h-full">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-green-300">
                                  {task.task_id}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-slate-600/50 text-slate-400 rounded border border-slate-500/50">{task.type}</span>
                              </div>
                              <h4 className="font-semibold text-orange-400 text-sm leading-tight mb-1">{task.title}</h4>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">发布: {new Date(task.publish_time).toLocaleDateString()}</span>
                                <span className="text-green-400">反馈人: {task.feedback_person}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-400 mt-1">已完成</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs">无工作任务</p>
            )}
          </div>

          {/* 2. 工作通知 - 单栏布局 */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/50">
            <div className="px-3 py-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-orange-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                工作通知
              </h3>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 text-xs">
                {dashboardData.workNotifications?.length || 0} 条
              </span>
            </div>

            {dashboardData.workNotifications && dashboardData.workNotifications.length > 0 ? (
              <div className="p-3">
                <div className="h-44 overflow-hidden bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <div
                    className="infinite-scroll-list p-2"
                    style={{
                      animation: `workNotificationsScroll ${dashboardData.workNotifications.length * 6}s infinite ease-in-out`
                    }}
                  >
                    <style>{`
                      @keyframes workNotificationsScroll {
                        ${dashboardData.workNotifications.map((_, index) => {
                          const totalItems = dashboardData.workNotifications?.length || 0;
                          const itemDuration = 100 / totalItems;
                          const stayPercent = itemDuration * 0.85;
                          const startPercent = index * itemDuration;
                          const stayEndPercent = startPercent + stayPercent;
                          const endPercent = (index + 1) * itemDuration;
                          const currentPosition = -index * 85;
                          const nextPosition = -(index + 1) * 85;
                          return `
                            ${startPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                            ${stayEndPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                            ${endPercent.toFixed(2)}% { transform: translateY(${nextPosition}px); }
                          `;
                        }).join('')}
                        100% { transform: translateY(-${(dashboardData.workNotifications?.length || 0) * 85}px); }
                      }
                    `}</style>
                    {dashboardData.workNotifications.map((notification) => (
                      <div key={`notification-${notification.id}`} className="bg-slate-800/60 hover:bg-slate-700/60 rounded-lg p-3 mb-2 border border-slate-600/50 transition-colors" style={{height: '80px', minHeight: '80px'}}>
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-mono text-blue-300">
                            {notification.notification_id}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-slate-600/50 text-slate-300 rounded border border-slate-500/50">{notification.type}</span>
                        </div>
                        <h4 className="font-semibold text-orange-400 text-sm leading-tight mb-2">{notification.title}</h4>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>发布: {new Date(notification.publish_time).toLocaleDateString()}</span>
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                    {dashboardData.workNotifications.map((notification) => (
                      <div key={`notification-repeat-${notification.id}`} className="bg-slate-800/60 hover:bg-slate-700/60 rounded-lg p-3 mb-2 border border-slate-600/50 transition-colors" style={{height: '80px', minHeight: '80px'}}>
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-mono text-blue-300">
                            {notification.notification_id}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-slate-600/50 text-slate-300 rounded border border-slate-500/50">{notification.type}</span>
                        </div>
                        <h4 className="font-semibold text-orange-400 text-sm leading-tight mb-2">{notification.title}</h4>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>发布: {new Date(notification.publish_time).toLocaleDateString()}</span>
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3">
                <p className="text-slate-500 text-xs text-center">暂无工作通知</p>
              </div>
            )}
          </div>

          {/* 3. 攻击源预警 - 单栏布局 */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/50 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  攻击源预警
                </h3>
                <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-md text-xs">
                  {dashboardData.attackSourceWarnings?.length || 0} 条
                </span>
              </div>
            </div>

            {dashboardData.attackSourceWarnings && dashboardData.attackSourceWarnings.length > 0 ? (
              <div className="h-20 overflow-hidden bg-red-900/20 rounded border border-red-500/30">
                <div
                  className="infinite-scroll-list"
                  style={{
                    animation: `attackSourceScroll ${dashboardData.attackSourceWarnings.length * 4}s infinite ease-in-out`
                  }}
                >
                  <style>{`
                    @keyframes attackSourceScroll {
                      ${dashboardData.attackSourceWarnings.map((_, index) => {
                        const totalItems = dashboardData.attackSourceWarnings?.length || 0;
                        const itemDuration = 100 / totalItems;
                        const stayPercent = itemDuration * 0.75;
                        const startPercent = index * itemDuration;
                        const stayEndPercent = startPercent + stayPercent;
                        const endPercent = (index + 1) * itemDuration;
                        const currentPosition = -index * 75;
                        const nextPosition = -(index + 1) * 75;
                        return `
                          ${startPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                          ${stayEndPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                          ${endPercent.toFixed(2)}% { transform: translateY(${nextPosition}px); }
                        `;
                      }).join('')}
                      100% { transform: translateY(-${(dashboardData.attackSourceWarnings?.length || 0) * 75}px); }
                    }
                  `}</style>
                  {dashboardData.attackSourceWarnings.map((warning) => (
                    <div key={`attack-warning-${warning.id}`} className="flex flex-col py-2 px-3 bg-red-900/30 rounded-lg mb-2 border border-red-500/30" style={{height: '70px', minHeight: '70px'}}>
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xxs text-slate-400 font-medium">{warning.warning_id}</span>
                        <span className="text-xxs text-red-400">点击: {warning.hits}</span>
                      </div>
                      <h4 className="font-medium text-red-300 text-xs leading-tight truncate mb-1">{warning.title}</h4>
                      <span className="text-xxs text-slate-400">发布: {new Date(warning.publish_time).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {dashboardData.attackSourceWarnings.map((warning) => (
                    <div key={`attack-warning-repeat-${warning.id}`} className="flex flex-col py-2 px-3 bg-red-900/30 rounded-lg mb-2 border border-red-500/30" style={{height: '70px', minHeight: '70px'}}>
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xxs text-slate-400 font-medium">{warning.warning_id}</span>
                        <span className="text-xxs text-red-400">点击: {warning.hits}</span>
                      </div>
                      <h4 className="font-medium text-red-300 text-xs leading-tight truncate mb-1">{warning.title}</h4>
                      <span className="text-xxs text-slate-400">发布: {new Date(warning.publish_time).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs">无攻击源预警</p>
            )}
          </div>

          {/* 4. 漏洞预警 - 三栏布局 */}
          <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
            <h3 className="text-sm font-medium text-orange-300 mb-2 flex items-center gap-2">
              <span>漏洞预警</span>
              <span className="text-xs text-slate-400">
                (进行中: {dashboardData.vulnerabilityWarnings?.filter(v => v.status === '进行中').length || 0} |
                已完成: {dashboardData.vulnerabilityWarnings?.filter(v => v.status === '已完成').length || 0})
              </span>
            </h3>

            {dashboardData.vulnerabilityWarnings && dashboardData.vulnerabilityWarnings.length > 0 ? (
              <div className="space-y-2">
                {/* 状态可视化栏 */}
                <div className="bg-slate-800/50 rounded p-2 border border-slate-600/30">
                  {dashboardData.vulnerabilityWarnings.filter(v => v.status === '进行中').length > 0 ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-orange-300 font-medium">
                          {dashboardData.vulnerabilityWarnings.filter(v => v.status === '进行中').length} 个漏洞处理中
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        最高风险: {dashboardData.vulnerabilityWarnings
                          .filter(v => v.status === '进行中')
                          .sort((a, b) => a.risk_level.localeCompare(b.risk_level))[0]?.risk_level || '无'}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-300 font-medium">✓ 所有漏洞已处理</span>
                    </div>
                  )}
                </div>

                {/* 进行中漏洞滑动区 */}
                {dashboardData.vulnerabilityWarnings.filter(v => v.status === '进行中').length > 0 && (
                  <div className="h-20 overflow-hidden bg-orange-900/20 rounded border border-orange-500/30">
                    <div
                      className="infinite-scroll-list"
                      style={{
                        animation: `vulnerabilityOngoingScroll ${dashboardData.vulnerabilityWarnings.filter(v => v.status === '进行中').length * 4}s infinite ease-in-out`
                      }}
                    >
                      <style>{`
                        @keyframes vulnerabilityOngoingScroll {
                          ${dashboardData.vulnerabilityWarnings.filter(v => v.status === '进行中').map((_, index) => {
                            const totalItems = dashboardData.vulnerabilityWarnings?.filter(v => v.status === '进行中').length || 0;
                            const itemDuration = 100 / totalItems;
                            const stayPercent = itemDuration * 0.75;
                            const startPercent = index * itemDuration;
                            const stayEndPercent = startPercent + stayPercent;
                            const endPercent = (index + 1) * itemDuration;
                            const currentPosition = -index * 75;
                            const nextPosition = -(index + 1) * 75;
                            return `
                              ${startPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                              ${stayEndPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                              ${endPercent.toFixed(2)}% { transform: translateY(${nextPosition}px); }
                            `;
                          }).join('')}
                          100% { transform: translateY(-${(dashboardData.vulnerabilityWarnings?.filter(v => v.status === '进行中').length || 0) * 75}px); }
                        }
                      `}</style>
                      {dashboardData.vulnerabilityWarnings.filter(v => v.status === '进行中').map((warning) => (
                        <div key={`vuln-ongoing-${warning.id}`} className="flex items-center justify-between py-2 px-3 bg-orange-900/30 rounded mb-1 border border-orange-500/40" style={{height: '70px', minHeight: '70px'}}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xxs font-bold px-1.5 py-0.5 rounded bg-orange-500/30 text-orange-200">进行中</span>
                              <span className="text-xxs text-slate-400 font-medium">{warning.warning_id}</span>
                              <span className="text-xxs text-orange-400">{warning.risk_level}</span>
                            </div>
                            <h4 className="font-medium text-orange-200 text-xs leading-tight truncate mb-1">{warning.title.split('\n')[0]}</h4>
                            <span className="text-xxs text-slate-400">反馈: {warning.feedback_deadline.split(' ')[0]}</span>
                          </div>
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        </div>
                      ))}
                      {dashboardData.vulnerabilityWarnings.filter(v => v.status === '进行中').map((warning) => (
                        <div key={`vuln-ongoing-repeat-${warning.id}`} className="flex items-center justify-between py-2 px-3 bg-orange-900/30 rounded mb-1 border border-orange-500/40" style={{height: '70px', minHeight: '70px'}}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xxs font-bold px-1.5 py-0.5 rounded bg-orange-500/30 text-orange-200">进行中</span>
                              <span className="text-xxs text-slate-400 font-medium">{warning.warning_id}</span>
                              <span className="text-xxs text-orange-400">{warning.risk_level}</span>
                            </div>
                            <h4 className="font-medium text-orange-200 text-xs leading-tight truncate mb-1">{warning.title.split('\n')[0]}</h4>
                            <span className="text-xxs text-slate-400">反馈: {warning.feedback_deadline.split(' ')[0]}</span>
                          </div>
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 已完成漏洞滑动区 */}
                <div className="h-16 overflow-hidden bg-green-900/20 rounded border border-green-500/30">
                  <div
                    className="infinite-scroll-list"
                    style={{
                      animation: `vulnerabilityCompletedScroll ${dashboardData.vulnerabilityWarnings.filter(v => v.status === '已完成').length * 4}s infinite ease-in-out`
                    }}
                  >
                    <style>{`
                      @keyframes vulnerabilityCompletedScroll {
                        ${dashboardData.vulnerabilityWarnings.filter(v => v.status === '已完成').map((_, index) => {
                          const totalItems = dashboardData.vulnerabilityWarnings?.filter(v => v.status === '已完成').length || 0;
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
                        100% { transform: translateY(-${(dashboardData.vulnerabilityWarnings?.filter(v => v.status === '已完成').length || 0) * 60}px); }
                      }
                    `}</style>
                    {dashboardData.vulnerabilityWarnings.filter(v => v.status === '已完成').map((warning) => (
                      <div key={`vuln-completed-${warning.id}`} className="flex items-center justify-between py-1 px-3 bg-green-900/30 rounded mb-1 border border-green-500/30 opacity-80" style={{height: '55px', minHeight: '55px'}}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xxs font-bold px-1.5 py-0.5 rounded bg-green-500/30 text-green-200">已完成</span>
                            <span className="text-xxs text-slate-500 font-medium">{warning.warning_id}</span>
                          </div>
                          <h4 className="font-medium text-green-200 text-xs leading-tight truncate">{warning.title.split('\n')[0]}</h4>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                    {dashboardData.vulnerabilityWarnings.filter(v => v.status === '已完成').map((warning) => (
                      <div key={`vuln-completed-repeat-${warning.id}`} className="flex items-center justify-between py-1 px-3 bg-green-900/30 rounded mb-1 border border-green-500/30 opacity-80" style={{height: '55px', minHeight: '55px'}}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xxs font-bold px-1.5 py-0.5 rounded bg-green-500/30 text-green-200">已完成</span>
                            <span className="text-xxs text-slate-500 font-medium">{warning.warning_id}</span>
                          </div>
                          <h4 className="font-medium text-green-200 text-xs leading-tight truncate">{warning.title.split('\n')[0]}</h4>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs">无漏洞预警</p>
            )}
          </div>

          {/* 5. 预警通告 - 单栏布局 */}
          <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
            <h3 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
              <span>预警通告</span>
              <span className="text-xs text-slate-400">
                (总计: {dashboardData.warningAnnouncements?.length || 0})
              </span>
            </h3>

            {dashboardData.warningAnnouncements && dashboardData.warningAnnouncements.length > 0 ? (
              <div className="h-20 overflow-hidden bg-purple-900/20 rounded border border-purple-500/30">
                <div
                  className="infinite-scroll-list"
                  style={{
                    animation: `warningAnnouncementsScroll ${dashboardData.warningAnnouncements.length * 4}s infinite ease-in-out`
                  }}
                >
                  <style>{`
                    @keyframes warningAnnouncementsScroll {
                      ${dashboardData.warningAnnouncements.map((_, index) => {
                        const totalItems = dashboardData.warningAnnouncements?.length || 0;
                        const itemDuration = 100 / totalItems;
                        const stayPercent = itemDuration * 0.75;
                        const startPercent = index * itemDuration;
                        const stayEndPercent = startPercent + stayPercent;
                        const endPercent = (index + 1) * itemDuration;
                        const currentPosition = -index * 75;
                        const nextPosition = -(index + 1) * 75;
                        return `
                          ${startPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                          ${stayEndPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                          ${endPercent.toFixed(2)}% { transform: translateY(${nextPosition}px); }
                        `;
                      }).join('')}
                      100% { transform: translateY(-${(dashboardData.warningAnnouncements?.length || 0) * 75}px); }
                    }
                  `}</style>
                  {dashboardData.warningAnnouncements.map((announcement) => (
                    <div key={`announcement-${announcement.id}`} className="flex flex-col py-2 px-3 bg-purple-900/30 rounded-lg mb-2 border border-purple-500/30" style={{height: '70px', minHeight: '70px'}}>
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xxs text-slate-400 font-medium">{announcement.announcement_id}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xxs text-purple-400">{announcement.type}</span>
                          <span className="text-xxs text-purple-400">点击: {announcement.hits}</span>
                        </div>
                      </div>
                      <h4 className="font-medium text-purple-300 text-xs leading-tight truncate mb-1">{announcement.title}</h4>
                      <span className="text-xxs text-slate-400">发布: {new Date(announcement.publish_time).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {dashboardData.warningAnnouncements.map((announcement) => (
                    <div key={`announcement-repeat-${announcement.id}`} className="flex flex-col py-2 px-3 bg-purple-900/30 rounded-lg mb-2 border border-purple-500/30" style={{height: '70px', minHeight: '70px'}}>
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xxs text-slate-400 font-medium">{announcement.announcement_id}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xxs text-purple-400">{announcement.type}</span>
                          <span className="text-xxs text-purple-400">点击: {announcement.hits}</span>
                        </div>
                      </div>
                      <h4 className="font-medium text-purple-300 text-xs leading-tight truncate mb-1">{announcement.title}</h4>
                      <span className="text-xxs text-slate-400">发布: {new Date(announcement.publish_time).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs">无预警通告</p>
            )}
          </div>
        </div>
      </div>

      {/* 网省预警 */}
      <div
        className="bg-black p-4 rounded-lg shadow-glow-blue flex-grow min-h-0 border border-[#00d9ff]/20"
        style={{ minHeight: '30%' }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-[#00d9ff] uppercase tracking-widest">网省预警</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveWarningTab('unclosed')}
              className={`px-2 py-1 text-xxs font-medium rounded transition-colors duration-200 ${activeWarningTab === 'unclosed' ? 'bg-red-500/20 text-red-300' : 'text-slate-400 hover:text-slate-300'}`}
            >未闭环 ({dashboardData.provinceWarnings?.filter(w => !w.is_closed).length || 0})</button>
            <button
              onClick={() => setActiveWarningTab('closed')}
              className={`px-2 py-1 text-xxs font-medium rounded transition-colors duration-200 ${activeWarningTab === 'closed' ? 'bg-green-500/20 text-green-300' : 'text-slate-400 hover:text-slate-300'}`}
            >已闭环 ({dashboardData.provinceWarnings?.filter(w => w.is_closed).length || 0})</button>
          </div>
        </div>

        {dashboardData.provinceWarnings && dashboardData.provinceWarnings.length > 0 ? (
          <div className="h-full overflow-hidden">
            {/* 未闭环预警 */}
            {activeWarningTab === 'unclosed' && (
              <div className="h-full overflow-hidden">
                {dashboardData.provinceWarnings.filter(warning => !warning.is_closed).length > 0 ? (
                  <div className="h-full overflow-hidden pr-1">
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
                            const currentPosition = -index * 70;
                            const nextPosition = -(index + 1) * 70;
                            return `
                              ${startPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                              ${stayEndPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                              ${endPercent.toFixed(2)}% { transform: translateY(${nextPosition}px); }
                            `;
                          }).join('')}
                          100% { transform: translateY(-${(dashboardData.provinceWarnings?.filter(warning => !warning.is_closed).length || 0) * 70}px); }
                        }
                      `}</style>
                      {dashboardData.provinceWarnings.filter(warning => !warning.is_closed).map((warning) => (
                        <div key={`unclosed-${warning.id}`} className="flex items-center justify-between py-2 px-3 bg-red-900/40 rounded-lg mb-2 border border-red-500/40" style={{height: '65px', minHeight: '65px'}}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xxs font-bold px-1.5 py-0.5 rounded ${warning.level === '高' ? 'bg-red-500/30 text-red-200' : warning.level === '中' ? 'bg-orange-500/30 text-orange-200' : 'bg-yellow-500/30 text-yellow-200'}`}>{warning.level}</span>
                              <span className="text-xxs text-slate-300 font-medium">{warning.province}</span>
                              <span className="text-xxs text-slate-500">#{warning.warning_id}</span>
                            </div>
                            <h4 className="font-medium text-red-200 text-xs leading-tight truncate mb-1">{warning.title}</h4>
                            <div className="flex items-center gap-2 text-xxs text-slate-400">
                              <span>反馈: {warning.feedback_person}</span>
                              <span className="text-orange-300">截止: {new Date(warning.deadline_time).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center ml-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mb-1"></div>
                            <span className="text-xxs text-red-400 font-bold">未闭环</span>
                          </div>
                        </div>
                      ))}
                      {dashboardData.provinceWarnings.filter(warning => !warning.is_closed).map((warning) => (
                        <div key={`unclosed-repeat-${warning.id}`} className="flex items-center justify-between py-2 px-3 bg-red-900/40 rounded-lg mb-2 border border-red-500/40" style={{height: '65px', minHeight: '65px'}}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xxs font-bold px-1.5 py-0.5 rounded ${warning.level === '高' ? 'bg-red-500/30 text-red-200' : warning.level === '中' ? 'bg-orange-500/30 text-orange-200' : 'bg-yellow-500/30 text-yellow-200'}`}>{warning.level}</span>
                              <span className="text-xxs text-slate-300 font-medium">{warning.province}</span>
                              <span className="text-xxs text-slate-500">#{warning.warning_id}</span>
                            </div>
                            <h4 className="font-medium text-red-200 text-xs leading-tight truncate mb-1">{warning.title}</h4>
                            <div className="flex items-center gap-2 text-xxs text-slate-400">
                              <span>反馈: {warning.feedback_person}</span>
                              <span className="text-orange-300">截止: {new Date(warning.deadline_time).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center ml-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mb-1"></div>
                            <span className="text-xxs text-red-400 font-bold">未闭环</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs pl-1">暂无未闭环预警</p>
                )}
              </div>
            )}

            {/* 已闭环预警 */}
            {activeWarningTab === 'closed' && (
              <div className="h-full overflow-hidden">
                {dashboardData.provinceWarnings && dashboardData.provinceWarnings.filter(warning => warning.is_closed).length > 0 ? (
                  <div className="h-full overflow-y-auto pr-1">
                    {dashboardData.provinceWarnings.filter(warning => warning.is_closed).map((warning) => (
                      <div key={`closed-${warning.id}`} className="flex items-center justify-between py-2 px-3 bg-green-900/30 rounded-lg mb-2 border border-green-500/30" style={{height: '65px', minHeight: '65px'}}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xxs font-bold px-1.5 py-0.5 rounded bg-green-500/30 text-green-200">{warning.level}</span>
                            <span className="text-xxs text-slate-400 font-medium">{warning.province}</span>
                            <span className="text-xxs text-slate-600">#{warning.warning_id}</span>
                          </div>
                          <h4 className="font-medium text-green-200 text-xs leading-tight truncate mb-1">{warning.title}</h4>
                          <div className="flex items-center gap-2 text-xxs text-slate-500">
                            <span>闭环: {warning.closed_by}</span>
                            <span className="text-green-400">用时: {Math.floor((warning.response_time || 0) / 60)}h</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center ml-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                          <span className="text-xxs text-green-400 font-bold">已闭环</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs pl-1">暂无已闭环预警</p>
                )}
              </div>
            )}
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