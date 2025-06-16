import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ChartDataItem {
  name: string;
  value: number;
}

interface DotPlotChartProps {
  data: ChartDataItem[];
  width?: number;
  height?: number;
  baseColor?: string;
  topN?: number;
  idSuffix?: string;
}

const DotPlotChart: React.FC<DotPlotChartProps> = ({
  data,
  width: propWidth,
  height: propHeight,
  baseColor = '#00d9ff',
  topN = 5,
  idSuffix = 'dotplot',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

    const containerWidth = propWidth || containerRef.current.offsetWidth || 320;
    const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, topN);

    const dotRadius = 7;
    const dotGlow = 8;
    const marginTop = 18;
    const marginBottom = 18;
    const marginLeft = 100;
    const marginRight = 40;
    const rowHeight = 32;
    const calculatedHeight = propHeight || sortedData.length * rowHeight + marginTop + marginBottom;

    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', calculatedHeight)
      .style('background', 'transparent');
    svg.selectAll('*').remove();

    // Glow filter
    const defs = svg.append('defs');
    const glowFilter = defs.append('filter')
      .attr('id', `dot-glow-${idSuffix}`)
      .attr('x', '-40%')
      .attr('y', '-40%')
      .attr('width', '180%')
      .attr('height', '180%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', dotGlow)
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const innerWidth = containerWidth - marginLeft - marginRight;
    const yScale = d3.scaleBand()
      .domain(sortedData.map(d => d.name))
      .range([marginTop, calculatedHeight - marginBottom])
      .padding(0.4);
    const xMax = d3.max(sortedData, d => d.value) || 1;
    const xScale = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, innerWidth]);

    // Draw axis lines
    svg.append('line')
      .attr('x1', marginLeft)
      .attr('x2', marginLeft + innerWidth)
      .attr('y1', marginTop - 6)
      .attr('y2', marginTop - 6)
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.5);
    svg.append('line')
      .attr('x1', marginLeft)
      .attr('x2', marginLeft + innerWidth)
      .attr('y1', calculatedHeight - marginBottom + 6)
      .attr('y2', calculatedHeight - marginBottom + 6)
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.5);

    // Draw dots
    svg.selectAll('circle.dot')
      .data(sortedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => marginLeft + xScale(d.value))
      .attr('cy', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr('r', dotRadius)
      .attr('fill', baseColor)
      .attr('filter', `url(#dot-glow-${idSuffix})`)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.2);

    // Draw value labels
    svg.selectAll('text.dot-value')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'dot-value')
      .attr('x', d => marginLeft + xScale(d.value) + dotRadius + 7)
      .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('fill', '#e0f2fe')
      .attr('font-size', 13)
      .attr('font-family', 'inherit')
      .attr('text-anchor', 'start')
      .text(d => d.value.toLocaleString());

    // Draw category labels
    svg.selectAll('text.dot-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'dot-label')
      .attr('x', marginLeft - 8)
      .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('fill', '#bae6fd')
      .attr('font-size', 13)
      .attr('font-family', 'inherit')
      .attr('text-anchor', 'end')
      .text(d => d.name);
  }, [data, propWidth, propHeight, baseColor, topN, idSuffix]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: propHeight || topN * 32 + 36, minHeight: 140 }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
};

export default DotPlotChart;
