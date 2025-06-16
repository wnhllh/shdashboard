import React from "react";
import * as d3 from "d3";

export interface TreemapNode {
  name: string;
  value?: number;
  children?: TreemapNode[];
}

const mockData: TreemapNode = {
  name: "受攻击系统",
  children: [
    { name: "系统A", value: 120 },
    { name: "系统B", value: 80 },
    { name: "系统C", value: 60 },
    { name: "系统D", value: 30 },
    { name: "系统E", value: 10 },
  ],
};

interface D3TreemapAttackedSystemsChartProps {
  width?: number;
  height?: number;
  data?: TreemapNode;
}

const D3TreemapAttackedSystemsChart: React.FC<D3TreemapAttackedSystemsChartProps> = ({
  width = 400,
  height = 300,
  data = mockData,
}) => {
  const ref = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const root = d3.hierarchy(data).sum((d) => d.value || 0);
    const treemapLayout = d3.treemap<TreemapNode>().size([width, height]).padding(2);
    treemapLayout(root);
    const svg = d3.select(ref.current);
    svg.selectAll("g").remove();
    const node = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${(d as any).x0},${(d as any).y0})`);
    node
      .append("rect")
      .attr("width", (d) => (d as any).x1 - (d as any).x0)
      .attr("height", (d) => (d as any).y1 - (d as any).y0)
      .attr("fill", (_d, i) => d3.schemeCategory10[i % 10])
      .attr("stroke", "#fff");
    node
      .append("text")
      .attr("x", 4)
      .attr("y", 20)
      .attr("font-size", 14)
      .attr("fill", "#fff")
      .text(() => "");
  }, [data, width, height]);

  return (
    <div style={{ width, height, border: "1px solid #eee", borderRadius: 6, background: "#222" }}>
      <svg ref={ref} width={width} height={height} />
    </div>
  );
};

export default D3TreemapAttackedSystemsChart;
