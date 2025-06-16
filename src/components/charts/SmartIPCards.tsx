import React, { useState } from 'react';

interface IPInfo {
  ip: string;
  count: number;
  country?: string;
  countryCode?: string;
  location?: string;
  threatLevel?: 'low' | 'medium' | 'high' | 'critical';
  threatInfo?: string;
  isp?: string;
}

interface SmartIPCardsProps {
  data: IPInfo[];
  baseColor?: string;
  showDetails?: boolean;
}

// 简化版的国旗数据 - 正式环境建议使用国旗图标库或API
const countryFlagEmojis: Record<string, string> = {
  'CN': '🇨🇳',
  'US': '🇺🇸',
  'JP': '🇯🇵',
  'KR': '🇰🇷',
  'RU': '🇷🇺',
  'GB': '🇬🇧',
  'DE': '🇩🇪',
  'FR': '🇫🇷',
  'CA': '🇨🇦',
  'AU': '🇦🇺',
  // 可根据需要扩充
};

// 威胁等级对应的颜色
const threatColors = {
  'low': '#4ade80',
  'medium': '#facc15',
  'high': '#fb923c',
  'critical': '#ef4444',
};

const SmartIPCards: React.FC<SmartIPCardsProps> = ({ 
  data, 
  baseColor = '#00d9ff',
  showDetails = true
}) => {
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 2);
  const maxValue = Math.max(...sortedData.map(item => item.count));
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  return (
    <div className="grid gap-0.5">
      {sortedData.map((item, index) => {
        const flag = item.countryCode ? countryFlagEmojis[item.countryCode] || '' : '';
        const isExpanded = expandedIndex === index;
        const percentage = Math.max((item.count / maxValue) * 100, 15);
        
        return (
          <div 
            key={item.ip}
            className={`relative rounded-sm transition-all duration-300 overflow-hidden bg-[#0a1629] bg-opacity-80 border-l ${index === 0 ? 'border-[#00d9ff]' : 'border-[#00d9ff20]'}`}
            style={{
              height: isExpanded ? 'auto' : '40px',
              boxShadow: index === 0 ? `0 0 6px 0px ${baseColor}30` : undefined,
            }}
            onClick={() => setExpandedIndex(isExpanded ? null : index)}
          >
            {/* 进度条背景，表示攻击量占比 */}
            <div 
              className="absolute left-0 top-0 h-full bg-[#0e2b45] z-0 transition-all duration-500 opacity-40"
              style={{ width: `${percentage}%` }}
            />
            
            {/* 内容区 */}
            <div className="relative z-10 px-2 py-1.5 flex items-center">
              {/* 威胁等级指示点 */}
              <div 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: threatColors[item.threatLevel || 'medium'] }}
              />
              
              {/* IP地址与国旗 */}
              <div className="flex items-center flex-1 space-x-1">
                <span className="font-mono text-xs font-medium text-[#e0f2fe]">{item.ip}</span>
                <span className="text-xs">{flag}</span>
                
                <div className="flex-1" />
                
                <span className="text-2xs px-1 py-0 rounded-sm bg-[#0c1c2d] text-[#94a3b8]">
                  {item.count.toLocaleString()}
                </span>

                <div className="ml-1">
                  <svg 
                    className={`w-4 h-4 text-[#64748b] transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {/* Location and ISP info removed from collapsed view for compactness */}
            </div>
            
            {/* 展开后显示的详情 */}
            {isExpanded && showDetails && (
              <div className="px-2 pb-1.5 text-xs border-t border-[#334155] border-opacity-30">
                <div className="mt-1 flex flex-wrap text-2xs">
                  <div className="flex items-center mr-3">
                    <span 
                      className="inline-block w-1.5 h-1.5 mr-1 rounded-full" 
                      style={{ backgroundColor: threatColors[item.threatLevel || 'medium'] }}
                    ></span>
                    <span className="text-[#94a3b8]">威胁:</span>
                    <span 
                      className="ml-1" 
                      style={{ color: threatColors[item.threatLevel || 'medium'] }}
                    >
                      {item.threatLevel === 'critical' ? '严重' : 
                        item.threatLevel === 'high' ? '高危' :
                        item.threatLevel === 'medium' ? '中等' : '低'}
                    </span>
                    <span className="mx-1 opacity-50">|</span>
                    <span>{item.threatInfo || '未知类型'}</span>
                  </div>
                
                  <div className="flex items-center mr-3">
                    <span className="text-[#94a3b8]">攻击:</span>
                    <span className="ml-1 text-[#e0f2fe]">{item.count.toLocaleString()}</span>
                    <span className="ml-1 text-[#64748b]">(占比 {Math.round(percentage)}%)</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap mt-1.5 text-2xs">
                  <div className="flex items-center mr-4">
                    <span className="text-[#94a3b8]">国家/地区:</span>
                    <span className="ml-1 text-[#e0f2fe]">{flag} {item.country || '未知'}</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <span className="text-[#94a3b8]">位置:</span>
                    <span className="ml-1 text-[#e0f2fe]">{item.location || '未知'}</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <span className="text-[#94a3b8]">服务商:</span>
                    <span className="ml-1 text-[#e0f2fe]">{item.isp || '未知'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[#94a3b8]">最后活动:</span>
                    <span className="ml-1 text-[#e0f2fe]">2小时前</span>
                  </div>
                </div>
                
                <div className="mt-1.5 flex text-2xs">
                  <button className="text-[#00d9ff] hover:text-[#38bdf8] mr-2 px-1.5 py-0.5 bg-[#0f172a] bg-opacity-50 rounded-sm">
                    添加到黑名单
                  </button>
                  <button className="text-[#00d9ff] hover:text-[#38bdf8] px-1.5 py-0.5 bg-[#0f172a] bg-opacity-50 rounded-sm">
                    查看活动历史
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SmartIPCards;
