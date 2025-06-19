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
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-emerald-900/20 via-black/50 to-green-900/20 backdrop-blur-sm p-4 rounded-xl border border-emerald-400/30 shadow-[0_0_25px_rgba(52,211,153,0.15)] overflow-hidden">
      {/* 科幻背景效果 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(52,211,153,0.1),transparent_50%)]"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"></div>

      {/* 标题区域 */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center backdrop-blur-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
                      stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">WAF 防护墙</h4>
            <p className="text-xs text-emerald-500/70">Web Application Firewall</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          PING STATUS
        </div>
      </div>

      {/* 设备网格 */}
      <div className="relative grid grid-cols-2 gap-3">
        {wafData.map((device) => (
          <div key={device.name} className="relative group">
            {/* 设备卡片 */}
            <div className={`relative p-3 rounded-lg border transition-all duration-500 ${
              device.status === 'online'
                ? 'bg-emerald-950/30 border-emerald-400/40 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                : 'bg-red-950/30 border-red-400/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            }`}>
              {/* 状态指示器 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`relative w-2 h-2 rounded-full ${
                    device.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'
                  }`}>
                    {device.status === 'online' && (
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-white">{device.name}</span>
                </div>
                <div className={`text-xs font-mono ${
                  device.status === 'online' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {device.status === 'online' ? 'ONLINE' : 'OFFLINE'}
                </div>
              </div>

              {/* IP地址 */}
              <div className="mb-2">
                <div className="text-xs text-slate-400 mb-1">IP ADDRESS</div>
                <div className="text-xs font-mono text-cyan-300">{device.ip}</div>
              </div>

              {/* Ping延迟 */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">PING</div>
                <div className={`text-xs font-mono font-bold ${
                  device.status === 'online'
                    ? device.lastPing < 30
                      ? 'text-emerald-400'
                      : device.lastPing < 50
                        ? 'text-yellow-400'
                        : 'text-orange-400'
                    : 'text-red-400'
                }`}>
                  {device.status === 'online' ? `${device.lastPing}ms` : 'TIMEOUT'}
                </div>
              </div>

              {/* 连接状态条 */}
              <div className="mt-2 h-1 bg-slate-800/50 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${
                  device.status === 'online'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-300'
                    : 'bg-gradient-to-r from-red-500 to-red-300'
                }`} style={{
                  width: device.status === 'online' ? '100%' : '0%'
                }}></div>
              </div>
            </div>

            {/* 悬浮效果 */}
            <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              device.status === 'online'
                ? 'bg-emerald-400/5 border border-emerald-400/20'
                : 'bg-red-400/5 border border-red-400/20'
            }`}></div>
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
    <div className="relative bg-gradient-to-br from-purple-900/20 via-black/50 to-indigo-900/20 backdrop-blur-sm p-4 rounded-xl border border-purple-400/30 shadow-[0_0_25px_rgba(147,51,234,0.15)] overflow-hidden">
      {/* 科幻背景效果 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(147,51,234,0.1),transparent_50%)]"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>

      {/* 标题区域 */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center backdrop-blur-sm">
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
            <p className="text-xs text-purple-500/70">Intrusion Prevention System</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          PING STATUS
        </div>
      </div>

      {/* 设备网格 */}
      <div className="relative grid grid-cols-2 gap-3">
        {ipsData.map((device) => (
          <div key={device.name} className="relative group">
            {/* 设备卡片 */}
            <div className={`relative p-3 rounded-lg border transition-all duration-500 ${
              device.status === 'online'
                ? 'bg-purple-950/30 border-purple-400/40 shadow-[0_0_15px_rgba(147,51,234,0.2)]'
                : 'bg-red-950/30 border-red-400/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            }`}>
              {/* 状态指示器 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`relative w-2 h-2 rounded-full ${
                    device.status === 'online' ? 'bg-purple-400' : 'bg-red-400'
                  }`}>
                    {device.status === 'online' && (
                      <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-75"></div>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-white">{device.name}</span>
                </div>
                <div className={`text-xs font-mono ${
                  device.status === 'online' ? 'text-purple-400' : 'text-red-400'
                }`}>
                  {device.status === 'online' ? 'ONLINE' : 'OFFLINE'}
                </div>
              </div>

              {/* IP地址 */}
              <div className="mb-2">
                <div className="text-xs text-slate-400 mb-1">IP ADDRESS</div>
                <div className="text-xs font-mono text-cyan-300">{device.ip}</div>
              </div>

              {/* Ping延迟 */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">PING</div>
                <div className={`text-xs font-mono font-bold ${
                  device.status === 'online'
                    ? device.lastPing < 30
                      ? 'text-purple-400'
                      : device.lastPing < 50
                        ? 'text-yellow-400'
                        : 'text-orange-400'
                    : 'text-red-400'
                }`}>
                  {device.status === 'online' ? `${device.lastPing}ms` : 'TIMEOUT'}
                </div>
              </div>

              {/* 连接状态条 */}
              <div className="mt-2 h-1 bg-slate-800/50 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${
                  device.status === 'online'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-300'
                    : 'bg-gradient-to-r from-red-500 to-red-300'
                }`} style={{
                  width: device.status === 'online' ? '100%' : '0%'
                }}></div>
              </div>
            </div>

            {/* 悬浮效果 */}
            <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              device.status === 'online'
                ? 'bg-purple-400/5 border border-purple-400/20'
                : 'bg-red-400/5 border border-red-400/20'
            }`}></div>
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
    <div className="relative bg-gradient-to-br from-orange-900/20 via-black/50 to-red-900/20 backdrop-blur-sm p-4 rounded-xl border border-orange-400/30 shadow-[0_0_25px_rgba(249,115,22,0.15)] overflow-hidden">
      {/* 科幻背景效果 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_50%)]"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent"></div>

      {/* 标题区域 */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-400/40 flex items-center justify-center backdrop-blur-sm">
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
            <p className="text-xs text-orange-500/70">Distributed Denial of Service</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          LOAD MONITOR
        </div>
      </div>

      {/* 设备网格 */}
      <div className="relative grid grid-cols-4 gap-2">
        {ddosData.map((device) => {
          // 计算负载百分比 (基于连接数)
          const connectionCount = parseInt(device.connections.replace(/,/g, ''));
          const loadPercentage = Math.min((connectionCount / 8000) * 100, 100);

          return (
            <div key={device.name} className="relative group">
              {/* 设备卡片 */}
              <div className={`relative p-2 rounded-lg border transition-all duration-500 ${
                device.status === 'online'
                  ? 'bg-orange-950/30 border-orange-400/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                  : 'bg-red-950/30 border-red-400/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
              }`}>
                {/* 设备名称与状态 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <div className={`relative w-1.5 h-1.5 rounded-full ${
                      device.status === 'online' ? 'bg-orange-400' : 'bg-red-400'
                    }`}>
                      {device.status === 'online' && (
                        <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75"></div>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{device.name}</span>
                  </div>

                  {/* 负载条 */}
                  <div className="relative w-1.5 h-6 bg-slate-800/80 rounded-sm border border-slate-600/50 overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 w-full transition-all duration-1000"
                      style={{
                        height: `${device.status === 'offline' ? 10 : loadPercentage}%`,
                        backgroundColor: device.status === 'offline'
                          ? '#FF0040'
                          : loadPercentage > 80
                            ? '#FF0040'  // 鲜红色 - 危险
                            : loadPercentage > 60
                              ? '#FFFF00'  // 纯黄色 - 警告
                              : '#00FF80'  // 春绿色 - 正常
                      }}
                    ></div>
                  </div>
                </div>

                {/* 负载百分比 */}
                <div className="text-center mb-2">
                  <span className="text-xs font-bold text-white">
                    {device.status === 'offline' ? 'OFF' : `${Math.round(loadPercentage)}%`}
                  </span>
                </div>

                {/* 数据列表 */}
                <div className="space-y-1 text-xs">
                  <div className="text-center">
                    <span className="font-mono text-cyan-300">{device.connections}</span>
                    <div className="text-slate-500 text-xs">连接</div>
                  </div>
                  <div className="text-center">
                    <span className="font-mono text-blue-300">{device.sessions}</span>
                    <div className="text-slate-500 text-xs">会话</div>
                  </div>
                  <div className="text-center">
                    <span className="font-mono text-green-300">{device.bandwidth}</span>
                    <div className="text-slate-500 text-xs">带宽</div>
                  </div>
                  <div className="text-center">
                    <span className="font-mono text-yellow-300">{device.throughput}</span>
                    <div className="text-slate-500 text-xs">吞吐</div>
                  </div>
                </div>
              </div>

              {/* 悬浮效果 */}
              <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                device.status === 'online'
                  ? 'bg-orange-400/5 border border-orange-400/20'
                  : 'bg-red-400/5 border border-red-400/20'
              }`}></div>
            </div>
          );
        })}
      </div>

      {/* 状态图例 */}
      <div className="flex justify-center items-center mt-4 space-x-4 text-xs border-t border-orange-400/20 pt-3">
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
    <div className="relative space-y-6">
      {/* 科幻主标题 */}
      <div className="relative text-center mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-xl"></div>
        <div className="relative">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2 tracking-wider">
            CYBERSECURITY DEVICE MONITOR
          </h3>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-400"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-400"></div>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-mono uppercase tracking-widest">
            REAL-TIME STATUS MONITORING
          </p>
        </div>
      </div>

      {/* WAF 状态 */}
      <div className="transform transition-all duration-500 hover:scale-[1.02]">
        <WafStatusComponent />
      </div>

      {/* IPS 状态 */}
      <div className="transform transition-all duration-500 hover:scale-[1.02]">
        <IpsStatusComponent />
      </div>

      {/* DDoS 状态 */}
      <div className="transform transition-all duration-500 hover:scale-[1.02]">
        <DdosStatusComponent />
      </div>

      {/* 底部装饰 */}
      <div className="relative pt-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
        <div className="flex justify-center items-center space-x-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
            <span>WAF</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
            <span>IPS</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
            <span>DDoS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceStatusPanel;
