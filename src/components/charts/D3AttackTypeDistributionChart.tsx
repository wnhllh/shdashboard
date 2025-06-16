import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';

interface ChartDataItem {
  name: string;
  value: number;
}

interface D3PieChartProps {
  data: ChartDataItem[];
  width?: number;
  height?: number;
  idSuffix?: string;
  // Add other props like colorPalette if needed
}

const D3AttackTypeDistributionChart: React.FC<D3PieChartProps> = ({
  data,
  width = 400,
  height = 300,
  idSuffix = 'pie-chart'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const arcsRef = useRef<SVGGElement | null>(null); // Ref for the group containing arc paths
  const legendGroupRef = useRef<SVGGElement | null>(null);
  const centerTextNameRef = useRef<SVGTextElement | null>(null);
  const centerTextPercentageRef = useRef<SVGTextElement | null>(null);
  const currentIndexRef = useRef(0);
  const autoPlayTimerRef = useRef<number | null>(null);
  const isMouseOverRef = useRef(false);

  // Process data to ensure all items are included, defaulting invalid values to 0
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      name: item.name || 'Unknown',
      value: (item.value !== undefined && typeof item.value === 'number' && !isNaN(item.value)) ? item.value : 0
    })).filter(item => item.name !== 'Unknown'); // Filter out items that couldn't get a name
  }, [data]);

  const colorPalette = useMemo(() => [
    '#00f7ff', // 亮蓝色
    '#00b8ff',
    '#00d9ff', // 青蓝色
    '#0088ff', // 深蓝色
    '#41ffd2', // 青绿色
    '#33ccff', // 浅蓝色
    '#4dbeff', // 中蓝色
    '#4966f5'  // 绿蓝色
  ], []);

  const colorScale = useCallback((i: number) => colorPalette[i % colorPalette.length], [colorPalette]);

  useEffect(() => {
    if (!svgRef.current || processedData.length === 0) return;

    const W = width;
    const H = height;

    // Clear previous SVG content
    const svg = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H)
      .style('background-color', 'transparent');
    svg.selectAll("*").remove();

    const radius = Math.min(W, H) / 2.5;
    const innerRadius = radius * 0.7;

    const chartAreaWidth = W * 0.6; // Allocate space for legend
    const chartAreaHeight = H;
    const pieCenterX = chartAreaWidth / 2.2; // Adjust to center better
    const pieCenterY = chartAreaHeight / 2.1;

    const defs = svg.append('defs');
    // Glow filter
    const filter = defs.append('filter')
      .attr('id', `arc-glow-${idSuffix}`)
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    processedData.forEach((_item, i) => {
      const gradId = `pie-gradient-${idSuffix}-${i}`;
      const baseColor = d3.rgb(colorScale(i));
      const grad = defs.append('radialGradient')
        .attr('id', gradId)
        .attr('cx', '50%').attr('cy', '50%')
        .attr('r', '70%').attr('fx', '50%').attr('fy', '50%');
      
      // Adjusted gradient stops for a flatter, less 'jelly' appearance
      grad.append('stop').attr('offset', '0%').style('stop-color', baseColor.brighter(0.3).toString()).style('stop-opacity', 0.95);
      grad.append('stop').attr('offset', '50%').style('stop-color', baseColor.toString()).style('stop-opacity', 1);
      grad.append('stop').attr('offset', '100%').style('stop-color', baseColor.darker(0.5).toString()).style('stop-opacity', 1);
    });

    const pie = d3.pie<ChartDataItem>()
      .value(d => d.value)
      .sort(null);
    const pieData = pie(processedData);

    const arcGenerator = d3.arc<d3.PieArcDatum<ChartDataItem>>() 
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .padAngle(0.035) // Further increased padding between slices
      .cornerRadius(3);

    const highlightArcGenerator = d3.arc<d3.PieArcDatum<ChartDataItem>>()
      .innerRadius(innerRadius * 0.97)
      .outerRadius(radius * 1.05)
      .padAngle(0.035) // Further increased padding for highlighted slice as well
      .cornerRadius(3);

    const chartGroup = svg.append('g')
      .attr('transform', `translate(${pieCenterX}, ${pieCenterY})`)
      .style('filter', `url(#arc-glow-${idSuffix})`);

    // Assign to ref for later use by highlight function
    arcsRef.current = chartGroup.append('g').attr('class', 'arcs-group').node();
    
    const path = d3.select(arcsRef.current)
      .selectAll<SVGPathElement, d3.PieArcDatum<ChartDataItem>>('path')
      .data(pieData)
      .join('path')
      .attr('d', arcGenerator)
      .attr('fill', (_d, i) => `url(#pie-gradient-${idSuffix}-${i})`)
      .style('stroke', (_d, i) => colorScale(i))
      .style('stroke-width', 2)
      .style('opacity', 0.5)
      .style('transition', 'opacity 0.3s ease, transform 0.3s ease, stroke-width 0.3s ease');

    path.transition()
      .duration(800)
      .attrTween('d', function(d_tween: d3.PieArcDatum<ChartDataItem>) {
        const i = d3.interpolate({ startAngle: d_tween.startAngle, endAngle: d_tween.startAngle }, d_tween);
        return function(t: number) { 
          const interpolated = i(t);
          return arcGenerator(interpolated as d3.PieArcDatum<ChartDataItem>) || ''; 
        };
      });

    centerTextNameRef.current = chartGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .style('font-size', '13px')
      .style('fill', '#e6f1ff')
      .style('font-weight', '600')
      .style('opacity', 0).node();
    centerTextPercentageRef.current = chartGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.9em')
      .style('font-size', '11px')
      .style('fill', '#cce0ff')
      .style('opacity', 0).node();

    path.on('mouseover', function(_event: MouseEvent, d_event: d3.PieArcDatum<ChartDataItem>) {
      isMouseOverRef.current = true;
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }

      d3.select(this)
        .transition().duration(150)
        .attr('d', highlightArcGenerator(d_event) || '')
        .style('opacity', 0.85)
        .style('stroke-width', 3);
        
      d3.select(centerTextNameRef.current).text(d_event.data.name)
        .transition().duration(150)
        .style('opacity', 1)
        .style('filter', 'drop-shadow(0 0 3px rgba(0, 217, 255, 0.7))');
        
      const total = d3.sum(processedData, item => item.value);
      const percentage = total > 0 ? ((d_event.data.value / total) * 100).toFixed(0) + '%' : 'N/A';
      d3.select(centerTextPercentageRef.current).text(percentage)
        .transition().duration(150)
        .style('opacity', 1)
        .style('filter', 'drop-shadow(0 0 5px rgba(0, 217, 255, 0.8))');
      
      if (legendGroupRef.current) {
        d3.select(legendGroupRef.current).selectAll<SVGGElement, d3.PieArcDatum<ChartDataItem>>('.legend-item')
          .transition().duration(150)
          .style('opacity', (_d_legend, i_legend) => i_legend === pieData.indexOf(d_event) ? 1 : 0.5);
      }
    })
    .on('mouseout', function(_event: MouseEvent, d_event: d3.PieArcDatum<ChartDataItem>) {
      isMouseOverRef.current = false;
      d3.select(this)
        .transition().duration(250)
        .attr('d', arcGenerator(d_event) || '')
        .style('opacity', 0.5)
        .style('stroke-width', 2);
        
      d3.select(centerTextNameRef.current).transition().duration(150).style('opacity', 0);
      d3.select(centerTextPercentageRef.current).transition().duration(150).style('opacity', 0);
      
      if (legendGroupRef.current) {
        d3.select(legendGroupRef.current).selectAll('.legend-item')
          .transition().duration(150)
          .style('opacity', 1);
      }
      // Restart autoplay if it was paused
      if (!autoPlayTimerRef.current) {
        autoPlayTimerRef.current = window.setInterval(highlightPieSlice, 2000);
      }
    });
    
    // Legend
    legendGroupRef.current = svg.append('g')
      .attr('transform', `translate(${W * 0.62}, ${pieCenterY - radius * 0.9})`).node(); // Adjusted legend position: closer and higher

    if (legendGroupRef.current) {
      const legendItems = d3.select(legendGroupRef.current)
        .selectAll<SVGGElement, d3.PieArcDatum<ChartDataItem>>('.legend-item')
        .data(pieData)
        .join('g')
        .attr('class', 'legend-item')
        .attr('transform', (_d, i) => `translate(0, ${i * 25})`)
        .style('cursor', 'default')
        .style('transition', 'opacity 0.3s ease');

      legendItems.on('mouseover', function(_event_legend: MouseEvent, d_legend: d3.PieArcDatum<ChartDataItem>) {
        isMouseOverRef.current = true;
        if (autoPlayTimerRef.current) {
            clearInterval(autoPlayTimerRef.current);
            autoPlayTimerRef.current = null;
        }
        // Highlight corresponding arc
        if (arcsRef.current) {
            d3.select(arcsRef.current).selectAll<SVGPathElement, d3.PieArcDatum<ChartDataItem>>('path')
                .filter((_d_path, i_path) => i_path === pieData.indexOf(d_legend))
                .transition().duration(150)
                .attr('d', highlightArcGenerator(d_legend) || '')
                .style('opacity', 0.85)
                .style('stroke-width', 3);
        }
        d3.select(centerTextNameRef.current).text(d_legend.data.name)
            .transition().duration(150).style('opacity', 1)
            .style('filter', 'drop-shadow(0 0 3px rgba(0, 217, 255, 0.7))');
        const total = d3.sum(processedData, item => item.value);
        const percentage = total > 0 ? ((d_legend.data.value / total) * 100).toFixed(0) + '%' : 'N/A';
        d3.select(centerTextPercentageRef.current).text(percentage)
            .transition().duration(150).style('opacity', 1)
            .style('filter', 'drop-shadow(0 0 5px rgba(0, 217, 255, 0.8))');
      })
      .on('mouseout', function(_event_legend: MouseEvent, d_legend: d3.PieArcDatum<ChartDataItem>) {
          isMouseOverRef.current = false;
          if (arcsRef.current) {
            d3.select(arcsRef.current).selectAll<SVGPathElement, d3.PieArcDatum<ChartDataItem>>('path')
                .filter((_d_path, i_path) => i_path === pieData.indexOf(d_legend))
                .transition().duration(250)
                .attr('d', arcGenerator(d_legend) || '')
                .style('opacity', 0.5)
                .style('stroke-width', 2);
          }
          d3.select(centerTextNameRef.current).transition().duration(150).style('opacity', 0);
          d3.select(centerTextPercentageRef.current).transition().duration(150).style('opacity', 0);
          if (!autoPlayTimerRef.current) {
            autoPlayTimerRef.current = window.setInterval(highlightPieSlice, 2000);
          }
      });

      legendItems.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('fill', (_d, i) => colorScale(i));

      legendItems.append('text')
        .attr('x', 20)
        .attr('y', 7.5) 
        .attr('dy', '0.35em')
        .style('fill', '#e6f1ff')
        .style('font-size', '11px')
        .style('font-weight', '500')
        .text(d_legend_text => d_legend_text.data.name);

      legendItems.append('text')
        .attr('x', W * 0.23) // Position percentage to the right
        .attr('y', 7.5)
        .attr('dy', '0.35em')
        .style('fill', '#a0cfff')
        .style('font-size', '10px')
        .attr('text-anchor', 'end') // Align text to the end (right)
        .text(d_legend_perc => {
          const total = d3.sum(processedData, item => item.value);
          return total > 0 ? `${Math.round(d_legend_perc.data.value / total * 100)}%` : '0%';
        });
    }
    
    const highlightPieSlice = () => {
      if (isMouseOverRef.current || !arcsRef.current || !legendGroupRef.current || !centerTextNameRef.current || !centerTextPercentageRef.current) return;

      const currentIdx = currentIndexRef.current;
      if (pieData.length === 0) {
        console.warn("[highlightPieSlice] Pie data is empty, cannot highlight slice.");
        return;
      }
      // Ensure index is within bounds before accessing pieData[currentIdx]
      if (currentIdx >= pieData.length) {
        console.warn(`[highlightPieSlice] Index ${currentIdx} out of bounds for pieData length ${pieData.length}. Resetting to 0.`);
        currentIndexRef.current = 0; // Reset index if out of bounds
        // It might be better to skip this cycle or log an error, but resetting helps avoid crashes.
        // Depending on desired behavior, could also return here.
        return; // Skip this highlighting cycle to prevent error with invalid index
      }
      
      const d_highlight = pieData[currentIdx];

      if (!d_highlight || !d_highlight.data) {
        console.error(`[highlightPieSlice] No data for slice at index ${currentIdx}. PieData length: ${pieData.length}. Slice:`, d_highlight);
        currentIndexRef.current = (currentIdx + 1) % pieData.length; // Attempt to advance
        return;
      }

      console.log(`[highlightPieSlice] Highlighting: Index=${currentIdx}, Name=${d_highlight.data.name}, Value=${d_highlight.data.value}, pieData.length=${pieData.length}`);

      // Reset previous highlights
      d3.select(arcsRef.current).selectAll<SVGPathElement, d3.PieArcDatum<ChartDataItem>>('path')
        .transition().duration(150)
        .attr('d', arcGenerator) 
        .style('opacity', 0.5)
        .style('stroke-width', 2);
      
      d3.select(legendGroupRef.current).selectAll<SVGGElement, d3.PieArcDatum<ChartDataItem>>('.legend-item')
        .transition().duration(150)
        .style('opacity', 0.5);

      // Highlight current slice
      d3.select(arcsRef.current).selectAll<SVGPathElement, d3.PieArcDatum<ChartDataItem>>('path')
        .filter((_d_path, i_path) => i_path === currentIdx)
        .transition().duration(300)
        .attr('d', highlightArcGenerator(d_highlight) || '') 
        .style('opacity', 0.85)
        .style('stroke-width', 3);
      
      d3.select(centerTextNameRef.current).text(d_highlight.data.name)
        .transition().duration(300)
        .style('opacity', 1)
        .style('filter', 'drop-shadow(0 0 3px rgba(0, 217, 255, 0.7))');
      
      const total = d3.sum(processedData, item => item.value);
      const percentage = total > 0 ? ((d_highlight.data.value / total) * 100).toFixed(0) + '%' : 'N/A';
      d3.select(centerTextPercentageRef.current).text(percentage)
        .transition().duration(300)
        .style('opacity', 1)
        .style('filter', 'drop-shadow(0 0 5px rgba(0, 217, 255, 0.8))');
      
      d3.select(legendGroupRef.current).selectAll<SVGGElement, d3.PieArcDatum<ChartDataItem>>('.legend-item')
        .filter((_d_legend, i_legend) => i_legend === currentIdx)
        .transition().duration(300)
        .style('opacity', 1);
      
      currentIndexRef.current = (currentIdx + 1) % pieData.length;
      console.log(`[highlightPieSlice] Next index will be: ${currentIndexRef.current}`);
    };
    
    // Initial setup for autoplay
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current); // Clear any existing timer before setting a new one
      autoPlayTimerRef.current = null;
    }

    setTimeout(() => {
      if (pieData.length > 0 && !isMouseOverRef.current) { // Check isMouseOverRef here too
        console.log("[useEffect setTimeout] Initial highlight and starting autoplay timer.");
        highlightPieSlice(); 
        if (!autoPlayTimerRef.current) { // Ensure timer is not already set by another effect or mouse out
          autoPlayTimerRef.current = window.setInterval(highlightPieSlice, 2000);
        }
      } else if (pieData.length === 0) {
        console.warn("[useEffect setTimeout] Auto-play not started: pieData is empty.");
      } else if (isMouseOverRef.current) {
        console.log("[useEffect setTimeout] Auto-play not started: mouse is currently over the chart.");
      }
    }, 1000); // Delay ensures DOM is ready

    const handleMouseEnterSVG = () => {
      console.log("[handleMouseEnterSVG] Mouse enter, pausing autoplay.");
      isMouseOverRef.current = true;
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };

    const handleMouseOutSVG = () => {
      isMouseOverRef.current = false;
      console.log("[handleMouseOutSVG] Mouse out, resuming autoplay.");
      if (!autoPlayTimerRef.current && pieData.length > 0) { 
        highlightPieSlice(); 
        autoPlayTimerRef.current = window.setInterval(highlightPieSlice, 2000);
      }
    };

    const currentSvg = svgRef.current;
    currentSvg?.addEventListener('mouseenter', handleMouseEnterSVG);
    currentSvg?.addEventListener('mouseout', handleMouseOutSVG);
    
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
      currentSvg?.removeEventListener('mouseenter', handleMouseEnterSVG);
      currentSvg?.removeEventListener('mouseout', handleMouseOutSVG);
    };
  }, [processedData, width, height, colorScale, idSuffix]); 

  return (
    <svg ref={svgRef} width={width} height={height}></svg>
  );
};

export default D3AttackTypeDistributionChart;