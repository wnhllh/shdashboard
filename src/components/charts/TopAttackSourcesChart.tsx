import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface AttackerData {
  source: string;
  count: number;
}

interface TopAttackSourcesChartProps {
  domesticData: AttackerData[];
  foreignData: AttackerData[];
}

const TopAttackSourcesChart: React.FC<TopAttackSourcesChartProps> = ({ domesticData, foreignData }) => {

  const commonBarProps = {
    barSize: 15,
  };

  const commonYAxisProps = {
    type: 'category' as const,
    stroke: '#a0a0a0',
    fontSize: 10,
    width: 100, // Adjusted for potentially longer labels
    interval: 0 as const,
  };

  const commonXAxisProps = {
    type: 'number' as const,
    stroke: '#a0a0a0',
    fontSize: 10,
  };

  const commonTooltipProps = {
    contentStyle: { backgroundColor: 'rgba(30,41,59,0.8)', border: 'none', borderRadius: '4px', fontSize: '12px' },
    itemStyle: { color: '#e2e8f0' },
    cursor: { fill: 'rgba(200,200,200,0.1)' },
  };

  return (
    <React.Fragment>
      <div className="w-full h-full flex flex-col justify-around"> {/* Changed to justify-around for better spacing if container is tall */}
        <div>
          <h4 className="text-xs font-semibold text-cyan-400 mb-1 text-center">国内 Top 5 攻击源</h4>
          <ResponsiveContainer width="100%" height={Math.max(domesticData.length * 22 + 40, 100)}> {/* Adjusted item height and base */}
            <BarChart data={domesticData} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis {...commonXAxisProps} />
              <YAxis dataKey="source" {...commonYAxisProps} />
              <Tooltip {...commonTooltipProps} />
              <Bar dataKey="count" fill="#22d3ee" {...commonBarProps}>
                 <LabelList dataKey="count" position="right" style={{ fill: 'white', fontSize: 10 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1"> {/* Reduced margin-top */} 
          <h4 className="text-xs font-semibold text-amber-400 mb-1 text-center">国外 Top 5 攻击源</h4>
          <ResponsiveContainer width="100%" height={Math.max(foreignData.length * 22 + 40, 100)}> {/* Adjusted item height and base */}
            <BarChart data={foreignData} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis {...commonXAxisProps} />
              <YAxis dataKey="source" {...commonYAxisProps} />
              <Tooltip {...commonTooltipProps} />
              <Bar dataKey="count" fill="#facc15" {...commonBarProps}>
                <LabelList dataKey="count" position="right" style={{ fill: 'white', fontSize: 10 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </React.Fragment>
  );
};

export default TopAttackSourcesChart;
