import React from 'react';
import DeviceStatusPanel from '../components/DeviceStatusPanel';

const DeviceStatusExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 p-8 relative overflow-hidden">
      {/* 科幻背景装饰 */}
      <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60"></div>

      {/* 浮动光点装饰 */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-40"></div>
      <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-50"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              CYBER SECURITY DASHBOARD
            </span>
          </h1>
          <p className="text-slate-400 font-mono text-lg">
            Advanced Device Status Monitoring System
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        </div>

        <div className="relative">
          {/* 主面板容器 */}
          <div className="relative p-6 rounded-2xl border border-cyan-400/20 bg-black/40 backdrop-blur-sm shadow-[0_0_50px_rgba(6,182,212,0.1)]">
            <DeviceStatusPanel />
          </div>

          {/* 装饰性边框光效 */}
          <div className="absolute inset-0 rounded-2xl border border-cyan-400/10 animate-cyber-pulse pointer-events-none"></div>
        </div>

        {/* 底部信息 */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-4 text-sm text-slate-500 font-mono">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>WAF: 2 UNITS</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>IPS: 2 UNITS</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span>DDoS: 4 UNITS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceStatusExample;
