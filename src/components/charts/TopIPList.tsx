import React from 'react';

interface TopIPListProps {
  data: { name: string; value: number }[];
  max?: number;
  baseColor?: string;
}

const gradientColors = [
  'from-[#00d9ff] to-[#38bdf8]', // top1
  'from-[#38bdf8] to-[#818cf8]', // top2
  'from-[#818cf8] to-[#a5b4fc]', // top3
  'from-[#a5b4fc] to-[#f472b6]', // top4
  'from-[#f472b6] to-[#fcd34d]', // top5
];

const TopIPList: React.FC<TopIPListProps> = ({ data, max, baseColor = '#00d9ff', idSuffix = 'topip' }) => {
  const maxValue = max || (data.length > 0 ? Math.max(...data.map(d => d.value)) : 1);
  return (
    <div className="flex flex-col gap-2">
      {data.map((item, idx) => (
        <div
          key={item.name}
          className={`relative flex items-center rounded-md px-3 py-2 shadow-md bg-[#0f172a]/80 hover:bg-[#1e293b]/90 transition group border border-[#00d9ff]/20`}
          style={{
            boxShadow: idx === 0 ? `0 0 12px 2px ${baseColor}` : undefined,
            zIndex: 10 - idx,
          }}
        >
          {/* IP 地址 */}
          <span
            className={`font-mono text-[1.01rem] md:text-base font-bold text-[#e0f2fe] select-text cursor-pointer group-hover:text-[#00d9ff]`}
            title="点击复制"
            onClick={() => navigator.clipboard.writeText(item.name)}
          >
            {item.name}
          </span>
          {/* 渐变条/进度条 */}
          <div className="flex-1 mx-3">
            <div
              className={`h-3 rounded-full bg-gradient-to-r ${gradientColors[idx] || 'from-[#334155] to-[#64748b]'}`}
              style={{
                width: `${Math.max((item.value / maxValue) * 100, 8)}%`,
                boxShadow: idx === 0 ? `0 0 8px 2px ${baseColor}` : undefined,
                transition: 'width 0.5s',
              }}
            ></div>
          </div>
          {/* 次数数值 */}
          <span className="font-semibold text-[#bae6fd] text-sm ml-2 min-w-[48px] text-right">
            {item.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TopIPList;
