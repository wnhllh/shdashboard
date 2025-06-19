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
  const [activeWorkTab, setActiveWorkTab] = useState<'tasks' | 'notifications' | 'attackSource' | 'vulnerability' | 'announcements'>('tasks');
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

      {/* S6000 网省联动 - 工作任务系统 */}
      <div
        className="bg-black p-3 rounded-lg shadow-glow-blue flex-grow min-h-0 border border-[#00d9ff]/20"
        style={{ minHeight: '35%' }}
      >
        <h2 className="text-sm font-medium relative flex items-center justify-between mb-2">
          <span className="text-[#00d9ff] uppercase tracking-widest">S6000 网省联动</span>
        </h2>

        {/* 工作标签页 */}
        <div className="flex mb-2 overflow-x-auto">
          <div className="flex bg-black/80 rounded p-0.5 min-w-full">
            <button
              onClick={() => setActiveWorkTab('tasks')}
              className={`px-2 py-1 text-xxs font-medium rounded transition-colors duration-200 whitespace-nowrap ${activeWorkTab === 'tasks' ? 'bg-[#00d9ff]/20 text-[#00d9ff]' : 'text-slate-400 hover:text-slate-300'}`}
            >工作任务</button>
            <button
              onClick={() => setActiveWorkTab('notifications')}
              className={`px-2 py-1 text-xxs font-medium rounded transition-colors duration-200 whitespace-nowrap ${activeWorkTab === 'notifications' ? 'bg-[#00d9ff]/20 text-[#00d9ff]' : 'text-slate-400 hover:text-slate-300'}`}
            >工作通知</button>
            <button
              onClick={() => setActiveWorkTab('attackSource')}
              className={`px-2 py-1 text-xxs font-medium rounded transition-colors duration-200 whitespace-nowrap ${activeWorkTab === 'attackSource' ? 'bg-[#00d9ff]/20 text-[#00d9ff]' : 'text-slate-400 hover:text-slate-300'}`}
            >攻击源预警</button>
            <button
              onClick={() => setActiveWorkTab('vulnerability')}
              className={`px-2 py-1 text-xxs font-medium rounded transition-colors duration-200 whitespace-nowrap ${activeWorkTab === 'vulnerability' ? 'bg-[#00d9ff]/20 text-[#00d9ff]' : 'text-slate-400 hover:text-slate-300'}`}
            >漏洞预警</button>
            <button
              onClick={() => setActiveWorkTab('announcements')}
              className={`px-2 py-1 text-xxs font-medium rounded transition-colors duration-200 whitespace-nowrap ${activeWorkTab === 'announcements' ? 'bg-[#00d9ff]/20 text-[#00d9ff]' : 'text-slate-400 hover:text-slate-300'}`}
            >预警通告</button>
          </div>
        </div>

        {/* 工作内容区域 */}
        <div className="h-full overflow-hidden">
          {/* 工作任务 */}
          {activeWorkTab === 'tasks' && (
            <div className="h-full overflow-hidden">
              {dashboardData.workTasks && dashboardData.workTasks.length > 0 ? (
                <div className="h-full overflow-hidden pr-1">
                  <div
                    className="infinite-scroll-list"
                    style={{
                      animation: `workTasksScroll ${dashboardData.workTasks.length * 4}s infinite ease-in-out`
                    }}
                  >
                    <style>{`
                      @keyframes workTasksScroll {
                        ${dashboardData.workTasks.map((_, index) => {
                          const totalItems = dashboardData.workTasks?.length || 0;
                          const itemDuration = 100 / totalItems;
                          const stayPercent = itemDuration * 0.75;
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
                        100% { transform: translateY(-${(dashboardData.workTasks?.length || 0) * 85}px); }
                      }
                    `}</style>
                    {/* 原始工作任务列表 */}
                    {dashboardData.workTasks.map((task) => (
                      <div key={`task-${task.id}`} className="flex flex-col py-2 px-3 bg-slate-800/60 rounded-lg mb-2 border border-slate-700/30" style={{height: '80px', minHeight: '80px'}}>
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xxs font-bold px-1.5 py-0.5 rounded ${task.feedback_status === '已反馈' ? 'bg-green-500/25 text-green-300' : 'bg-orange-500/25 text-orange-300'}`}>{task.feedback_status}</span>
                            <span className="text-xxs text-slate-400 font-medium">{task.task_id}</span>
                          </div>
                          <span className="text-xxs text-slate-500">{task.type}</span>
                        </div>
                        <h3 className="font-medium text-[#ffb74d] text-xs leading-tight truncate mb-1">{task.title}</h3>
                        <div className="flex items-center justify-between text-xxs text-slate-400">
                          <span>截止: {new Date(task.deadline_time).toLocaleDateString()}</span>
                          {task.feedback_person && <span>反馈: {task.feedback_person}</span>}
                        </div>
                      </div>
                    ))}
                    {/* 重复工作任务列表 */}
                    {dashboardData.workTasks.map((task) => (
                      <div key={`task-repeat-${task.id}`} className="flex flex-col py-2 px-3 bg-slate-800/60 rounded-lg mb-2 border border-slate-700/30" style={{height: '80px', minHeight: '80px'}}>
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xxs font-bold px-1.5 py-0.5 rounded ${task.feedback_status === '已反馈' ? 'bg-green-500/25 text-green-300' : 'bg-orange-500/25 text-orange-300'}`}>{task.feedback_status}</span>
                            <span className="text-xxs text-slate-400 font-medium">{task.task_id}</span>
                          </div>
                          <span className="text-xxs text-slate-500">{task.type}</span>
                        </div>
                        <h3 className="font-medium text-[#ffb74d] text-xs leading-tight truncate mb-1">{task.title}</h3>
                        <div className="flex items-center justify-between text-xxs text-slate-400">
                          <span>截止: {new Date(task.deadline_time).toLocaleDateString()}</span>
                          {task.feedback_person && <span>反馈: {task.feedback_person}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-xs pl-1">无工作任务</p>
              )}
            </div>
          )}

          {/* 工作通知 */}
          {activeWorkTab === 'notifications' && (
            <div className="h-full overflow-hidden">
              {dashboardData.workNotifications && dashboardData.workNotifications.length > 0 ? (
                <div className="h-full overflow-hidden pr-1">
                  <div
                    className="infinite-scroll-list"
                    style={{
                      animation: `workNotificationsScroll ${dashboardData.workNotifications.length * 4}s infinite ease-in-out`
                    }}
                  >
                    <style>{`
                      @keyframes workNotificationsScroll {
                        ${dashboardData.workNotifications.map((_, index) => {
                          const totalItems = dashboardData.workNotifications?.length || 0;
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
                        100% { transform: translateY(-${(dashboardData.workNotifications?.length || 0) * 75}px); }
                      }
                    `}</style>
                    {dashboardData.workNotifications.map((notification) => (
                      <div key={`notification-${notification.id}`} className="flex flex-col py-2 px-3 bg-blue-900/30 rounded-lg mb-2 border border-blue-500/30" style={{height: '70px', minHeight: '70px'}}>
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xxs text-slate-400 font-medium">{notification.notification_id}</span>
                          <span className="text-xxs text-blue-400">{notification.type}</span>
                        </div>
                        <h3 className="font-medium text-blue-300 text-xs leading-tight truncate mb-1">{notification.title}</h3>
                        <span className="text-xxs text-slate-400">发布: {new Date(notification.publish_time).toLocaleDateString()}</span>
                      </div>
                    ))}
                    {dashboardData.workNotifications.map((notification) => (
                      <div key={`notification-repeat-${notification.id}`} className="flex flex-col py-2 px-3 bg-blue-900/30 rounded-lg mb-2 border border-blue-500/30" style={{height: '70px', minHeight: '70px'}}>
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xxs text-slate-400 font-medium">{notification.notification_id}</span>
                          <span className="text-xxs text-blue-400">{notification.type}</span>
                        </div>
                        <h3 className="font-medium text-blue-300 text-xs leading-tight truncate mb-1">{notification.title}</h3>
                        <span className="text-xxs text-slate-400">发布: {new Date(notification.publish_time).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-xs pl-1">无工作通知</p>
              )}
            </div>
          )}

          {/* 攻击源预警 */}
          {activeWorkTab === 'attackSource' && (
            <div className="h-full overflow-hidden">
              {dashboardData.attackSourceWarnings && dashboardData.attackSourceWarnings.length > 0 ? (
                <div className="h-full overflow-hidden pr-1">
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
                        <h3 className="font-medium text-red-300 text-xs leading-tight truncate mb-1">{warning.title}</h3>
                        <span className="text-xxs text-slate-400">发布: {new Date(warning.publish_time).toLocaleDateString()}</span>
                      </div>
                    ))}
                    {dashboardData.attackSourceWarnings.map((warning) => (
                      <div key={`attack-warning-repeat-${warning.id}`} className="flex flex-col py-2 px-3 bg-red-900/30 rounded-lg mb-2 border border-red-500/30" style={{height: '70px', minHeight: '70px'}}>
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xxs text-slate-400 font-medium">{warning.warning_id}</span>
                          <span className="text-xxs text-red-400">点击: {warning.hits}</span>
                        </div>
                        <h3 className="font-medium text-red-300 text-xs leading-tight truncate mb-1">{warning.title}</h3>
                        <span className="text-xxs text-slate-400">发布: {new Date(warning.publish_time).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-xs pl-1">无攻击源预警</p>
              )}
            </div>
          )}

          {/* 漏洞预警 */}
          {activeWorkTab === 'vulnerability' && (
            <div className="h-full overflow-hidden">
              {dashboardData.vulnerabilityWarnings && dashboardData.vulnerabilityWarnings.length > 0 ? (
                <div className="h-full overflow-hidden pr-1">
                  <div
                    className="infinite-scroll-list"
                    style={{
                      animation: `vulnerabilityScroll ${dashboardData.vulnerabilityWarnings.length * 4}s infinite ease-in-out`
                    }}
                  >
                    <style>{`
                      @keyframes vulnerabilityScroll {
                        ${dashboardData.vulnerabilityWarnings.map((_, index) => {
                          const totalItems = dashboardData.vulnerabilityWarnings?.length || 0;
                          const itemDuration = 100 / totalItems;
                          const stayPercent = itemDuration * 0.75;
                          const startPercent = index * itemDuration;
                          const stayEndPercent = startPercent + stayPercent;
                          const endPercent = (index + 1) * itemDuration;
                          const currentPosition = -index * 90;
                          const nextPosition = -(index + 1) * 90;
                          return `
                            ${startPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                            ${stayEndPercent.toFixed(2)}% { transform: translateY(${currentPosition}px); }
                            ${endPercent.toFixed(2)}% { transform: translateY(${nextPosition}px); }
                          `;
                        }).join('')}
                        100% { transform: translateY(-${(dashboardData.vulnerabilityWarnings?.length || 0) * 90}px); }
                      }
                    `}</style>
                    {dashboardData.vulnerabilityWarnings.map((warning) => (
                      <div key={`vuln-warning-${warning.id}`} className="flex flex-col py-2 px-3 bg-orange-900/30 rounded-lg mb-2 border border-orange-500/30" style={{height: '85px', minHeight: '85px'}}>
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-xxs font-bold px-1.5 py-0.5 rounded ${warning.status === '已完成' ? 'bg-green-500/25 text-green-300' : 'bg-orange-500/25 text-orange-300'}`}>{warning.status}</span>
                            <span className="text-xxs text-slate-400 font-medium">{warning.warning_id}</span>
                          </div>
                          <span className="text-xxs text-orange-400">{warning.risk_level}</span>
                        </div>
                        <h3 className="font-medium text-orange-300 text-xs leading-tight truncate mb-1">{warning.title.split('\n')[0]}</h3>
                        <div className="flex items-center justify-between text-xxs text-slate-400">
                          <span>反馈: {warning.feedback_deadline.split(' ')[0]}</span>
                          {warning.feedback_person && <span>处理: {warning.feedback_person}</span>}
                        </div>
                      </div>
                    ))}
                    {dashboardData.vulnerabilityWarnings.map((warning) => (
                      <div key={`vuln-warning-repeat-${warning.id}`} className="flex flex-col py-2 px-3 bg-orange-900/30 rounded-lg mb-2 border border-orange-500/30" style={{height: '85px', minHeight: '85px'}}>
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-xxs font-bold px-1.5 py-0.5 rounded ${warning.status === '已完成' ? 'bg-green-500/25 text-green-300' : 'bg-orange-500/25 text-orange-300'}`}>{warning.status}</span>
                            <span className="text-xxs text-slate-400 font-medium">{warning.warning_id}</span>
                          </div>
                          <span className="text-xxs text-orange-400">{warning.risk_level}</span>
                        </div>
                        <h3 className="font-medium text-orange-300 text-xs leading-tight truncate mb-1">{warning.title.split('\n')[0]}</h3>
                        <div className="flex items-center justify-between text-xxs text-slate-400">
                          <span>反馈: {warning.feedback_deadline.split(' ')[0]}</span>
                          {warning.feedback_person && <span>处理: {warning.feedback_person}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-xs pl-1">无漏洞预警</p>
              )}
            </div>
          )}

          {/* 预警通告 */}
          {activeWorkTab === 'announcements' && (
            <div className="h-full overflow-hidden">
              {dashboardData.warningAnnouncements && dashboardData.warningAnnouncements.length > 0 ? (
                <div className="h-full overflow-hidden pr-1">
                  <div
                    className="infinite-scroll-list"
                    style={{
                      animation: `announcementsScroll ${dashboardData.warningAnnouncements.length * 4}s infinite ease-in-out`
                    }}
                  >
                    <style>{`
                      @keyframes announcementsScroll {
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
                        <h3 className="font-medium text-purple-300 text-xs leading-tight truncate mb-1">{announcement.title}</h3>
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
                        <h3 className="font-medium text-purple-300 text-xs leading-tight truncate mb-1">{announcement.title}</h3>
                        <span className="text-xxs text-slate-400">发布: {new Date(announcement.publish_time).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-xs pl-1">无预警通告</p>
              )}
            </div>
          )}
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
                )
              </div>
            )}

            {/* 已闭环预警 */}
            {activeWarningTab === 'closed' && (
              <div className="h-full overflow-hidden">
                {dashboardData.provinceWarnings.filter(warning => warning.is_closed).length > 0 ? (
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