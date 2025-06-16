import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ChartDataItem {
  name: string;
  value: number;
}

interface D3HorizontalBarChartProps {
  data: ChartDataItem[];
  width?: number; 
  height?: number; 
  baseColor?: string; // Changed from barColor to baseColor for clarity
  idSuffix?: string; 
}

const D3HorizontalBarChart: React.FC<D3HorizontalBarChartProps> = ({ 
  data,
  width: propWidth,
  height: propHeight,
  baseColor = '#00d9ff', // Default to a bright cyan
  idSuffix = 'chart'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

    const containerWidth = propWidth || containerRef.current.offsetWidth;
    const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 5);

    // 让条形更细且有间隙
    const barPadding = 0.45; // 直接用 scaleBand 的 paddingInner 参数
    let barHeight = 14; // 初始化，后面用 yScale.bandwidth() 重新赋值
    const marginTop = 8; 
    const marginBottom = 8;
    const marginLeft = 65; 
    const marginRight = 35; 

    const calculatedHeight = propHeight || (sortedData.length * (barHeight + barPadding)) + marginTop + marginBottom;
    
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', calculatedHeight)
      .style('background-color', 'transparent');

    svg.selectAll('*').remove();

    const defs = svg.append('defs');
    // 更强的发光效果
    const glowFilter = defs.append('filter')
      .attr('id', `glow-${idSuffix}`)
      .attr('x', '-40%')
      .attr('y', '-40%')
      .attr('width', '180%')
      .attr('height', '180%');
      
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4') // 更强的发光
      .attr('result', 'coloredBlur');
      
    // 增加颜色饱和度和对比度
    glowFilter.append('feColorMatrix')
      .attr('in', 'coloredBlur')
      .attr('type', 'matrix')
      .attr('values', '0 0 0 0 0 0 1.5 0 0 0 0 0 1.5 0 0 0 0 0 1 0') // 增强蓝色通道
      .attr('result', 'enhancedGlow');
      
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'enhancedGlow');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    
    // 添加酷炫的扭曲发光
    const neonFilter = defs.append('filter')
      .attr('id', `neon-${idSuffix}`)
      .attr('filterUnits', 'userSpaceOnUse')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
      
    // 增加扭曲和位移
    const neonTurbulence = neonFilter.append('feTurbulence')
      .attr('type', 'fractalNoise')
      .attr('baseFrequency', '1')
      .attr('numOctaves', '1')
      .attr('result', 'noise');
      
    neonFilter.append('feDisplacementMap')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'noise')
      .attr('scale', '3')
      .attr('result', 'displacedNeon');
      
    neonFilter.append('feGaussianBlur')
      .attr('in', 'displacedNeon')
      .attr('stdDeviation', '1')
      .attr('result', 'blurredNeon');
      
    neonFilter.append('feBlend')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blurredNeon')
      .attr('mode', 'lighten');  

    // 建立多重渐变以增强科技感
    const barGradient = defs.append('linearGradient')
      .attr('id', `barGradient-${idSuffix}`)
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    
    const gradientStartColor = d3.color(baseColor)?.brighter(0.7).toString() || '#00f7ff';
    const gradientMidColor = baseColor || '#00d9ff';
    
    // Ensure gradientEndColor is a darker shade of baseColor for better harmony
    const gradientEndColor = d3.color(baseColor)?.darker(0.8).toString() || '#005c99'; // Default to a darker blue if baseColor is invalid
    
    // 增加多个颜色停止点以让渐变更加精细
    barGradient.append('stop').attr('offset', '0%').style('stop-color', gradientStartColor);
    barGradient.append('stop').attr('offset', '30%').style('stop-color', gradientMidColor);
    barGradient.append('stop').attr('offset', '100%').style('stop-color', gradientEndColor);
    
    // 添加顶部高光效果的渐变
    const barTopHighlight = defs.append('linearGradient')
      .attr('id', `barTopHighlight-${idSuffix}`)
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
      
    barTopHighlight.append('stop').attr('offset', '0%').style('stop-color', 'rgba(255,255,255,0.5)');
    barTopHighlight.append('stop').attr('offset', '15%').style('stop-color', 'rgba(255,255,255,0.1)');
    barTopHighlight.append('stop').attr('offset', '100%').style('stop-color', 'rgba(255,255,255,0)');
    
    // 添加光斑纹理效果
    const barPattern = defs.append('pattern')
      .attr('id', `techPattern-${idSuffix}`)
      .attr('width', 10)
      .attr('height', 10)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternTransform', 'rotate(45)');
      
    barPattern.append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', `url(#barGradient-${idSuffix})`);
      
    barPattern.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 10)
      .attr('stroke', 'rgba(255,255,255,0.08)')
      .attr('stroke-width', 0.5);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d.value) || 0])
      .range([marginLeft, containerWidth - marginRight]);

    const yScale = d3.scaleBand()
      .domain(sortedData.map(d => d.name))
      .range([marginTop, calculatedHeight - marginBottom])
      .paddingInner(barPadding);
    barHeight = yScale.bandwidth(); // 让 barHeight 与 band 匹配
    // 添加背景网格线
    svg.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(d3.range(marginLeft, containerWidth - marginRight, 20))
      .enter()
      .append('line')
      .attr('x1', d => d)
      .attr('y1', marginTop - 5)
      .attr('x2', d => d)
      .attr('y2', calculatedHeight - marginBottom + 5)
      .attr('stroke', 'rgba(30, 58, 95, 0.3)')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '1 4');
      
    // 添加背景参考线
    svg.append('line')
      .attr('x1', marginLeft)
      .attr('y1', calculatedHeight - marginBottom + 2)
      .attr('x2', containerWidth - marginRight)
      .attr('y2', calculatedHeight - marginBottom + 2)
      .attr('stroke', 'rgba(0, 217, 255, 0.15)')
      .attr('stroke-width', 1);
    
    // 染色条形图本身
    const bars = svg.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('g')
      .attr('class', 'bar-group');
      
    // 为每个条型添加一个背景出来引起注意力
    bars.append('rect')
      .attr('class', 'bar-bg')
      .attr('x', marginLeft - 1)
      .attr('y', (d: ChartDataItem) => (yScale(d.name) || 0) - 1)
      .attr('width', 0) // Ensure bar-bg also starts at width 0 for consistent animation
      .attr('height', barHeight + 2)
      .attr('rx', 3)
      .attr('ry', 3)
      .style('fill', 'rgba(0, 217, 255, 0.05)')
      .style('stroke', 'rgba(0, 217, 255, 0.1)')
      .style('stroke-width', 0.5);
      
    // 添加实际数据条
    bars.append('rect')
      .attr('class', 'bar-fill')
      .attr('x', marginLeft)
      .attr('y', (d: ChartDataItem) => yScale(d.name) || 0)
      .attr('width', 0) 
      .attr('height', barHeight)
      .style('fill', `url(#barGradient-${idSuffix})`)
      .attr('rx', 2)
      .attr('ry', 2)
      .style('stroke-width', 0.5)
      .style('stroke', 'rgba(0, 217, 255, 0.3)');
      
    // 添加带有高光的上部边缘效果
    bars.append('rect')
      .attr('class', 'bar-highlight')
      .attr('x', marginLeft)
      .attr('y', (d: ChartDataItem) => yScale(d.name) || 0)
      .attr('width', 0)
      .attr('height', barHeight / 3)
      .style('fill', `url(#barTopHighlight-${idSuffix})`)
      .attr('rx', 2)
      .attr('ry', 2)
      .style('opacity', 0.7);

    svg.selectAll<SVGTextElement, ChartDataItem>('.value-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d: ChartDataItem) => xScale(d.value) + 4) 
      .attr('y', (d: ChartDataItem) => (yScale(d.name) || 0) + barHeight / 2)
      .attr('dy', '0.32em')
      .style('fill', '#e6f1ff') 
      .style('font-size', '11px') 
      .style('font-family', 'Rajdhani, sans-serif') 
      .style('opacity', 0)
      .style('filter', 'drop-shadow(0 0 1px rgba(0, 217, 255, 0.5))') 
      .text((d: ChartDataItem) => d.value.toLocaleString())
      .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .delay((_d: ChartDataItem, i: number) => i * 100 + 350)
        .style('opacity', 1);

    svg.selectAll<SVGTextElement, ChartDataItem>('.y-axis-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('x', marginLeft - 4)
      .attr('y', (d: ChartDataItem) => (yScale(d.name) || 0) + barHeight / 2)
      .attr('dy', '0.32em')
      .style('text-anchor', 'end')
      .style('fill', '#c0d8f0') 
      .style('font-size', '11px') 
      .style('font-family', 'Rajdhani, sans-serif') 
      .style('letter-spacing', '0.5px') 
      .style('opacity', 0)
      .text((d: ChartDataItem) => {
        const name = d.name;
        if (name.length > 15 && name.includes('.')) { 
            return name.substring(0, 13) + '...';
        }
        if (name.length > 12) { 
            return name.substring(0, 10) + '...';
        }
        return name;
      })
      .each(function(d: ChartDataItem) { 
        d3.select(this).append('title').text(d.name);
      })
      .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .delay((_d: ChartDataItem, i: number) => i * 100 + 150)
        .style('opacity', 0.95);

    bars.on('mouseover', function(this: SVGGElement, _event: MouseEvent, d: ChartDataItem) { 
        const bar = d3.select(this);
        bar.selectAll<SVGRectElement, ChartDataItem>('.bar-fill')
          .style('filter', `url(#glow-${idSuffix})`)
          .style('opacity', 1);
          
        bar.selectAll('.bar-highlight')
          .style('opacity', 0.9);
          
        // 缓慢应用的扭曲效果以增强交互性
        bar.selectAll<SVGRectElement, ChartDataItem>('.bar-fill')
          .transition()
          .duration(300)
          .style('filter', `url(#neon-${idSuffix})`);
          
        // 使相应的文本标签亦变亮
        const index = sortedData.findIndex(item => item.name === d.name);
        svg.selectAll<SVGTextElement, ChartDataItem>('.value-label')
          .filter((dataItem: ChartDataItem, i: number) => i === index && dataItem.name === d.name)
          .style('fill', '#ffffff')
          .style('font-weight', 'bold')
          .style('filter', 'drop-shadow(0 0 3px rgba(0, 217, 255, 0.8))');
          
        svg.selectAll<SVGTextElement, ChartDataItem>('.y-axis-label')
          .filter((dataItem: ChartDataItem, i: number) => i === index && dataItem.name === d.name)
          .style('fill', '#ffffff')
          .style('font-weight', 'bold')
          .style('filter', 'drop-shadow(0 0 3px rgba(0, 217, 255, 0.6))');
      })
      .on('mouseout', function(this: SVGGElement, _event: MouseEvent, d: ChartDataItem) { 
        const bar = d3.select(this);
        bar.selectAll<SVGRectElement, ChartDataItem>('.bar-fill')
          .style('filter', null)
          .style('opacity', 0.85);
          
        bar.selectAll('.bar-highlight')
          .style('opacity', 0.7);
          
        // 还原文本样式
        const index = sortedData.findIndex(item => item.name === d.name);
        svg.selectAll<SVGTextElement, ChartDataItem>('.value-label')
          .filter((dataItem: ChartDataItem, i: number) => i === index && dataItem.name === d.name)
          .style('fill', '#e6f1ff')
          .style('font-weight', 'normal')
          .style('filter', 'drop-shadow(0 0 1px rgba(0, 217, 255, 0.5))');
          
        svg.selectAll<SVGTextElement, ChartDataItem>('.y-axis-label')
          .filter((dataItem: ChartDataItem, i: number) => i === index && dataItem.name === d.name)
          .style('fill', '#c0d8f0')
          .style('font-weight', 'normal')
          .style('filter', 'none');
      });

    bars.selectAll<SVGRectElement, ChartDataItem>('.bar-bg')
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .attr('width', (d: ChartDataItem) => Math.max(0, xScale(d.value) - marginLeft + 4))
      .delay((_d: ChartDataItem, i: number) => i * 100);
      
    bars.selectAll<SVGRectElement, ChartDataItem>('.bar-fill')
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('width', (d: ChartDataItem) => Math.max(0, xScale(d.value) - marginLeft))
      .delay((_d: ChartDataItem, i: number) => i * 100 + 100);
      
    bars.selectAll<SVGRectElement, ChartDataItem>('.bar-highlight')
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('width', (d: ChartDataItem) => Math.max(0, xScale(d.value) - marginLeft))
      .delay((_d: ChartDataItem, i: number) => i * 100 + 100);

  }, [data, propWidth, propHeight, baseColor, idSuffix]);

  // Adjust container height based on actual items (max 5) and new bar/padding values
  const numItems = Math.min(data.length, 5);
  const dynamicHeight = numItems > 0 ? (numItems * (14 + 6)) + 8 + 8 : 30; // 14 bar, 6 padding, 8+8 margins, or 30 if empty
  const finalHeight = propHeight || dynamicHeight;

  return (
    <div ref={containerRef} style={{ width: '100%', height: `${finalHeight}px`}}>
        <svg ref={svgRef}></svg>
    </div>
  );
};

export default D3HorizontalBarChart; 