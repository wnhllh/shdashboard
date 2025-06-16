import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3'; // Main D3 library for selections, scales, etc.
import {
  sankey as d3Sankey,
  sankeyLinkHorizontal as d3SankeyLinkHorizontal,
  sankeyJustify as d3SankeyJustify, // Or other alignment
  SankeyNode as D3SankeyNodeImportType, // Base type for nodes from d3-sankey
  SankeyLink as D3SankeyLinkImportType, // Base type for links from d3-sankey
} from 'd3-sankey';
import { SankeyData, SankeyNode as AppSankeyNode, SankeyLink as AppSankeyLink } from '@/types/data';

interface D3SankeyChartProps {
  data: SankeyData;
  width?: number;
  height?: number;
  idSuffix?: string;
}

// Type for NODES after layout. It combines d3-sankey's layout properties (x0, y0, etc.)
// with our application-specific node data (AppSankeyNode).
type ProcessedNode = D3SankeyNodeImportType<AppSankeyNode, AppSankeyLink>;

// Type for LINKS after layout. It combines d3-sankey's layout properties (width, y0, etc.)
// with our application-specific link data (AppSankeyLink).
// D3SankeyLinkImportType types source/target as (string | number | ProcessedNode).
// We use `(link.source as ProcessedNode)` for specific property access.
type ProcessedLink = D3SankeyLinkImportType<AppSankeyNode, AppSankeyLink>;


const D3SankeyAttackedSystemsChart: React.FC<D3SankeyChartProps> = ({
  data,
  width = 550, // Reduced width for sidebar fit
  height = 270, // Reduced height for sidebar fit
  idSuffix = 'sankey-chart'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const colorPalette = useMemo(() => [
    '#00f7ff', '#00b8ff', '#00d9ff', '#0088ff',
    '#41ffd2', '#33ccff', '#4dbeff', '#4966f5'
  ], []);

  const colorScale = useMemo(() => d3.scaleOrdinal(colorPalette), [colorPalette]);

  useEffect(() => {
    if (!svgRef.current || !data || !data.nodes || !data.links || data.nodes.length === 0) return;

    const W = width;
    const H = height;
    const margin = { top: 16, right: 30, bottom: 16, left: 30 }; // Balanced margins for small width
    const graphWidth = W - margin.left - margin.right;
    const graphHeight = H - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H)
      .style('background-color', 'transparent');
    svg.selectAll("*").remove(); // Clear previous content

    const chartGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Glow filter (similar to D3AttackTypeDistributionChart)
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', `sankey-glow-${idSuffix}`)
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create Sankey layout generator
    const sankeyGenerator = d3Sankey<AppSankeyNode, AppSankeyLink>()
      .nodeId(d => d.nodeId)
      .nodeWidth(20) // Width of the nodes
      .nodePadding(15) // Vertical padding between nodes in the same column
      .nodeAlign(d3SankeyJustify) // Use the imported alignment function
      .extent([[0, 0], [graphWidth, graphHeight]]);

    // sankeyGenerator is typed with <AppSankeyNode, AppSankeyLink>
    // so, .nodes are ProcessedNode[] and .links are ProcessedLink[] by inference.
    const { nodes, links } = sankeyGenerator(data);

    // Create link gradients
    links.forEach((link: ProcessedLink, i: number) => {
      const gradId = `link-gradient-${idSuffix}-${i}`;
      const sourceColor = d3.rgb(colorScale((link.source as ProcessedNode).nodeId));
      const targetColor = d3.rgb(colorScale((link.target as ProcessedNode).nodeId));

      const gradient = defs.append('linearGradient')
        .attr('id', gradId)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', (link.source as any).x1)
        .attr('x2', (link.target as any).x0);

      gradient.append('stop').attr('offset', '0%').attr('stop-color', sourceColor.toString()).attr('stop-opacity', 0.7);
      gradient.append('stop').attr('offset', '100%').attr('stop-color', targetColor.toString()).attr('stop-opacity', 0.7);
    });

    // Draw links
    chartGroup.append('g')
      .attr('class', 'links')
      .selectAll<SVGPathElement, ProcessedLink>('path') // Use ProcessedLink
      .data(links)
      .join('path')
        .attr('d', d3SankeyLinkHorizontal<AppSankeyNode, AppSankeyLink>())
        .attr('stroke', (_d: ProcessedLink, i: number) => `url(#link-gradient-${idSuffix}-${i})`) // _d as it's not used directly here
        .attr('stroke-width', (d: ProcessedLink) => Math.max(1, d.width || 0))
        .style('fill', 'none')
        .style('opacity', 0.6)
        .style('transition', 'opacity 0.3s ease')
      .on('mouseover', function (this: SVGPathElement, _event: MouseEvent, d_event: ProcessedLink) {
        d3.select(this).style('opacity', 0.9);
        // Highlight connected nodes and the link itself
        d3.selectAll<SVGRectElement, ProcessedNode>('.nodes rect')
          .filter((n: ProcessedNode) => n === (d_event.source as ProcessedNode) || n === (d_event.target as ProcessedNode))
          .transition().duration(150)
          .style('opacity', 1)
          .attr('fill', (n: ProcessedNode) => d3.rgb(colorScale(n.nodeId)).brighter(0.7).toString());
      })
      .on('mouseout', function (this: SVGPathElement, _event: MouseEvent, d_event: ProcessedLink) {
        d3.select(this).style('opacity', 0.6);
        d3.selectAll<SVGRectElement, ProcessedNode>('.nodes rect')
          .filter((n: ProcessedNode) => n === (d_event.source as ProcessedNode) || n === (d_event.target as ProcessedNode))
          .transition().duration(150)
          .style('opacity', 0.9)
          .attr('fill', (n: ProcessedNode) => colorScale(n.nodeId));
      })
      .append('title') // Basic tooltip
        .text((d: ProcessedLink) => `${(d.source as ProcessedNode).name} → ${(d.target as ProcessedNode).name}\nValue: ${d.value}`);

    // Draw nodes
    const nodeGroup = chartGroup.append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, ProcessedNode>('g') // Use ProcessedNode
      .data(nodes)
      .join('g')
        .attr('transform', (d: ProcessedNode) => `translate(${d.x0 || 0},${d.y0 || 0})`)
        .style('filter', `url(#sankey-glow-${idSuffix})`);

    nodeGroup.append('rect')
      .attr('height', (d: ProcessedNode) => Math.max(1, (d.y1 || 0) - (d.y0 || 0)))
      .attr('width', (d: ProcessedNode) => (d.x1 || 0) - (d.x0 || 0)) // Use d.x1 and d.x0 for width
      .attr('fill', (d: ProcessedNode) => colorScale(d.nodeId))
      .attr('stroke', (d: ProcessedNode) => d3.rgb(colorScale(d.nodeId)).darker(0.5).toString())
      .style('opacity', 0.9)
      .style('stroke-width', 1.5)
      .style('transition', 'opacity 0.3s ease, fill 0.3s ease')
    .on('mouseover', function (this: SVGRectElement, _event: MouseEvent, d_event: ProcessedNode) {
        d3.select(this).style('opacity', 1).attr('fill', d3.rgb(colorScale(d_event.nodeId)).brighter(0.7).toString());
        // Highlight connected links
        chartGroup.selectAll<SVGPathElement, ProcessedLink>('.links path')
            .filter((link: ProcessedLink) => (link.source as ProcessedNode) === d_event || (link.target as ProcessedNode) === d_event)
            .transition().duration(150)
            .style('opacity', 0.9)
            .attr('stroke-width', (link: ProcessedLink) => Math.max(1.5, (link.width || 0) * 1.1));
    })
    .on('mouseout', function (this: SVGRectElement, _event: MouseEvent, d_event: ProcessedNode) {
        d3.select(this).style('opacity', 0.9).attr('fill', colorScale(d_event.nodeId));
        chartGroup.selectAll<SVGPathElement, ProcessedLink>('.links path')
            .filter((link: ProcessedLink) => (link.source as ProcessedNode) === d_event || (link.target as ProcessedNode) === d_event)
            .transition().duration(150)
            .style('opacity', 0.6)
            .attr('stroke-width', (link: ProcessedLink) => Math.max(1, link.width || 0));
    })
    .append('title')
      .text((d: ProcessedNode) => `${d.name}\nTotal Flow: ${d.value}`);

    // Add node labels
    nodeGroup.append('text')
      .attr('x', (d: ProcessedNode) => (d.x0 || 0) < graphWidth / 2 ? ((d.x1 || 0) - (d.x0 || 0) + 6) : -6) // Use d.x1 and d.x0 for positioning
      .attr('y', (d: ProcessedNode) => ((d.y1 || 0) - (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: ProcessedNode) => (d.x0 || 0) < graphWidth / 2 ? 'start' : 'end')
      .text((d: ProcessedNode) => d.name)
      .style('fill', '#e6f1ff')
      .style('font-size', '10px')
      .style('font-weight', '500')
      .style('pointer-events', 'none') // Make text non-interactive
      .style('text-shadow', '0 0 2px rgba(0,0,0,0.7)');

  }, [data, width, height, idSuffix, colorScale, colorPalette]); // Added colorPalette to dependencies

  return <svg ref={svgRef}></svg>;
};

export default D3SankeyAttackedSystemsChart;
