import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ChartDataItem {
  name: string;
  value: number;
}

interface D3HorizontalLollipopChartProps {
  data: ChartDataItem[];
  width?: number;
  height?: number;
  topN?: number; // Number of top items to display
  baseColor?: string; // Color for the lollipops
  idSuffix?: string; // For unique IDs if multiple charts are on one page
}

const D3HorizontalLollipopChart: React.FC<D3HorizontalLollipopChartProps> = ({
  data,
  width: propWidth,
  height: propHeight,
  topN = 5,
  baseColor = '#00d9ff', // Default to a bright cyan, similar to your other chart
  idSuffix = 'lollipop-chart'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

    const containerWidth = propWidth || containerRef.current.offsetWidth;
    const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, topN);

    const itemHeight = 30; // Height allocated for each item (line + padding)
    const marginTop = 20;
    const marginBottom = 30; // Increased for X-axis labels
    const marginLeft = 100; // Ample space for Y-axis labels (category names)
    const marginRight = 50;  // Space for value labels next to lollipops

    const calculatedHeight =
      propHeight || sortedData.length * itemHeight + marginTop + marginBottom;

    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', calculatedHeight)
      .style('background-color', 'transparent');

    svg.selectAll('*').remove(); // Clear previous renders

    const chartGroup = svg.append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);

    const innerWidth = containerWidth - marginLeft - marginRight;
    const innerHeight = calculatedHeight - marginTop - marginBottom;

    // X Scale (for values)
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d.value) || 0])
      .range([0, innerWidth])
      .nice(); // Ensure the scale ends on a nice tick value

    // Y Scale (for names/categories)
    const yScale = d3.scaleBand()
      .domain(sortedData.map(d => d.name))
      .range([0, innerHeight])
      .padding(0.4); // Padding between lollipop groups

    // X-axis
    chartGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickSizeOuter(0))
      .selectAll('text')
      .style('fill', '#a0aec0') // Light gray text for axis
      .style('font-size', '10px');
    chartGroup.selectAll('.x-axis path, .x-axis line')
      .style('stroke', '#4A5568'); // Darker gray for axis lines

    // Y-axis
    chartGroup.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickSize(0).tickPadding(10))
      .selectAll('text')
      .style('fill', '#cbd5e0') // Slightly lighter gray for category names
      .style('font-size', '12px');
    chartGroup.selectAll('.y-axis path')
      .style('stroke', 'none'); // No Y-axis line
      
    // Grid lines (optional, for better readability)
    chartGroup.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => "")
      )
      .selectAll('line')
      .style('stroke', 'rgba(74, 85, 104, 0.3)') // Faint grid lines
      .style('stroke-dasharray', '2,2');
    chartGroup.selectAll('.grid path').remove(); // Remove domain path from grid lines

    // Lollipop lines
    chartGroup.selectAll(`.line-${idSuffix}`)
      .data(sortedData)
      .enter()
      .append('line')
      .attr('class', `line-${idSuffix}`)
      .attr('x1', xScale(0))
      .attr('y1', (d: ChartDataItem) => (yScale(d.name) ?? 0) + yScale.bandwidth() / 2)
      .attr('x2', (d: ChartDataItem) => xScale(d.value))
      .attr('y2', (d: ChartDataItem) => (yScale(d.name) ?? 0) + yScale.bandwidth() / 2)
      .attr('stroke', baseColor)
      .attr('stroke-width', 6);

    // Lollipop circles
    chartGroup.selectAll(`.circle-${idSuffix}`)
      .data(sortedData)
      .enter()
      .append('circle')
      .attr('class', `circle-${idSuffix}`)
      .attr('cx', (d: ChartDataItem) => xScale(d.value))
      .attr('cy', (d: ChartDataItem) => (yScale(d.name) ?? 0) + yScale.bandwidth() / 2)
      .attr('r', 15)
      .style('fill', baseColor)
      .attr('stroke', d3.color(baseColor)?.darker(0.5).toString() || '#000')
      .attr('stroke-width', 1.5);

    // Value labels
    chartGroup.selectAll(`.value-label-${idSuffix}`)
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', `value-label-${idSuffix}`)
      .attr('x', (d: ChartDataItem) => xScale(d.value) + 10) // Position to the right of the circle
      .attr('y', (d: ChartDataItem) => (yScale(d.name) ?? 0) + yScale.bandwidth() / 2 + 4) // Align with circle center
      .text((d: ChartDataItem) => d.value.toLocaleString())
      .style('fill', '#e2e8f0') // Light text color
      .style('font-size', '11px')
      .style('font-family', 'Arial, sans-serif');

  }, [data, propWidth, propHeight, topN, baseColor, idSuffix]); // Rerun effect if these change

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default D3HorizontalLollipopChart;
