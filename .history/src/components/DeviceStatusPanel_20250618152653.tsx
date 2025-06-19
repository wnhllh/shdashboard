import React, { useEffect, useState } from 'react';
import WafStatusRealtime from './WafStatusRealtime';

// IPS设备状态接口
interface IpsDeviceData {
  name: string;
  status: 'online' | 'offline';
  threats: string;
  blocked: string;
  rules: string;
  performance: string;
}

// DDoS设备状态接口
interface DdosDeviceData {
  name: string;
  status: 'online' | 'offline';
  connections: string;
  sessions: string;
  bandwidth: string;
  throughput: string;
}

// IPS状态组件
const IpsStatusComponent: React.FC = () => {
  const [ipsData, setIpsData] = useState<IpsDeviceData[]>([]);

  useEffect(() => {
    const generateIpsData = (): IpsDeviceData[] => {
      return [
        {
          name: 'IPS-01',
          status: 'online',
          threats: (150 + Math.floor(Math.random() * 50)).toString(),
          blocked: (1200 + Math.floor(Math.random() * 300)).toString(),
          rules: '2847',
          performance: '95.2%'
        },
        {
          name: 'IPS-02',
          status: 'online',
          threats: (89 + Math.floor(Math.random() * 30)).toString(),
          blocked: (890 + Math.floor(Math.random() * 200)).toString(),
          rules: '2847',
          performance: '92.8%'
        },
        {
          name: 'IPS-03',
          status: Math.random() > 0.15 ? 'online' : 'offline',
          threats: (45 + Math.floor(Math.random() * 20)).toString(),
          blocked: (456 + Math.floor(Math.random() * 100)).toString(),
          rules: '2847',
          performance: '88.5%'
        }
      ];
    };

    setIpsData(generateIpsData());

    // 每30秒更新一次数据
    const interval = setInterval(() => {
      setIpsData(generateIpsData());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.2)]">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-purple-400">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" 
                  stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
            <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h4 className="text-sm font-medium text-purple-300 uppercase tracking-wide">IPS 入侵防护</h4>
        </div>
        <div className="text-xs text-slate-500">
          <span>实时监控</span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        {ipsData.map((device, index) => {
          // 计算威胁检测率
          const threatCount = parseInt(device.threats);
          const blockedCount = parseInt(device.blocked);
          const detectionRate = threatCount > 0 ? Math.min((blockedCount / (blockedCount + threatCount)) * 100, 100) : 0;
          
          return (
            <div key={device.name} className="flex-1 bg-slate-950/50 rounded-lg p-2 border border-purple-400/20">
              {/* 设备名称与状态 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="text-xs text-slate-200 font-mono font-semibold text-center">{device.name}</div>
                  <div className="flex items-center justify-center mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                      device.status === 'online' 
                        ? 'bg-purple-400 animate-pulse' 
                        : 'bg-red-400'
                    }`}></div>
                    <span className={`text-xs ${
                      device.status === 'online' ? 'text-purple-400' : 'text-red-400'
                    }`}>
                      {device.status === 'online' ? '防护中' : '离线'}
                    </span>
                  </div>
                </div>
                
                {/* 检测率指示器 */}
                <div className="relative w-3 h-10 bg-slate-800/80 rounded-sm border border-slate-600/50 overflow-hidden ml-1">
                  <div 
                    className={`absolute bottom-0 left-0 w-full transition-all duration-1000`}
                    style={{ 
                      height: `${device.status === 'offline' ? 10 : detectionRate}%`,
                      backgroundColor: device.status === 'offline' 
                        ? '#FF0040' 
                        : detectionRate > 90 
                          ? '#9333EA'  // 紫色 - 优秀
                          : detectionRate > 70 
                            ? '#FFFF00'  // 黄色 - 良好
                            : '#FF0040'  // 红色 - 需要关注
                    }}
                  ></div>
                </div>
              </div>
              
              {/* 检测率百分比 */}
              <div className="text-center mb-2">
                <span className="text-xs font-bold text-white">
                  {device.status === 'offline' ? 'OFF' : `${Math.round(detectionRate)}%`}
                </span>
              </div>
              
              {/* 数据列表 */}
              <div className="space-y-1 text-xs">
                <div className="text-center">
                  <span className="font-mono text-red-400">{device.threats}</span>
                  <div className="text-slate-500 text-xs">威胁</div>
                </div>
                <div className="text-center">
                  <span className="font-mono text-green-400">{device.blocked}</span>
                  <div className="text-slate-500 text-xs">阻断</div>
                </div>
                <div className="text-center">
                  <span className="font-mono text-cyan-400">{device.rules}</span>
                  <div className="text-slate-500 text-xs">规则</div>
                </div>
                <div className="text-center">
                  <span className="font-mono text-purple-400">{device.performance}</span>
                  <div className="text-slate-500 text-xs">性能</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 状态图例 */}
      <div className="flex justify-center items-center mt-3 space-x-3 text-xs border-t border-purple-400/20 pt-2">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-sm mr-1 bg-purple-500"></div>
          <span className="text-slate-400">优秀 (&gt;90%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-sm mr-1 bg-yellow-500"></div>
          <span className="text-slate-400">良好 (70-90%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-sm mr-1 bg-red-500"></div>
          <span className="text-slate-400">警告 (&lt;70%)</span>
        </div>
      </div>
    </div>
  );
};
