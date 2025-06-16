import React, { useRef, useEffect } from 'react';

// 防火墙状态类型
type FirewallStatus = 'green' | 'red' | 'yellow';

interface Firewall {
  id: string;
  name: string;
  status: FirewallStatus;
  desc?: string;
}

interface FirewallStatusLightsProps {
  firewalls: Firewall[];
}

// 灯光颜色和阴影
// const statusStyles = { ... }   // 已删除未使用的 statusStyles
// 纵向自动滚动hook（仅绿灯区）
function useVerticalScroll(scrollRef: React.RefObject<HTMLDivElement>, itemCount: number, itemHeight: number, speed = 1) {
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || itemCount <= 0) return;
    let raf: number;
    let offset = 0;
    function animate() {
      if (!el) return; // 防止 el 为 null
      offset += speed;
      if (offset >= itemCount * itemHeight) offset = 0;
      el.scrollTop = offset;
      raf = window.requestAnimationFrame(animate);
    }
    raf = window.requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [scrollRef, itemCount, itemHeight, speed]);
}


const FirewallStatusLights: React.FC<FirewallStatusLightsProps> = ({ firewalls }) => {
  // 红灯置顶，绿灯滚动
  const reds = firewalls.filter(f => f.status === 'red' || f.status === 'yellow');
  const greens = firewalls.filter(f => f.status === 'green');
  const itemHeight = 28;
  const greenList = [...greens, ...greens]; // for seamless scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  useVerticalScroll(scrollRef, greens.length, itemHeight, greens.length > 6 ? 0.5 : 0); // 仅当绿灯多于6个才滚动

  return (
    <div className="w-full backdrop-blur-[6px] bg-gradient-to-br from-[#0f172aee] to-[#334155cc] px-4 py-3 border border-[#38bdf8]/30 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] ring-1 ring-[#7dd3fc]/20 transition-all duration-300">
      <div className="flex items-center mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#38bdf8]/90 to-[#0ea5e9]/60 shadow-[0_0_12px_2px_rgba(56,189,248,0.3)] mr-2">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="#38bdf8" d="M12 2c-.55 0-1 .45-1 1v1.07C7.06 4.56 4 7.92 4 12c0 4.08 3.06 7.44 7 7.93V21c0 .55.45 1 1 1s1-.45 1-1v-1.07c3.94-.49 7-3.85 7-7.93 0-4.08-3.06-7.44-7-7.93V3c0-.55-.45-1-1-1Zm0 3c3.31 0 6 2.69 6 6 0 3.31-2.69 6-6 6s-6-2.69-6-6c0-3.31 2.69-6 6-6Z"/></svg>
        </span>
        <span className="text-lg font-bold text-[#e0f2fe] tracking-wide drop-shadow">防火墙状态监控</span>
        <div className="ml-auto flex items-center">
          <span className="inline-block h-[3px] w-8 bg-[#38bdf8] shadow-[0_0_6px_#38bdf8] animate-pulse rounded-full mr-2"></span>
          <span className="inline-block h-2 w-2 rounded-full bg-[#38bdf8] shadow-[0_0_6px_#38bdf8] animate-pulse"></span>
        </div>
      </div>
      {/* 红灯（异常）置顶，两列排列 */}
      {reds.length > 0 && (
        <div className="mb-2 grid grid-cols-2 gap-2">
          {reds.map(fw => (
            <div key={fw.id} className="flex items-center px-2 py-1 rounded-lg bg-gradient-to-r from-[#ff3b3b22] to-[#f8717188] border border-red-400 shadow-[0_0_10px_#ff3b3b33] animate-pulse min-h-[24px]">
              <span className="inline-block w-2 h-2 rounded-full mr-1 border border-white bg-red-500 shadow-[0_0_8px_#ff3b3b] animate-pulse"></span>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-[#fff] text-[13px] truncate max-w-[140px]" title={fw.name}>{fw.name}</span>
                {fw.desc && <span className="text-[10px] text-[#fca5a5] truncate">{fw.desc}</span>}
              </div>

            </div>
          ))}
        </div>
      )}
      {/* 绿灯（正常）纵向滚动展示，两列紧凑排列 */}
      <div
        className={`relative w-full mt-1${greens.length > 6 ? ' overflow-hidden' : ''}`}
        style={greens.length > 6 ? { height: 6 * itemHeight } : {}}
      >
        <div
          ref={scrollRef}
          className="grid grid-cols-2 gap-2 w-full"
          style={{ minHeight: Math.ceil(greenList.length / 2) * itemHeight }}
        >
          {greenList.map((fw, idx) => (
            <div key={fw.id + '-' + idx} className="flex items-center px-2 py-1 rounded-lg bg-gradient-to-r from-[#22d3ee44] to-[#4ade8044] border border-green-300 shadow-[0_0_8px_#22d3ee33] min-h-[20px]">
              <span className="inline-block w-2 h-2 rounded-full mr-1 border border-white bg-green-400 shadow-[0_0_7px_#4ade80] animate-pulse"></span>
              <span className="font-semibold text-[#d1fae5] text-[12px] tracking-tight truncate max-w-[90px]" title={fw.name}>
                {fw.name}
              </span>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FirewallStatusLights;
