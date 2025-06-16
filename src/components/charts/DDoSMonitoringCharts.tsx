import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface TrafficData {
  time: Date;
  incoming: number;
  passed: number;
  dropped: number;
}

interface AttackData {
  time: Date;
  synFlood: number;
  tcpMisuse: number;
  manualStrategy: number;
}

interface DeviceData {
  name: string;
  status: 'online' | 'offline';
  connections: string;
  sessions: string;
  bandwidth: string;
  throughput: string;
}

const DDoSMonitoringCharts: React.FC = () => {
  const trafficSvgRef = useRef<SVGSVGElement | null>(null);
  const attackSvgRef = useRef<SVGSVGElement | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [attackData, setAttackData] = useState<AttackData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);

  // 生成模拟数据
  useEffect(() => {
    const generateTrafficData = (): TrafficData[] => {
      const data: TrafficData[] = [];
      const now = new Date();
      
      for (let i = 25; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000); // 每分钟一个数据点
        
        // 创建真实的有高有低的变化（不是全高）
        // 基础流量相对较低，偶尔有峰值
        let incoming, passed;
        
        // 创建几个特定的峰值点
        if (i === 22 || i === 8 || i === 2) {
          // 高峰值点
          incoming = 25000000 + Math.random() * 5000000; // 25M-30M
        } else if (i === 20 || i === 15 || i === 6) {
          // 中等值点
          incoming = 12000000 + Math.random() * 8000000; // 12M-20M
        } else {
          // 大部分时间是低值
          incoming = 2000000 + Math.random() * 4000000; // 2M-6M
        }
        
        // Passed基本跟随incoming但略低
        passed = incoming * (0.85 + Math.random() * 0.1);
        
        // Dropped相对小且变化不大
        const dropped = 5000 + Math.random() * 15000; // 5K-20K
        
        data.push({
          time,
          incoming: incoming,
          passed: passed,
          dropped: dropped
        });
      }
      return data;
    };

    const generateAttackData = (): AttackData[] => {
      const data: AttackData[] = [];
      const now = new Date();
      
      for (let i = 25; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        // 模拟图片中的攻击数据模式
        const peakFactor = i > 15 && i < 20 ? 8 : 1; // 在中间时段制造峰值
        data.push({
          time,
          synFlood: (7000 + Math.random() * 3000) * peakFactor, // SYN Flood有明显峰值
          tcpMisuse: Math.random() * 500, // TCP Misuse保持低水平
          manualStrategy: 4000 + Math.random() * 2000 // Manual Strategy中等水平
        });
      }
      return data;
    };

    const generateDeviceData = (): DeviceData[] => {
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

    setTrafficData(generateTrafficData());
    setAttackData(generateAttackData());
    setDeviceData(generateDeviceData());

    // 每30秒更新一次数据
    const interval = setInterval(() => {
      setTrafficData(generateTrafficData());
      setAttackData(generateAttackData());
      setDeviceData(generateDeviceData());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 绘制流量趋势图 - 镜像对称效果
  useEffect(() => {
    if (!trafficData.length || !trafficSvgRef.current) return;

    const svg = d3.select(trafficSvgRef.current);
    svg.selectAll('*').remove();

    // 获取容器实际宽度
    const containerWidth = trafficSvgRef.current.parentElement?.offsetWidth || 300;
    const margin = { top: 5, right: 5, bottom: 20, left: 5 };
    const width = containerWidth - margin.left - margin.right;
    const height = 120 - margin.top - margin.bottom;
    
    // 更新SVG尺寸
    svg.attr('width', containerWidth).attr('height', 120);
    
    // 中心线位置
    const centerY = height / 2;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 创建比例尺
    const xScale = d3.scaleTime()
      .domain(d3.extent(trafficData, d => d.time) as [Date, Date])
      .range([0, width]);

    // 上半部分比例尺（正向）
    const upperYScale = d3.scaleLinear()
      .domain([0, d3.max(trafficData, d => Math.max(d.incoming, d.passed)) as number])
      .range([centerY, 0]);

    // 下半部分比例尺（负向镜像）
    const lowerYScale = d3.scaleLinear()
      .domain([0, d3.max(trafficData, d => d.dropped) as number])
      .range([centerY, height]);

    // 创建区域生成器 - 上半部分（正向）
    const areaIncoming = d3.area<TrafficData>()
      .x(d => xScale(d.time))
      .y0(centerY)
      .y1(d => upperYScale(d.incoming))
      .curve(d3.curveBasis);

    const areaPassed = d3.area<TrafficData>()
      .x(d => xScale(d.time))
      .y0(centerY)
      .y1(d => upperYScale(d.passed))
      .curve(d3.curveBasis);

    // 创建区域生成器 - 下半部分（负向镜像）
    const areaDropped = d3.area<TrafficData>()
      .x(d => xScale(d.time))
      .y0(centerY)
      .y1(d => lowerYScale(d.dropped))
      .curve(d3.curveBasis);

    // 创建渐变
    const defs = svg.append('defs');
    
    // 直接使用纯色，不用渐变
    // Incoming - 黄橙色（纯色）
    // Passed - 绿色（纯色）  
    // Dropped - 红色（纯色）

    // 绘制区域 - 使用纯色填充
    g.append('path')
      .datum(trafficData)
      .attr('fill', '#ffb74d')
      .attr('fill-opacity', 0.8)
      .attr('d', areaIncoming);

    g.append('path')
      .datum(trafficData)
      .attr('fill', '#81c784')
      .attr('fill-opacity', 0.7)
      .attr('d', areaPassed);

    g.append('path')
      .datum(trafficData)
      .attr('fill', '#e57373')
      .attr('fill-opacity', 0.8)
      .attr('d', areaDropped);

    // 添加中心基线
    g.append('line')
      .attr('x1', 0)
      .attr('y1', centerY)
      .attr('x2', width)
      .attr('y2', centerY)
      .attr('stroke', '#475569')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);

    // 添加X轴（只在底部）
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%H:%M'))
      .ticks(5);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '9px');

    g.selectAll('.domain, .tick line')
      .style('stroke', '#475569')
      .style('stroke-width', 0.5);

  }, [trafficData]);

  // 绘制攻击流量图 - 折线图样式
  useEffect(() => {
    if (!attackData.length || !attackSvgRef.current) return;

    const svg = d3.select(attackSvgRef.current);
    svg.selectAll('*').remove();

    // 获取容器实际宽度
    const containerWidth = attackSvgRef.current.parentElement?.offsetWidth || 300;
    const margin = { top: 10, right: 5, bottom: 20, left: 5 };
    const width = containerWidth - margin.left - margin.right;
    const height = 120 - margin.top - margin.bottom;

    // 更新SVG尺寸
    svg.attr('width', containerWidth).attr('height', 120);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 创建比例尺
    const xScale = d3.scaleTime()
      .domain(d3.extent(attackData, d => d.time) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(attackData, d => Math.max(d.synFlood, d.tcpMisuse, d.manualStrategy)) as number])
      .range([height, 0]);

    // 创建线条生成器
    const synFloodLine = d3.line<AttackData>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.synFlood))
      .curve(d3.curveBasis);

    const tcpMisuseLine = d3.line<AttackData>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.tcpMisuse))
      .curve(d3.curveBasis);

    const manualStrategyLine = d3.line<AttackData>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.manualStrategy))
      .curve(d3.curveBasis);

    // 创建发光效果
    const defs = svg.append('defs');
    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur');

    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // 绘制线条
    g.append('path')
      .datum(attackData)
      .attr('fill', 'none')
      .attr('stroke', '#f48fb1') // SYN Flood - 粉红色
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#glow)')
      .attr('d', synFloodLine);

    g.append('path')
      .datum(attackData)
      .attr('fill', 'none')
      .attr('stroke', '#81c784') // TCP Misuse - 绿色
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#glow)')
      .attr('d', tcpMisuseLine);

    g.append('path')
      .datum(attackData)
      .attr('fill', 'none')
      .attr('stroke', '#64b5f6') // Manual Strategy - 蓝色
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#glow)')
      .attr('d', manualStrategyLine);

    // 添加X轴
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%H:%M'))
      .ticks(5);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '9px');

    g.selectAll('.domain, .tick line')
      .style('stroke', '#475569')
      .style('stroke-width', 0.5);

  }, [attackData]);

  // 计算当前数值
  const latestTraffic = trafficData[trafficData.length - 1];
  const latestAttack = attackData[attackData.length - 1];

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(0);
  };

  return (
    <div className="space-y-3">
      {/* 流量趋势图 */}
      <div className="bg-slate-900/50 backdrop-blur-sm p-2 rounded border border-slate-700/50">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-[10px] font-medium text-slate-300 uppercase tracking-wide">流量趋势</h4>
          <div className="flex space-x-2 text-[9px] text-slate-500">
            <span>统计对象: 全局</span>
            <span>单位: bps</span>
          </div>
        </div>
        
        <svg ref={trafficSvgRef} height="120" className="w-full bg-slate-950/30 rounded"></svg>
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center space-x-3 text-[9px]">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 mr-1 rounded-sm"></div>
              <span className="text-slate-400">Incoming</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 mr-1 rounded-sm"></div>
              <span className="text-slate-400">Passed</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 mr-1 rounded-sm"></div>
              <span className="text-slate-400">Dropped</span>
            </div>
          </div>
          <div className="flex space-x-2 text-[10px] font-mono">
            <span className="text-yellow-400">{latestTraffic ? formatValue(latestTraffic.incoming) : '2.5M'}</span>
            <span className="text-green-400">{latestTraffic ? formatValue(latestTraffic.passed) : '2.5M'}</span>
            <span className="text-red-400">{latestTraffic ? formatValue(latestTraffic.dropped) : '13.6K'}</span>
          </div>
        </div>
      </div>

      {/* 攻击流量图 */}
      <div className="bg-slate-900/50 backdrop-blur-sm p-2 rounded border border-slate-700/50">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-[10px] font-medium text-slate-300 uppercase tracking-wide">攻击流量</h4>
          <div className="flex space-x-2 text-[9px] text-slate-500">
            <span>统计对象: 全局</span>
            <span>单位: bps</span>
          </div>
        </div>
        
        <svg ref={attackSvgRef} height="120" className="w-full bg-slate-950/30 rounded"></svg>
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center space-x-3 text-[9px]">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-pink-400 mr-1 rounded-sm"></div>
              <span className="text-slate-400">SYN Flood</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 mr-1 rounded-sm"></div>
              <span className="text-slate-400">TCP Misuse</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 mr-1 rounded-sm"></div>
              <span className="text-slate-400">Manual Strategy</span>
            </div>
          </div>
          <div className="flex space-x-2 text-[10px] font-mono">
            <span className="text-pink-400">{latestAttack ? formatValue(latestAttack.synFlood) : '8.8K'}</span>
            <span className="text-green-400">{latestAttack ? formatValue(latestAttack.tcpMisuse) : '0'}</span>
            <span className="text-blue-400">{latestAttack ? formatValue(latestAttack.manualStrategy) : '4.8K'}</span>
          </div>
        </div>
      </div>

      {/* 设备状态监测 - 独立卡片式 */}
      <div className="bg-slate-900/50 backdrop-blur-sm p-2 rounded border border-slate-700/50">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-[10px] font-medium text-slate-300 uppercase tracking-wide">设备状态</h4>
          <div className="text-[9px] text-slate-500">
            <span>实时监控</span>
          </div>
        </div>
        
        <div className="flex space-x-1">
          {deviceData.map((device, index) => {
            // 计算负载百分比 (基于连接数)
            const connectionCount = parseInt(device.connections.replace(/,/g, ''));
            const loadPercentage = Math.min((connectionCount / 8000) * 100, 100);
            
            return (
              <div key={device.name} className="flex-1 bg-slate-950/50 rounded-lg p-1.5 border border-slate-700/30">
                {/* 设备名称与负载条融合 */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-200 font-mono font-semibold text-center">{device.name}</div>
                    <div className="flex items-center justify-center mt-0.5">
                      <div className={`w-1 h-1 rounded-full mr-1 ${
                        device.status === 'online' 
                          ? 'bg-green-400 animate-pulse' 
                          : 'bg-red-400'
                      }`}></div>
                      <span className={`text-[6px] ${
                        device.status === 'online' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {device.status === 'online' ? '在线' : '离线'}
                      </span>
                    </div>
                  </div>
                  
                  {/* 小型负载条 */}
                  <div className="relative w-2 h-8 bg-slate-800/80 rounded-sm border border-slate-600/50 overflow-hidden ml-1">
                    <div 
                      className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${
                        device.status === 'offline' 
                          ? 'bg-red-500/50' 
                          : loadPercentage > 80 
                            ? 'bg-red-500' 
                            : loadPercentage > 60 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                      }`}
                      style={{ height: `${device.status === 'offline' ? 10 : loadPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* 负载百分比 */}
                <div className="text-center mb-1">
                  <span className="text-[8px] font-bold text-white">
                    {device.status === 'offline' ? 'OFF' : `${Math.round(loadPercentage)}%`}
                  </span>
                </div>
                
                {/* 数据列表 */}
                <div className="space-y-0.5 text-[6px]">
                  <div className="text-center">
                    <span className="text-blue-400 font-mono">{device.connections}</span>
                    <div className="text-slate-500">连接</div>
                  </div>
                  <div className="text-center">
                    <span className="text-cyan-400 font-mono">{device.sessions}</span>
                    <div className="text-slate-500">会话</div>
                  </div>
                  <div className="text-center">
                    <span className="text-green-400 font-mono">{device.bandwidth}</span>
                    <div className="text-slate-500">带宽</div>
                  </div>
                  <div className="text-center">
                    <span className="text-yellow-400 font-mono">{device.throughput}</span>
                    <div className="text-slate-500">吞吐</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 状态图例 */}
        <div className="flex justify-center items-center mt-3 space-x-4 text-[8px] border-t border-slate-700/30 pt-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-sm mr-1"></div>
            <span className="text-slate-400">正常 (&lt;60%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-sm mr-1"></div>
            <span className="text-slate-400">警告 (60-80%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-sm mr-1"></div>
            <span className="text-slate-400">危险 (&gt;80%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DDoSMonitoringCharts; 