import React, { useEffect, useState } from 'react';

// 在线时长计算Hook
function useUptime() {
  const [uptime, setUptime] = useState({ hours: 24, minutes: 32, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(prev => {
        let { hours, minutes, seconds } = prev;
        seconds += 1;
        if (seconds >= 60) {
          seconds = 0;
          minutes += 1;
          if (minutes >= 60) {
            minutes = 0;
            hours += 1;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return uptime;
}

// 状态图标组件
const StatusIcon: React.FC = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" 
            stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// 脉冲动画圆点组件
const PulsingDot: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute w-3 h-3 rounded-full bg-emerald-400 opacity-30 animate-pulse"></div>
      <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-60 animate-ping"></div>
      <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm"></div>
    </div>
  );
};

const WafStatusRealtime: React.FC = () => {
  const uptime = useUptime();

  return (
    <div className="relative p-4 rounded-xl border border-emerald-400/30 bg-gradient-to-r from-emerald-500/10 to-green-400/5 shadow-[0_0_20px_rgba(52,211,153,0.2)] backdrop-blur-sm transition-all duration-300 hover:border-opacity-50">
      {/* 背景装饰 */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      {/* 主要内容 */}
      <div className="relative flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
          <StatusIcon />
        </div>
        
        <div className="flex-1">
          {/* 第一行：标题和状态 */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-cyan-300">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-cyan-300 font-medium text-sm">WAF 运行状态</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-semibold">正常运行</span>
              <PulsingDot />
            </div>
          </div>
          
          {/* 第二行：统计信息 */}
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-400">
              在线时长: <span className="text-cyan-300 font-mono">
                {String(uptime.hours).padStart(2, '0')}:
                {String(uptime.minutes).padStart(2, '0')}:
                {String(uptime.seconds).padStart(2, '0')}
              </span>
            </span>
            <span className="text-xs text-gray-400">
              检测频率: <span className="text-cyan-300 font-mono">3s</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WafStatusRealtime;
