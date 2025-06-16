import React, { useEffect, useState } from 'react';

// 模拟实时状态获取，可替换为实际API轮询
function useWafStatusRealtime(interval = 3000) {
  const [status, setStatus] = useState<'normal' | 'abnormal'>('normal');

  useEffect(() => {
    const timer = setInterval(() => {
      // TODO: 替换为真实API获取WAF状态
      // 这里演示为随机切换
      setStatus(Math.random() > 0.8 ? 'abnormal' : 'normal');
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return status;
}

const statusMap = {
  normal: {
    label: '正常',
    color: 'text-green-400',
    bg: 'bg-green-400/20',
    icon: (
      <span className="inline-block w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse mr-2" />
    ),
  },
  abnormal: {
    label: '异常',
    color: 'text-red-400',
    bg: 'bg-red-400/20',
    icon: (
      <span className="inline-block w-3 h-3 rounded-full bg-red-400 shadow-[0_0_8px_#fb7185] animate-pulse mr-2" />
    ),
  },
};

const WafStatusRealtime: React.FC = () => {
  const status = useWafStatusRealtime();
  const info = statusMap[status];

  return (
    <div className={`flex items-center mt-2 px-3 py-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-[#0ea5e9]/10 to-[#22d3ee]/5 shadow-[0_0_12px_#38bdf855] w-full max-w-full`}> 
      <span className="font-semibold text-cyan-300 mr-3 text-sm flex items-center">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="mr-1"><path fill="#22d3ee" d="M12 2c-.55 0-1 .45-1 1v1.07C7.06 4.56 4 7.92 4 12c0 4.08 3.06 7.44 7 7.93V21c0 .55.45 1 1 1s1-.45 1-1v-1.07c3.94-.49 7-3.85 7-7.93 0-4.08-3.06-7.44-7-7.93V3c0-.55-.45-1-1-1Zm0 3c3.31 0 6 2.69 6 6 0 3.31-2.69 6-6 6s-6-2.69-6-6c0-3.31 2.69-6 6-6Z"/></svg>
        WAF运行模式
      </span>
      <span className={`flex items-center font-bold text-base ${info.color} ${info.bg} px-3 py-1 rounded-lg transition-all duration-300`}>
        {info.icon}
        {info.label}
      </span>
      <span className="ml-4 text-xs text-cyan-200/80 animate-pulse">实时监控</span>
    </div>
  );
};

export default WafStatusRealtime;
