import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  date: string;
  value: number;
}

interface AttackTrendChartProps {
  data1: DataPoint[]; // Data for the blue line
  data2: DataPoint[]; // Data for the yellow line
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

const AttackTrendChart: React.FC<AttackTrendChartProps> = ({ 
  data1,
  data2,
  style,
  width = 500, // Default width
  height = 300  // Default height
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Combine data for consistent x-axis and y-axis scaling
  const combinedData = useMemo(() => [...data1, ...data2], [data1, data2]);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;

    // 日志：打印收到的数据
    console.log('[AttackTrendChart] data1:', data1);
    console.log('[AttackTrendChart] data2:', data2);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous renders

    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Helper function to parse date strings, trying multiple formats
    const parseDateValue = (dateStr: string): Date | null => {
      if (!dateStr) return null;
      let parsed;

      // Try more specific formats first
      parsed = d3.timeParse('%Y-%m-%d')(dateStr); // YYYY-MM-DD
      if (parsed) return parsed;

      parsed = d3.timeParse('%Y/%m/%d')(dateStr); // YYYY/MM/DD
      if (parsed) return parsed;

      parsed = d3.timeParse('%m-%d')(dateStr);   // MM-DD
      if (parsed) return parsed;

      parsed = d3.timeParse('%m/%d')(dateStr);   // MM/DD
      if (parsed) return parsed;
      
      // If all parsing attempts fail
      console.warn(`[AttackTrendChart] Failed to parse date: "${dateStr}"`);
      return null;
    };
    
    const processedData1 = data1
      .map(d => ({ date: parseDateValue(d.date), value: d.value }))
      .filter(d => d.date !== null)
      .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime()) as { date: Date; value: number }[];
    const processedData2 = data2
      .map(d => ({ date: parseDateValue(d.date), value: d.value }))
      .filter(d => d.date !== null)
      .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime()) as { date: Date; value: number }[];

    // 日志：打印解析后的数据
    console.log('[AttackTrendChart] processedData1:', processedData1);
    console.log('[AttackTrendChart] processedData2:', processedData2);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (processedData1.length === 0 && processedData2.length === 0) {
      g.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Rajdhani, sans-serif')
        .style('font-size', '14px')
        .style('fill', '#a9c1df')
        .text('Insufficient data to display trend.');
      return; // Stop if no valid data for either line
    }
    
    const allDates = [...processedData1, ...processedData2].map(d => d.date);
    const allValues = [...processedData1, ...processedData2].map(d => d.value);

    const x = d3.scaleTime()
      .domain(d3.extent(allDates) as [Date, Date])
      .range([0, chartWidth]);

    const yMax = d3.max(allValues) as number;
    const y = d3.scaleLinear()
      .domain([0, yMax * 1.2 || 10]) // Add 20% padding or default to 10 if max is 0
      .range([chartHeight, 0])
      .nice();

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(Math.min(allDates.length, 5)).tickFormat(d3.timeFormat('%m-%d') as any))
      .selectAll('text')
        .style('font-family', 'Rajdhani, sans-serif')
        .style('font-size', '10px')
        .style('fill', '#a9c1df');
    g.selectAll('.domain, .tick line').style('stroke', 'rgba(30, 58, 95, 0.8)');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d3.format(",.0f")(d as number)))
      .selectAll('text')
        .style('font-family', 'Rajdhani, sans-serif')
        .style('font-size', '10px')
        .style('fill', '#a9c1df');
    g.selectAll('.domain').style('stroke', 'none');
    g.selectAll('.tick line')
        .style('stroke', 'rgba(30, 58, 95, 0.4)')
        .style('stroke-dasharray', '2,2');

    const lineGenerator = d3.line<{ date: Date; value: number }>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Blue Line Path
    g.append('path')
      .datum(processedData1)
      .attr('fill', 'none')
      .attr('stroke', 'url(#blueGradient)')
      .attr('stroke-width', 3)
      .attr('d', lineGenerator)
      .style('filter', 'drop-shadow(0px 2px 8px rgba(0, 217, 255, 0.3))');

    // Blue Area Path
    const areaGenerator1 = d3.area<{ date: Date; value: number }>()
      .x(d => x(d.date))
      .y0(chartHeight)
      .y1(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append('path')
      .datum(processedData1)
      .attr('fill', 'url(#blueAreaGradient)')
      .attr('d', areaGenerator1)
      .style('opacity', 0.8);
      
    // Yellow Line Path
    g.append('path')
      .datum(processedData2)
      .attr('fill', 'none')
      .attr('stroke', 'url(#yellowGradient)')
      .attr('stroke-width', 3)
      .attr('d', lineGenerator) // Reusing the same line generator structure
      .style('filter', 'drop-shadow(0px 2px 8px rgba(255, 223, 0, 0.3))');

    // Yellow Area Path
    const areaGenerator2 = d3.area<{ date: Date; value: number }>()
      .x(d => x(d.date))
      .y0(chartHeight)
      .y1(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append('path')
      .datum(processedData2)
      .attr('fill', 'url(#yellowAreaGradient)')
      .attr('d', areaGenerator2)
      .style('opacity', 0.7); // Slightly different opacity for visual distinction if needed

    // Gradients (defs should be appended directly to svg, not g)
    const defs = svg.append('defs');

    const blueGradient = defs.append('linearGradient')
      .attr('id', 'blueGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    blueGradient.append('stop').attr('offset', '0%').style('stop-color', '#00f7ff');
    blueGradient.append('stop').attr('offset', '100%').style('stop-color', '#0088ff');

    const blueAreaGradient = defs.append('linearGradient')
      .attr('id', 'blueAreaGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    blueAreaGradient.append('stop').attr('offset', '0%').style('stop-color', 'rgba(0, 217, 255, 0.35)');
    blueAreaGradient.append('stop').attr('offset', '50%').style('stop-color', 'rgba(0, 135, 255, 0.15)');
    blueAreaGradient.append('stop').attr('offset', '100%').style('stop-color', 'rgba(10, 25, 47, 0.05)');

    const yellowGradient = defs.append('linearGradient')
      .attr('id', 'yellowGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    yellowGradient.append('stop').attr('offset', '0%').style('stop-color', '#ffee00');
    yellowGradient.append('stop').attr('offset', '100%').style('stop-color', '#ffaa00');

    const yellowAreaGradient = defs.append('linearGradient')
      .attr('id', 'yellowAreaGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    yellowAreaGradient.append('stop').attr('offset', '0%').style('stop-color', 'rgba(255, 223, 0, 0.3)'); // Yellowish transparent
    yellowAreaGradient.append('stop').attr('offset', '50%').style('stop-color', 'rgba(255, 170, 0, 0.1)'); // Lighter yellowish transparent
    yellowAreaGradient.append('stop').attr('offset', '100%').style('stop-color', 'rgba(10, 25, 47, 0.05)'); // Fade to dark

    // Tooltip setup
    const tooltip = d3.select(tooltipRef.current)
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(10, 25, 47, 0.9)')
      .style('border', '1px solid rgba(0, 217, 255, 0.3)')
      .style('border-radius', '4px')
      .style('padding', '8px 12px')
      .style('color', '#e6f1ff')
      .style('font-family', 'Rajdhani, sans-serif')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('backdrop-filter', 'blur(4px)')
      .style('box-shadow', '0 0 8px rgba(0, 217, 255, 0.25)');

    const focus = g.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('line')
      .attr('class', 'focus-line')
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .style('stroke', 'rgba(0, 217, 255, 0.5)')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '3,3');

    focus.append('circle')
      .attr('class', 'focus-circle-1')
      .attr('r', 4)
      .style('fill', '#00d9ff')
      .style('stroke', '#fff')
      .style('stroke-width', 1.5);

    focus.append('circle')
      .attr('class', 'focus-circle-2')
      .attr('r', 4)
      .style('fill', '#ffee00')
      .style('stroke', '#fff')
      .style('stroke-width', 1.5);

    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => {
        focus.style('display', null);
        tooltip.style('visibility', 'visible');
      })
      .on('mouseout', () => {
        focus.style('display', 'none');
        tooltip.style('visibility', 'hidden');
      })
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event, g.node() as SVGGElement);
        const x0 = x.invert(mouseX);
        const bisectDate = d3.bisector((d: { date: Date; value: number }) => d.date).left;
        
        let pData1: { date: Date; value: number } | undefined;
        if (processedData1.length > 0) {
          const i1 = bisectDate(processedData1, x0, 1);
          const d0_1 = processedData1[i1 - 1];
          const d1_1 = processedData1[i1];
          if (d0_1 && d1_1) {
            pData1 = (x0.getTime() - d0_1.date.getTime() > d1_1.date.getTime() - x0.getTime()) ? d1_1 : d0_1;
          } else if (d0_1) {
            pData1 = d0_1;
          } else if (d1_1) {
            pData1 = d1_1;
          }
        }

        let pData2: { date: Date; value: number } | undefined;
        if (processedData2.length > 0) {
          const i2 = bisectDate(processedData2, x0, 1);
          const d0_2 = processedData2[i2 - 1];
          const d1_2 = processedData2[i2];
          if (d0_2 && d1_2) {
            pData2 = (x0.getTime() - d0_2.date.getTime() > d1_2.date.getTime() - x0.getTime()) ? d1_2 : d0_2;
          } else if (d0_2) {
            pData2 = d0_2;
          } else if (d1_2) {
            pData2 = d1_2;
          }
        }
        
        if (pData1 && pData2) {
          focus.select('.focus-line').attr('x1', x(pData1.date)).attr('x2', x(pData1.date));
          focus.select('.focus-circle-1').attr('transform', `translate(${x(pData1.date)},${y(pData1.value)})`);
          focus.select('.focus-circle-2').attr('transform', `translate(${x(pData2.date)},${y(pData2.value)})`);

          tooltip
            .html(`
              <div>Date: ${d3.timeFormat('%Y-%m-%d')(pData1.date)}</div>
              <div style="color: #00d9ff;">Blue Line: ${d3.format(",.0f")(pData1.value)}</div>
              <div style="color: #ffee00;">Yellow Line: ${d3.format(",.0f")(pData2.value)}</div>
            `)
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 28}px`);
        } else {
          // Optionally hide focus points if one of the data points is missing for the current mouse position
          // focus.style('display', 'none'); 
        }
      });

  }, [data1, data2, width, height, combinedData]); // combinedData is not strictly needed but good for clarity

  return (
    <div className="relative w-full h-full" style={style}>
      {/* Background glow effect */}
      <div 
        className="absolute inset-y-1/4 w-full h-1/2 bg-[#00a7e1] opacity-5 rounded-full blur-[40px] z-0"
        style={{ visibility: (data1 && data1.length > 0) ? 'visible' : 'hidden' }} // Hide glow if no data
      ></div>
      <svg ref={svgRef} width={width} height={height} className="relative z-10"></svg>
      <div ref={tooltipRef}></div>
    </div>
  );
};

export default AttackTrendChart;