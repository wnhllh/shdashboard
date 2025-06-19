import React, { useEffect, useState } from 'react';

// WAF设备状态接口
interface WafDeviceData {
  name: string;
  status: 'online' | 'offline';
  ip: string;
  lastPing: number; // 延迟ms
}

// IPS设备状态接口
interface IpsDeviceData {
  name: string;
  status: 'online' | 'offline';
  ip: string;
  lastPing: number; // 延迟ms
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

// WAF状态组件
const WafStatusComponent: React.FC = () => {
  const [wafData, setWafData] = useState<WafDeviceData[]>([]);
  const [pingProgress, setPingProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const generateWafData = (): WafDeviceData[] => {
      return [
        {
          name: 'WAF-01',
          status: Math.random() > 0.05 ? 'online' : 'offline', // 95%在线率
          ip: '192.168.1.101',
          lastPing: Math.floor(Math.random() * 50) + 10 // 10-60ms
        },
        {
          name: 'WAF-02',
          status: Math.random() > 0.05 ? 'online' : 'offline', // 95%在线率
          ip: '192.168.1.102',
          lastPing: Math.floor(Math.random() * 50) + 10 // 10-60ms
        }
      ];
    };

    setWafData(generateWafData());

    // 每30秒更新一次数据
    const interval = setInterval(() => {
      setWafData(generateWafData());
      // 重置ping进度
      setPingProgress({});
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ping进度条动画
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setPingProgress(prev => {
        const newProgress = { ...prev };
        wafData.forEach(device => {
          if (device.status === 'online') {
            newProgress[device.name] = ((newProgress[device.name] || 0) + 100/30) % 100;
          }
        });
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(progressInterval);
  }, [wafData]);

  return (
    <div className="relative bg-gradient-to-br from-teal-900/30 via-slate-900/80 to-emerald-900/30 backdrop-blur-sm p-3 rounded-lg border border-teal-400/40 shadow-[0_0_20px_rgba(20,184,166,0.2)] overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(20,184,166,0.15),transparent_70%)]"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent"></div>

      {/* 标题 */}
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-teal-500/20 border border-teal-400/50 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-teal-400">
              <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
                    stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-teal-300">WAF 防护墙</h4>
            <p className="text-xs text-teal-400/60">网络应用防火墙</p>
          </div>
        </div>
        <div className="text-xs text-slate-400">连接状态</div>
      </div>

      {/* 设备列表 */}
      <div className="space-y-2">
        {wafData.map((device) => (
          <div key={device.name} className={`relative p-2 rounded border transition-all duration-300 ${
            device.status === 'online'
              ? 'bg-teal-950/40 border-teal-400/30 shadow-[0_0_10px_rgba(20,184,166,0.1)]'
              : 'bg-red-950/40 border-red-400/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  device.status === 'online' ? 'bg-teal-400 animate-pulse' : 'bg-red-400'
                }`}></div>
                <span className="text-xs font-mono text-white">{device.name}</span>
                <span className="text-xs text-slate-400">{device.ip}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-xs font-mono ${
                  device.status === 'online'
                    ? device.lastPing < 30 ? 'text-teal-400' : device.lastPing < 50 ? 'text-yellow-400' : 'text-orange-400'
                    : 'text-red-400'
                }`}>
                  {device.status === 'online' ? `${device.lastPing}ms` : '超时'}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded text-center min-w-[40px] ${
                  device.status === 'online' ? 'bg-teal-500/20 text-teal-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {device.status === 'online' ? '在线' : '离线'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// IPS状态组件
const IpsStatusComponent: React.FC = () => {
  const [ipsData, setIpsData] = useState<IpsDeviceData[]>([]);

  useEffect(() => {
    const generateIpsData = (): IpsDeviceData[] => {
      return [
        {
          name: 'IPS-01',
          status: Math.random() > 0.05 ? 'online' : 'offline', // 95%在线率
          ip: '192.168.1.201',
          lastPing: Math.floor(Math.random() * 50) + 10 // 10-60ms
        },
        {
          name: 'IPS-02',
          status: Math.random() > 0.05 ? 'online' : 'offline', // 95%在线率
          ip: '192.168.1.202',
          lastPing: Math.floor(Math.random() * 50) + 10 // 10-60ms
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
    <div className="relative bg-gradient-to-br from-violet-900/30 via-slate-900/80 to-purple-900/30 backdrop-blur-sm p-3 rounded-lg border border-violet-400/40 shadow-[0_0_20px_rgba(139,92,246,0.2)] overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_70%)]"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent"></div>

      {/* 标题 */}
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-violet-500/20 border border-violet-400/50 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-violet-400">
              <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
                    stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3"/>
              <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-violet-300">IPS 入侵防护</h4>
            <p className="text-xs text-violet-400/60">入侵防护系统</p>
          </div>
        </div>
        <div className="text-xs text-slate-400">连接状态</div>
      </div>

      {/* 设备列表 */}
      <div className="space-y-2">
        {ipsData.map((device) => (
          <div key={device.name} className={`relative p-2 rounded border transition-all duration-300 ${
            device.status === 'online'
              ? 'bg-violet-950/40 border-violet-400/30 shadow-[0_0_10px_rgba(139,92,246,0.1)]'
              : 'bg-red-950/40 border-red-400/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  device.status === 'online' ? 'bg-violet-400 animate-pulse' : 'bg-red-400'
                }`}></div>
                <span className="text-xs font-mono text-white">{device.name}</span>
                <span className="text-xs text-slate-400">{device.ip}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-xs font-mono ${
                  device.status === 'online'
                    ? device.lastPing < 30 ? 'text-violet-400' : device.lastPing < 50 ? 'text-yellow-400' : 'text-orange-400'
                    : 'text-red-400'
                }`}>
                  {device.status === 'online' ? `${device.lastPing}ms` : '超时'}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded text-center min-w-[40px] ${
                  device.status === 'online' ? 'bg-violet-500/20 text-violet-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {device.status === 'online' ? '在线' : '离线'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// DDoS设备状态组件
const DdosStatusComponent: React.FC = () => {
  const [ddosData, setDdosData] = useState<DdosDeviceData[]>([]);

  useEffect(() => {
    const generateDdosData = (): DdosDeviceData[] => {
      return [
        {
          name: 'F3/1',
          status: 'online',
          connections: (3000 + Math.floor(Math.random() * 500)).toLocaleString(),
          sessions: (7000 + Math.floor(Math.random() * 500)).toLocaleString(),
          bandwidth: '3.5M',
          throughput: '79.4M'
        },
        {
          name: 'F3/2',
          status: 'online',
          connections: (7000 + Math.floor(Math.random() * 500)).toLocaleString(),
          sessions: (3000 + Math.floor(Math.random() * 500)).toLocaleString(),
          bandwidth: '79.4M',
          throughput: '3.5M'
        },
        {
          name: 'G2/1',
          status: 'online',
          connections: (5000 + Math.floor(Math.random() * 1000)).toLocaleString(),
          sessions: (4500 + Math.floor(Math.random() * 1000)).toLocaleString(),
          bandwidth: '45.2M',
          throughput: '12.8M'
        },
        {
          name: 'G2/2',
          status: Math.random() > 0.1 ? 'online' : 'offline', // 偶尔离线
          connections: (2800 + Math.floor(Math.random() * 400)).toLocaleString(),
          sessions: (6200 + Math.floor(Math.random() * 600)).toLocaleString(),
          bandwidth: '28.7M',
          throughput: '65.3M'
        }
      ];
    };

    setDdosData(generateDdosData());

    // 每30秒更新一次数据
    const interval = setInterval(() => {
      setDdosData(generateDdosData());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-amber-900/30 via-slate-900/80 to-orange-900/30 backdrop-blur-sm p-3 rounded-lg border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(245,158,11,0.15),transparent_70%)]"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"></div>

      {/* 标题 */}
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-amber-400">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-300">DDoS 防护</h4>
            <p className="text-xs text-amber-400/60">分布式拒绝服务防护</p>
          </div>
        </div>
        <div className="text-xs text-slate-400">负载监控</div>
      </div>

      {/* 设备网格 */}
      <div className="grid grid-cols-2 gap-2">
        {ddosData.map((device) => {
          // 计算负载百分比 (基于连接数)
          const connectionCount = parseInt(device.connections.replace(/,/g, ''));
          const loadPercentage = Math.min((connectionCount / 8000) * 100, 100);

          return (
            <div key={device.name} className={`relative p-2 rounded border transition-all duration-300 ${
              device.status === 'online'
                ? 'bg-amber-950/40 border-amber-400/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]'
                : 'bg-red-950/40 border-red-400/30 shadow-[0_0_8px_rgba(239,68,68,0.1)]'
            }`}>
              {/* 设备名称与负载 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    device.status === 'online' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
                  }`}></div>
                  <span className="text-xs font-mono text-white">{device.name}</span>
                </div>

                {/* 负载指示器 */}
                <div className="flex items-center space-x-1">
                  <div className="relative w-1 h-4 bg-slate-800/80 rounded-sm overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 w-full transition-all duration-1000"
                      style={{
                        height: `${device.status === 'offline' ? 10 : loadPercentage}%`,
                        backgroundColor: device.status === 'offline'
                          ? '#ef4444'
                          : loadPercentage > 80
                            ? '#ef4444'  // 红色 - 危险
                            : loadPercentage > 60
                              ? '#eab308'  // 黄色 - 警告
                              : '#22c55e'  // 绿色 - 正常
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-mono text-white min-w-[28px]">
                    {device.status === 'offline' ? 'OFF' : `${Math.round(loadPercentage)}%`}
                  </span>
                </div>
              </div>

              {/* 数据网格 */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="text-center">
                  <div className="font-mono text-cyan-300">{device.connections}</div>
                  <div className="text-slate-500">连接</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-blue-300">{device.sessions}</div>
                  <div className="text-slate-500">会话</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-green-300">{device.bandwidth}</div>
                  <div className="text-slate-500">带宽</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-yellow-300">{device.throughput}</div>
                  <div className="text-slate-500">吞吐</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 状态图例 */}
      <div className="flex justify-center items-center mt-3 space-x-3 text-xs border-t border-amber-400/20 pt-2">
        <div className="flex items-center">
          <div className="w-1.5 h-1.5 rounded mr-1 bg-green-400"></div>
          <span className="text-slate-400">正常</span>
        </div>
        <div className="flex items-center">
          <div className="w-1.5 h-1.5 rounded mr-1 bg-yellow-400"></div>
          <span className="text-slate-400">警告</span>
        </div>
        <div className="flex items-center">
          <div className="w-1.5 h-1.5 rounded mr-1 bg-red-400"></div>
          <span className="text-slate-400">危险</span>
        </div>
      </div>
    </div>
  );
};

// 主设备状态面板组件
const DeviceStatusPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 简洁标题 */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-1">
          网络安全设备监控
        </h3>
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
      </div>

      {/* WAF 状态 */}
      <WafStatusComponent />

      {/* IPS 状态 */}
      <IpsStatusComponent />

      {/* DDoS 状态 */}
      <DdosStatusComponent />

      {/* 底部状态指示 */}
      <div className="flex justify-center items-center space-x-4 text-xs text-slate-500 pt-2 border-t border-slate-700/30">
        <div className="flex items-center space-x-1">
          <div className="w-1 h-1 bg-teal-400 rounded-full animate-pulse"></div>
          <span>WAF防护</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse"></div>
          <span>IPS防护</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></div>
          <span>DDoS防护</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceStatusPanel;
