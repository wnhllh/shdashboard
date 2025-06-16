import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  BellIcon, 
  ClockIcon, 
  UserIcon, 
  PaperClipIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface EmailData {
  id: string;
  subject: string;
  sender: string;
  timestamp: string;
  isNew?: boolean;
  hasAttachment?: boolean;
  priority?: 'high' | 'normal' | 'low';
  preview?: string;
}

interface EmailNotificationProps {
  unreadCount3Days?: number;
  todayNewCount?: number;
  recentEmails?: EmailData[];
}

const EmailNotification: React.FC<EmailNotificationProps> = ({
  unreadCount3Days = 15,
  todayNewCount = 3,
  recentEmails = [
    {
      id: '1',
      subject: '紧急：SQL注入攻击检测',
      sender: 'security@company.com',
      timestamp: '10:30',
      isNew: true,
      hasAttachment: true,
      priority: 'high',
      preview: '系统检测到来自 192.168.1.100 的SQL注入攻击尝试...'
    },
    {
      id: '2',
      subject: '系统维护通知',
      sender: 'admin@company.com',
      timestamp: '09:15',
      isNew: true,
      hasAttachment: false,
      priority: 'normal',
      preview: '定期系统维护将于今晚2:00-4:00进行...'
    },
    {
      id: '3',
      subject: '威胁情报日报',
      sender: 'threat-intel@company.com',
      timestamp: '昨天 16:45',
      isNew: false,
      hasAttachment: true,
      priority: 'normal',
      preview: '今日共检测到 156 个威胁事件，其中高危...'
    }
  ]
}) => {
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  // 自动轮播
  useEffect(() => {
    if (recentEmails.length <= 1) return;

    const interval = setInterval(() => {
      setIsSliding(true);
      setTimeout(() => {
        setCurrentEmailIndex((prev) => (prev + 1) % recentEmails.length);
        setIsSliding(false);
      }, 300); // 动画持续时间
    }, 3000); // 3秒切换

    return () => clearInterval(interval);
  }, [recentEmails.length]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ExclamationTriangleIcon className="w-3 h-3 text-red-400" />;
      case 'low': return <div className="w-3 h-3 rounded-full bg-cyan-400/40"></div>;
      default: return <div className="w-3 h-3 rounded-full bg-yellow-400/40"></div>;
    }
  };

  const currentEmail = recentEmails[currentEmailIndex];

  return (
    <div className="bg-slate-900/20 backdrop-blur-md rounded-xl border border-cyan-400/20 overflow-hidden shadow-lg shadow-cyan-400/10">
      {/* 头部区域 */}
      <div className="p-4 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 border-b border-cyan-400/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
              <EnvelopeIcon className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-cyan-100">邮件通知</h2>
              <p className="text-cyan-300/60 text-xs">实时消息</p>
            </div>
          </div>
          {todayNewCount > 0 && (
            <div className="relative">
              <BellIcon className="w-5 h-5 text-yellow-300/80 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{todayNewCount}</span>
              </div>
            </div>
          )}
        </div>
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-300/80 text-xs">3天未读</p>
                <p className="text-lg font-bold text-cyan-200">{unreadCount3Days}</p>
              </div>
              <EnvelopeIcon className="w-4 h-4 text-cyan-400/60" />
            </div>
          </div>
          <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-300/80 text-xs">今日新增</p>
                <p className="text-lg font-bold text-emerald-200">{todayNewCount}</p>
              </div>
              <BellIcon className="w-4 h-4 text-emerald-400/60" />
            </div>
          </div>
        </div>
      </div>
      {/* 邮件内容区域 */}
      <div className="relative overflow-hidden min-h-[120px] flex items-center">
        {recentEmails.length > 0 && currentEmail && (
          <div
            className={`transition-transform duration-300 ease-in-out w-full ${
              isSliding ? 'transform -translate-y-full' : 'transform translate-y-0'
            }`}
          >
            <div className="group hover:bg-cyan-400/5 transition-all duration-200 w-full">
              <div className="p-4 w-full">
                {/* 邮件头部 */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-bold text-cyan-100 text-lg truncate">{currentEmail.subject}</h4>
                      {currentEmail.isNew && (
                        <span className="px-1.5 py-0.5 bg-red-400/20 text-red-300 text-xs font-medium rounded border border-red-400/30">NEW</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-cyan-300/60">
                      <UserIcon className="w-3 h-3" />
                      <span className="truncate">{currentEmail.sender}</span>
                      <ClockIcon className="w-3 h-3 ml-1" />
                      <span>{currentEmail.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    {getPriorityIcon(currentEmail.priority!)}
                    {currentEmail.hasAttachment && (
                      <PaperClipIcon className="w-3 h-3 text-cyan-400/50" />
                    )}
                  </div>
                </div>
                {/* 邮件预览 */}
                {currentEmail.preview && (
                  <div className="mb-3">
                    <p className="text-cyan-200/60 text-xs leading-relaxed">{currentEmail.preview}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* 下一封邮件预览（用于滑动效果） */}
        {recentEmails.length > 1 && isSliding && (
          <div className="absolute inset-0 transform translate-y-full transition-transform duration-300 ease-in-out w-full flex items-center">
            <div className="group hover:bg-cyan-400/5 transition-all duration-200 w-full">
              <div className="p-4 w-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-bold text-cyan-100 text-lg truncate">
                        {recentEmails[(currentEmailIndex + 1) % recentEmails.length].subject}
                      </h4>
                      {recentEmails[(currentEmailIndex + 1) % recentEmails.length].isNew && (
                        <span className="px-1.5 py-0.5 bg-red-400/20 text-red-300 text-xs font-medium rounded border border-red-400/30">NEW</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-cyan-300/60">
                      <UserIcon className="w-3 h-3" />
                      <span className="truncate">{recentEmails[(currentEmailIndex + 1) % recentEmails.length].sender}</span>
                      <ClockIcon className="w-3 h-3 ml-1" />
                      <span>{recentEmails[(currentEmailIndex + 1) % recentEmails.length].timestamp}</span>
                    </div>
                  </div>
                </div>
                {recentEmails[(currentEmailIndex + 1) % recentEmails.length].preview && (
                  <div className="mb-3">
                    <p className="text-cyan-200/60 text-xs leading-relaxed">
                      {recentEmails[(currentEmailIndex + 1) % recentEmails.length].preview}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {recentEmails.length === 0 && (
          <div className="p-6 text-center w-full">
            <EnvelopeIcon className="w-8 h-8 text-cyan-400/30 mx-auto mb-2" />
            <p className="text-cyan-300/50 text-sm">暂无邮件</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailNotification;