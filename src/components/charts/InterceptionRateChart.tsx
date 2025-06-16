import React, { useEffect, useState } from 'react';

interface InterceptionRateChartProps {
  // Props can be added later if data comes from parent
}

const InterceptionRateChart: React.FC<InterceptionRateChartProps> = () => {
  const [totalAttacks, setTotalAttacks] = useState(0);
  const [interceptedAttacks, setInterceptedAttacks] = useState(0);
  const [interceptionRate, setInterceptionRate] = useState('0.00%');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const mockTotalAttacks = Math.floor(Math.random() * 5000) + 10000;
    const rateFactor = Math.random() * 0.02 + 0.98;
    const mockInterceptedAttacks = Math.floor(mockTotalAttacks * rateFactor);

    setTotalAttacks(mockTotalAttacks);
    setInterceptedAttacks(mockInterceptedAttacks);

    if (mockTotalAttacks > 0) {
      const rate = (mockInterceptedAttacks / mockTotalAttacks) * 100;
      setInterceptionRate(rate.toFixed(2) + '%');
    } else {
      setInterceptionRate('N/A');
    }

    const timerId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const cornerBracketClass = "absolute w-4 h-4 border-cyan-500/80 z-10";

  return (
    <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl p-3 rounded-lg border border-cyan-700/70 shadow-[0_0_20px_rgba(0,180,220,0.3),_inset_0_0_15px_rgba(0,180,220,0.08)] text-white h-full flex flex-col justify-between min-h-[200px]">
      {/* Enhanced Corner Brackets */}
      <div className={`${cornerBracketClass} top-1 left-1 border-t-2 border-l-2 rounded-tl-sm`}></div>
      <div className={`${cornerBracketClass} top-1 right-1 border-t-2 border-r-2 rounded-tr-sm`}></div>
      <div className={`${cornerBracketClass} bottom-1 left-1 border-b-2 border-l-2 rounded-bl-sm`}></div>
      <div className={`${cornerBracketClass} bottom-1 right-1 border-b-2 border-r-2 rounded-br-sm`}></div>

      {/* Header Section */}
      <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-cyan-700/40">
        <h3 className="text-xs font-semibold text-cyan-300 uppercase tracking-wide flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          自动化拦截率
        </h3>
        <div className="font-mono text-[10px] text-cyan-400/90 tabular-nums tracking-wider bg-cyan-900/30 px-1.5 py-0.5 rounded">
          {currentTime}
        </div>
      </div>

      {/* Main Rate Display */}
      <div className="flex-grow flex flex-col justify-center items-center my-2">
        <div className="text-5xl font-mono font-bold bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 text-transparent bg-clip-text tabular-nums tracking-tight filter drop-shadow-[0_0_8px_rgba(80,220,220,0.8)] leading-none">
          {interceptionRate}
        </div>
        <div className="mt-1 px-2 py-0.5 bg-gradient-to-r from-cyan-600/20 to-sky-600/20 rounded-full border border-cyan-500/30">
          <p className="text-[10px] text-sky-300 tracking-wide font-medium">实时安全屏障效能</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-700/40">
        <div className="text-center bg-slate-800/50 rounded-md py-1.5 px-2 border border-slate-700/50">
          <span className="block text-[10px] uppercase text-cyan-300/80 font-medium tracking-wide leading-tight mb-0.5">
            攻击总数
          </span>
          <span className="block text-lg font-bold text-sky-200 tabular-nums leading-tight">
            {totalAttacks.toLocaleString()}
          </span>
        </div>
        <div className="text-center bg-emerald-900/30 rounded-md py-1.5 px-2 border border-emerald-700/50">
          <span className="block text-[10px] uppercase text-cyan-300/80 font-medium tracking-wide leading-tight mb-0.5">
            拦截攻击数
          </span>
          <span className="block text-lg font-bold text-emerald-300 tabular-nums filter drop-shadow-[0_0_4px_rgba(74,222,128,0.6)] leading-tight">
            {interceptedAttacks.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InterceptionRateChart;
