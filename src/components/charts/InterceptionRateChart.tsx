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

  const cornerBracketClass = "absolute w-5 h-5 border-cyan-600/70 z-10"; // Made brackets more substantial

  return (
    <div className="relative bg-slate-900/85 backdrop-blur-xl p-4 rounded-sm border border-cyan-800/60 shadow-[0_0_25px_rgba(0,180,220,0.2),_inset_0_0_10px_rgba(0,180,220,0.1)] text-white text-center h-full flex flex-col justify-between min-h-[250px]">
      {/* Enhanced Corner Brackets */}
      <div className={`${cornerBracketClass} top-0 left-0 border-t-2 border-l-2 rounded-tl-sm`}></div>
      <div className={`${cornerBracketClass} top-0 right-0 border-t-2 border-r-2 rounded-tr-sm`}></div>
      <div className={`${cornerBracketClass} bottom-0 left-0 border-b-2 border-l-2 rounded-bl-sm`}></div>
      <div className={`${cornerBracketClass} bottom-0 right-0 border-b-2 border-r-2 rounded-br-sm`}></div>

      {/* Header Section */}
      <div className="flex justify-between items-center pb-2 mb-2 border-b border-cyan-700/50">
        <h3 className="text-sm font-medium text-cyan-300 uppercase tracking-wider flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          自动化拦截率
        </h3>
        <div className="font-mono text-xs text-cyan-400 tabular-nums tracking-wider">
          {currentTime}
        </div>
      </div>

      {/* Main Rate Display */}
      <div className="flex-grow flex flex-col justify-center items-center my-3">
        <div className="text-6xl font-mono font-bold bg-gradient-to-r from-sky-300 via-cyan-400 to-teal-300 text-transparent bg-clip-text tabular-nums tracking-tight filter drop-shadow-[0_0_6px_rgba(80,220,220,0.7)]">
          {interceptionRate}
        </div>
        <p className="text-[0.7rem] text-sky-300/90 tracking-wide font-medium mt-1.5">实时安全屏障效能</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-cyan-700/50">
        <div className="text-center">
          <span className="block text-xl uppercase text-cyan-300/90 font-medium tracking-wide leading-tight">
            攻击总数
          </span>
          <span className="block text-xl font-semibold text-sky-200 tabular-nums mt-1 leading-tight">
            {totalAttacks.toLocaleString()}
          </span>
        </div>
        <div className="text-center">
          <span className="block text-xl uppercase text-cyan-300/90 font-medium tracking-wide leading-tight">
            拦截攻击数
          </span>
          <span className="block text-xl font-semibold text-green-400 tabular-nums filter drop-shadow-[0_0_3px_rgba(74,222,128,0.7)] mt-1 leading-tight">
            {interceptedAttacks.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InterceptionRateChart;
