import React, { useEffect, useState } from 'react';

// WAF设备状态接口
interface WafDeviceData {
  name: string;
  status: 'online' | 'offline';
  pingTime: number; // ping响应时间(ms)
  uptime: string;
  requests: string;
  blocked: string;
}

// IPS设备状态接口
interface IpsDeviceData {
  name: string;
  status: 'online' | 'offline';
  pingTime: number; // ping响应时间(ms)
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

// WAF状态组件
const WafStatusComponent: React.FC = () => {
  const [wafData, setWafData] = useState<WafDeviceData[]>([]);

  useEffect(() => {
    const generateWafData = (): WafDeviceData[] => {
      return [
        {
          name: 'WAF-01',
          status: Math.random() > 0.05 ? 'online' : 'offline',
          pingTime: Math.random() > 0.05 ? Math.floor(Math.random() * 20) + 1 : 0,
          uptime: '24h 32m',
          requests: (15000 + Math.floor(Math.random() * 5000)).toLocaleString(),
          blocked: (1200 + Math.floor(Math.random() * 300)).toString()
        },
        {
          name: 'WAF-02',
          status: Math.random() > 0.05 ? 'online' : 'offline',
          pingTime: Math.random() > 0.05 ? Math.floor(Math.random() * 20) + 1 : 0,
          uptime: '18h 45m',
          requests: (12000 + Math.floor(Math.random() * 4000)).toLocaleString(),
          blocked: (890 + Math.floor(Math.random() * 200)).toString()
        }
      ];
    };

    setWafData(generateWafData());

    const interval = setInterval(() => {
      setWafData(generateWafData());
    }, 5000); // 每5秒更新一次ping状态

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative p-4 rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-sm">
      {/* 科幻背景装饰 */}
      <div className="absolute inset-0 rounded-xl bg-cyber-grid opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"></div>

      {/* 标题区域 */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
                      stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">WAF 防护墙</h4>
            <p className="text-xs text-slate-400">Web Application Firewall</p>
          </div>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          PING STATUS
        </div>
      </div>

      {/* 设备网格 */}
      <div className="grid grid-cols-2 gap-3">
        {wafData.map((device) => (
          <div key={device.name} className="relative group">
            {/* 设备卡片 */}
            <div className={`relative p-3 rounded-lg border transition-all duration-300 ${
              device.status === 'online'
                ? 'border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'border-red-400/30 bg-gradient-to-br from-red-500/10 to-orange-500/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            }`}>

              {/* 设备名称和状态 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    device.status === 'online' ? 'bg-cyan-400 animate-pulse' : 'bg-red-400'
                  } shadow-[0_0_8px_currentColor]`}></div>
                  <span className="text-sm font-mono font-bold text-white">{device.name}</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  device.status === 'online'
                    ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                    : 'bg-red-400/20 text-red-300 border border-red-400/30'
                }`}>
                  {device.status === 'online' ? 'ONLINE' : 'OFFLINE'}
                </div>
              </div>

              {/* Ping时间显示 */}
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">PING</span>
                  <span className={`text-sm font-mono font-bold ${
                    device.status === 'online'
                      ? device.pingTime < 10 ? 'text-green-400' : device.pingTime < 50 ? 'text-yellow-400' : 'text-orange-400'
                      : 'text-red-400'
                  }`}>
                    {device.status === 'online' ? `${device.pingTime}ms` : 'TIMEOUT'}
                  </span>
                </div>
                <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      device.status === 'online'
                        ? device.pingTime < 10 ? 'bg-green-400' : device.pingTime < 50 ? 'bg-yellow-400' : 'bg-orange-400'
                        : 'bg-red-400'
                    }`}
                    style={{
                      width: device.status === 'online' ? `${Math.min(device.pingTime * 2, 100)}%` : '100%'
                    }}
                  ></div>
                </div>
              </div>

              {/* 统计数据 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-slate-400">请求</div>
                  <div className="font-mono text-cyan-300 font-bold">{device.requests}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400">拦截</div>
                  <div className="font-mono text-red-300 font-bold">{device.blocked}</div>
                </div>
                <div className="col-span-2 text-center">
                  <div className="text-slate-400">运行时间</div>
                  <div className="font-mono text-green-300 font-bold">{device.uptime}</div>
                </div>
              </div>

              {/* 扫描线动画 */}
              {device.status === 'online' && (
                <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line"></div>
                </div>
              )}
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
          status: Math.random() > 0.05 ? 'online' : 'offline',
          pingTime: Math.random() > 0.05 ? Math.floor(Math.random() * 30) + 1 : 0,
          threats: (150 + Math.floor(Math.random() * 50)).toString(),
          blocked: (1200 + Math.floor(Math.random() * 300)).toString(),
          rules: '2847',
          performance: '95.2%'
        },
        {
          name: 'IPS-02',
          status: Math.random() > 0.05 ? 'online' : 'offline',
          pingTime: Math.random() > 0.05 ? Math.floor(Math.random() * 30) + 1 : 0,
          threats: (89 + Math.floor(Math.random() * 30)).toString(),
          blocked: (890 + Math.floor(Math.random() * 200)).toString(),
          rules: '2847',
          performance: '92.8%'
        }
      ];
    };

    setIpsData(generateIpsData());

    const interval = setInterval(() => {
      setIpsData(generateIpsData());
    }, 5000); // 每5秒更新一次ping状态

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative p-4 rounded-xl border border-purple-400/40 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent shadow-[0_0_25px_rgba(147,51,234,0.3)] backdrop-blur-sm">
      {/* 科幻背景装饰 */}
      <div className="absolute inset-0 rounded-xl bg-cyber-grid opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60"></div>

      {/* 标题区域 */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400/20 to-indigo-500/20 border border-purple-400/30 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
                      stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(147,51,234,0.8)]"></div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-purple-300 uppercase tracking-wider">IPS 入侵防护</h4>
            <p className="text-xs text-slate-400">Intrusion Prevention System</p>
          </div>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          PING STATUS
        </div>
      </div>

      {/* 设备网格 */}
      <div className="grid grid-cols-2 gap-3">
        {ipsData.map((device) => {
          const threatCount = parseInt(device.threats);
          const blockedCount = parseInt(device.blocked);
          const detectionRate = threatCount > 0 ? Math.min((blockedCount / (blockedCount + threatCount)) * 100, 100) : 0;

          return (
            <div key={device.name} className="relative group">
              {/* 设备卡片 */}
              <div className={`relative p-3 rounded-lg border transition-all duration-300 ${
                device.status === 'online'
                  ? 'border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 shadow-[0_0_15px_rgba(147,51,234,0.2)]'
                  : 'border-red-400/30 bg-gradient-to-br from-red-500/10 to-orange-500/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              }`}>

                {/* 设备名称和状态 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      device.status === 'online' ? 'bg-purple-400 animate-pulse' : 'bg-red-400'
                    } shadow-[0_0_8px_currentColor]`}></div>
                    <span className="text-sm font-mono font-bold text-white">{device.name}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    device.status === 'online'
                      ? 'bg-purple-400/20 text-purple-300 border border-purple-400/30'
                      : 'bg-red-400/20 text-red-300 border border-red-400/30'
                  }`}>
                    {device.status === 'online' ? 'ACTIVE' : 'OFFLINE'}
                  </div>
                </div>

                {/* Ping时间显示 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">PING</span>
                    <span className={`text-sm font-mono font-bold ${
                      device.status === 'online'
                        ? device.pingTime < 15 ? 'text-green-400' : device.pingTime < 30 ? 'text-yellow-400' : 'text-orange-400'
                        : 'text-red-400'
                    }`}>
                      {device.status === 'online' ? `${device.pingTime}ms` : 'TIMEOUT'}
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        device.status === 'online'
                          ? device.pingTime < 15 ? 'bg-green-400' : device.pingTime < 30 ? 'bg-yellow-400' : 'bg-orange-400'
                          : 'bg-red-400'
                      }`}
                      style={{
                        width: device.status === 'online' ? `${Math.min(device.pingTime * 3, 100)}%` : '100%'
                      }}
                    ></div>
                  </div>
                </div>

                {/* 检测率环形进度条 */}
                <div className="flex items-center justify-center mb-3">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-700"/>
                      <circle
                        cx="32" cy="32" r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${detectionRate * 1.76} 176`}
                        className={`transition-all duration-1000 ${
                          device.status === 'online'
                            ? detectionRate > 90 ? 'text-purple-400' : detectionRate > 70 ? 'text-yellow-400' : 'text-red-400'
                            : 'text-red-400'
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {device.status === 'offline' ? 'OFF' : `${Math.round(detectionRate)}%`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 统计数据 */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-slate-400">威胁</div>
                    <div className="font-mono text-red-300 font-bold">{device.threats}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">阻断</div>
                    <div className="font-mono text-green-300 font-bold">{device.blocked}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">规则</div>
                    <div className="font-mono text-cyan-300 font-bold">{device.rules}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">性能</div>
                    <div className="font-mono text-purple-300 font-bold">{device.performance}</div>
                  </div>
                </div>

                {/* 扫描线动画 */}
                {device.status === 'online' && (
                  <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scan-line"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
          status: Math.random() > 0.02 ? 'online' : 'offline',
          connections: (3000 + Math.floor(Math.random() * 500)).toLocaleString(),
          sessions: (7000 + Math.floor(Math.random() * 500)).toLocaleString(),
          bandwidth: '3.5M',
          throughput: '79.4M'
        },
        {
          name: 'F3/2',
          status: Math.random() > 0.02 ? 'online' : 'offline',
          connections: (7000 + Math.floor(Math.random() * 500)).toLocaleString(),
          sessions: (3000 + Math.floor(Math.random() * 500)).toLocaleString(),
          bandwidth: '79.4M',
          throughput: '3.5M'
        },
        {
          name: 'G2/1',
          status: Math.random() > 0.02 ? 'online' : 'offline',
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

    const interval = setInterval(() => {
      setDdosData(generateDdosData());
    }, 10000); // 每10秒更新一次

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative p-4 rounded-xl border border-orange-400/40 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent shadow-[0_0_25px_rgba(249,115,22,0.3)] backdrop-blur-sm">
      {/* 科幻背景装饰 */}
      <div className="absolute inset-0 rounded-xl bg-cyber-grid opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-60"></div>

      {/* 标题区域 */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400/20 to-red-500/20 border border-orange-400/30 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-orange-400">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-orange-300 uppercase tracking-wider">DDoS 防护</h4>
            <p className="text-xs text-slate-400">Distributed Denial of Service</p>
          </div>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          LOAD MONITOR
        </div>
      </div>

      {/* 设备网格 */}
      <div className="grid grid-cols-2 gap-2">
        {ddosData.map((device) => {
          const connectionCount = parseInt(device.connections.replace(/,/g, ''));
          const loadPercentage = Math.min((connectionCount / 8000) * 100, 100);

          return (
            <div key={device.name} className="relative group">
              {/* 设备卡片 */}
              <div className={`relative p-2 rounded-lg border transition-all duration-300 ${
                device.status === 'online'
                  ? 'border-orange-400/30 bg-gradient-to-br from-orange-500/10 to-red-500/5 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                  : 'border-red-400/30 bg-gradient-to-br from-red-500/10 to-orange-500/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              }`}>

                {/* 设备名称和状态 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      device.status === 'online' ? 'bg-orange-400 animate-pulse' : 'bg-red-400'
                    } shadow-[0_0_6px_currentColor]`}></div>
                    <span className="text-xs font-mono font-bold text-white">{device.name}</span>
                  </div>
                  <div className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                    device.status === 'online'
                      ? 'bg-orange-400/20 text-orange-300 border border-orange-400/30'
                      : 'bg-red-400/20 text-red-300 border border-red-400/30'
                  }`}>
                    {device.status === 'online' ? 'RUN' : 'OFF'}
                  </div>
                </div>

                {/* 负载指示器 */}
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">LOAD</span>
                    <span className={`text-xs font-mono font-bold ${
                      device.status === 'online'
                        ? loadPercentage > 80 ? 'text-red-400' : loadPercentage > 60 ? 'text-yellow-400' : 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {device.status === 'online' ? `${Math.round(loadPercentage)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        device.status === 'online'
                          ? loadPercentage > 80 ? 'bg-red-400' : loadPercentage > 60 ? 'bg-yellow-400' : 'bg-green-400'
                          : 'bg-red-400'
                      }`}
                      style={{
                        width: device.status === 'online' ? `${loadPercentage}%` : '100%'
                      }}
                    ></div>
                  </div>
                </div>

                {/* 统计数据 */}
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="text-center">
                    <div className="text-slate-400">连接</div>
                    <div className="font-mono text-cyan-300 font-bold text-xs">{device.connections}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">会话</div>
                    <div className="font-mono text-blue-300 font-bold text-xs">{device.sessions}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">带宽</div>
                    <div className="font-mono text-green-300 font-bold text-xs">{device.bandwidth}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">吞吐</div>
                    <div className="font-mono text-yellow-300 font-bold text-xs">{device.throughput}</div>
                  </div>
                </div>

                {/* 扫描线动画 */}
                {device.status === 'online' && (
                  <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-scan-line"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 状态图例 */}
      <div className="flex justify-center items-center mt-3 space-x-3 text-xs border-t border-orange-400/20 pt-2">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-sm mr-1 bg-green-400"></div>
          <span className="text-slate-400">正常 (&lt;60%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-sm mr-1 bg-yellow-400"></div>
          <span className="text-slate-400">警告 (60-80%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-sm mr-1 bg-red-400"></div>
          <span className="text-slate-400">危险 (&gt;80%)</span>
        </div>
      </div>
    </div>
  );
};

// 主设备状态面板组件
const DeviceStatusPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-1">设备状态监控</h3>
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
      </div>

      {/* WAF 状态 */}
      <div>
        <WafStatusRealtime />
      </div>

      {/* IPS 状态 */}
      <div>
        <IpsStatusComponent />
      </div>

      {/* DDoS 状态 */}
      <div>
        <DdosStatusComponent />
      </div>
    </div>
  );
};

export default DeviceStatusPanel;
