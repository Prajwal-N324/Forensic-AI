import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";

/**
 * ForceGraph — Interactive D3 force-directed graph for forensic correlation mapping.
 * Features:
 *   • Real physics simulation with draggable nodes
 *   • Zoom & pan via mouse/touch
 *   • Animated particle flow along links (data-flow effect)
 *   • Glow halos on nodes, color-coded by suspect type
 *   • Link thickness proportional to interaction count
 *   • Click node to select, hover tooltips
 *   • Responsive: fills parent container
 */
const NODE_COLORS = {
  suspect:   "#f43f5e",  // rose
  associate: "#a855f7",  // purple
  victim:    "#06b6d4",  // cyan
  flagged:   "#f59e0b",  // amber
  default:   "#6b7280",  // gray
};

const LINK_TYPE_COLORS = {
  extortion:     "rgba(244, 63, 94, 0.5)",
  coordination:  "rgba(168, 85, 247, 0.5)",
  burner:        "rgba(245, 158, 11, 0.5)",
  communication: "rgba(6, 182, 212, 0.5)",
  data_transfer: "rgba(59, 130, 246, 0.5)",
  none:          "rgba(107, 114, 128, 0.15)",
  default:       "rgba(107, 114, 128, 0.35)",
};

export default function ForceGraph({ graphData, onNodeSelect, selectedNodeId }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const simulationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Observe container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Main D3 render
  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);

    // Clear previous
    svg.selectAll("*").remove();

    // Deep clone data so D3 can mutate it
    const nodes = graphData.nodes.map(n => ({ ...n }));
    const links = graphData.links
      .filter(l => l.value > 0)
      .map(l => ({ ...l }));

    // ── Defs: gradients, glows, arrow markers ──
    const defs = svg.append("defs");

    // Glow filter
    const glow = defs.append("filter")
      .attr("id", "nodeGlow")
      .attr("x", "-50%").attr("y", "-50%")
      .attr("width", "200%").attr("height", "200%");
    glow.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    glow.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    // Stronger glow for selected node
    const glowStrong = defs.append("filter")
      .attr("id", "nodeGlowStrong")
      .attr("x", "-80%").attr("y", "-80%")
      .attr("width", "260%").attr("height", "260%");
    glowStrong.append("feGaussianBlur").attr("stdDeviation", "8").attr("result", "blur");
    glowStrong.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    // Link glow
    const linkGlow = defs.append("filter")
      .attr("id", "linkGlow")
      .attr("x", "-20%").attr("y", "-20%")
      .attr("width", "140%").attr("height", "140%");
    linkGlow.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "blur");
    linkGlow.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    // Arrow markers per link type
    Object.entries(LINK_TYPE_COLORS).forEach(([type, color]) => {
      defs.append("marker")
        .attr("id", `arrow-${type}`)
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 28)
        .attr("refY", 5)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", color.replace(/[\d.]+\)$/, "0.8)"));
    });

    // Radial gradient for background
    const bgGrad = defs.append("radialGradient")
      .attr("id", "bgRadial")
      .attr("cx", "50%").attr("cy", "50%").attr("r", "60%");
    bgGrad.append("stop").attr("offset", "0%").attr("stop-color", "rgba(6, 182, 212, 0.03)");
    bgGrad.append("stop").attr("offset", "100%").attr("stop-color", "rgba(0, 0, 0, 0)");

    // ── Container group with zoom ──
    const g = svg.append("g");

    // Background rect for zoom
    svg.insert("rect", ":first-child")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#bgRadial)")
      .style("pointer-events", "all");

    // Grid lines (subtle)
    const gridGroup = g.append("g").attr("class", "grid-lines");
    for (let x = 0; x < width; x += 60) {
      gridGroup.append("line")
        .attr("x1", x).attr("y1", 0).attr("x2", x).attr("y2", height)
        .attr("stroke", "rgba(255,255,255,0.015)").attr("stroke-width", 0.5);
    }
    for (let y = 0; y < height; y += 60) {
      gridGroup.append("line")
        .attr("x1", 0).attr("y1", y).attr("x2", width).attr("y2", y)
        .attr("stroke", "rgba(255,255,255,0.015)").attr("stroke-width", 0.5);
    }

    // Zoom behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoomBehavior);

    // ── Force simulation ──
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(d => 180 - d.value * 15))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    simulationRef.current = simulation;

    // ── Links ──
    const linkGroup = g.append("g").attr("class", "links");

    const linkElements = linkGroup.selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => LINK_TYPE_COLORS[d.type] || LINK_TYPE_COLORS.default)
      .attr("stroke-width", d => Math.max(1.5, d.value * 2))
      .attr("stroke-dasharray", d => d.type === "burner" ? "6,4" : "none")
      .attr("filter", "url(#linkGlow)")
      .attr("marker-end", d => `url(#arrow-${d.type || "default"})`)
      .style("opacity", 0.7);

    // Link value labels
    const linkLabels = linkGroup.selectAll("text")
      .data(links)
      .join("text")
      .attr("fill", "rgba(255,255,255,0.4)")
      .attr("font-size", "9px")
      .attr("font-family", "var(--font-mono, monospace)")
      .attr("text-anchor", "middle")
      .text(d => `${d.value} ${d.type}`);

    // ── Animated particles on links ──
    const particleGroup = g.append("g").attr("class", "particles");
    const particleData = [];

    links.forEach((link, i) => {
      for (let p = 0; p < Math.max(1, link.value); p++) {
        particleData.push({
          linkIndex: i,
          offset: p / Math.max(1, link.value),
          speed: 0.002 + Math.random() * 0.003,
          link
        });
      }
    });

    const particles = particleGroup.selectAll("circle")
      .data(particleData)
      .join("circle")
      .attr("r", 2)
      .attr("fill", d => {
        const color = NODE_COLORS[d.link.type] || NODE_COLORS.default;
        return color;
      })
      .style("opacity", 0.7);

    // ── Nodes ──
    const nodeGroup = g.append("g").attr("class", "nodes");

    const nodeElements = nodeGroup.selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeSelect && onNodeSelect(d);
      });

    // Outer glow halo
    nodeElements.append("circle")
      .attr("r", d => 24 + d.count * 2)
      .attr("fill", d => {
        const c = NODE_COLORS[d.type] || NODE_COLORS.default;
        return c.replace(")", ", 0.08)").replace("rgb", "rgba");
      })
      .attr("stroke", "none");

    // Pulse ring
    nodeElements.append("circle")
      .attr("class", "pulse-ring")
      .attr("r", d => 20 + d.count)
      .attr("fill", "none")
      .attr("stroke", d => NODE_COLORS[d.type] || NODE_COLORS.default)
      .attr("stroke-width", 1)
      .style("opacity", 0.3);

    // Main node circle
    nodeElements.append("circle")
      .attr("class", "main-node")
      .attr("r", d => 14 + d.count * 1.5)
      .attr("fill", d => NODE_COLORS[d.type] || NODE_COLORS.default)
      .attr("stroke", d => d.id === selectedNodeId ? "#ffffff" : "rgba(255,255,255,0.2)")
      .attr("stroke-width", d => d.id === selectedNodeId ? 3 : 1.5)
      .attr("filter", d => d.id === selectedNodeId ? "url(#nodeGlowStrong)" : "url(#nodeGlow)");

    // Inner bright core
    nodeElements.append("circle")
      .attr("r", d => 5 + d.count * 0.5)
      .attr("fill", "rgba(255,255,255,0.25)");

    // Node labels
    nodeElements.append("text")
      .attr("dy", d => 28 + d.count * 1.5)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "11px")
      .attr("font-weight", d => d.id === selectedNodeId ? 700 : 500)
      .attr("font-family", "var(--font-sans, system-ui)")
      .text(d => d.id);

    // Type label below name
    nodeElements.append("text")
      .attr("dy", d => 42 + d.count * 1.5)
      .attr("text-anchor", "middle")
      .attr("fill", d => NODE_COLORS[d.type] || NODE_COLORS.default)
      .attr("font-size", "8px")
      .attr("font-weight", 600)
      .attr("text-transform", "uppercase")
      .attr("font-family", "var(--font-mono, monospace)")
      .text(d => d.type.toUpperCase());

    // Count badge
    nodeElements.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", 700)
      .attr("font-family", "var(--font-mono, monospace)")
      .text(d => d.count);

    // ── Tick function ──
    let t = 0;
    simulation.on("tick", () => {
      t += 1;

      linkElements
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      linkLabels
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2 - 8);

      nodeElements.attr("transform", d => `translate(${d.x}, ${d.y})`);

      // Animate particles along links
      particles.attr("cx", d => {
        const link = links[d.linkIndex];
        if (!link || !link.source || !link.target) return 0;
        const progress = ((t * d.speed + d.offset) % 1);
        return link.source.x + (link.target.x - link.source.x) * progress;
      }).attr("cy", d => {
        const link = links[d.linkIndex];
        if (!link || !link.source || !link.target) return 0;
        const progress = ((t * d.speed + d.offset) % 1);
        return link.source.y + (link.target.y - link.source.y) * progress;
      });
    });

    // Pulse animation
    const pulseAnim = () => {
      nodeElements.selectAll(".pulse-ring")
        .transition()
        .duration(2000)
        .attr("r", d => 30 + d.count * 2)
        .style("opacity", 0)
        .transition()
        .duration(0)
        .attr("r", d => 20 + d.count)
        .style("opacity", 0.3)
        .on("end", pulseAnim);
    };
    pulseAnim();

    // Click on background to deselect
    svg.on("click", () => {
      onNodeSelect && onNodeSelect(null);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [graphData, dimensions, selectedNodeId]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "450px", position: "relative" }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ 
          display: "block", 
          background: "radial-gradient(ellipse at center, rgba(6,182,212,0.03) 0%, transparent 70%)",
          borderRadius: "8px"
        }}
      />
      {/* Legend */}
      <div style={{
        position: "absolute",
        bottom: "0.75rem",
        left: "0.75rem",
        display: "flex",
        gap: "0.75rem",
        flexWrap: "wrap",
        padding: "0.4rem 0.6rem",
        background: "rgba(10, 15, 26, 0.85)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "6px",
        fontSize: "0.68rem",
        color: "#9ca3af"
      }}>
        {Object.entries(NODE_COLORS).filter(([k]) => k !== "default").map(([type, color]) => (
          <span key={type} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", boxShadow: `0 0 6px ${color}` }} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
      </div>
      {/* Controls hint */}
      <div style={{
        position: "absolute",
        top: "0.75rem",
        right: "0.75rem",
        padding: "0.3rem 0.5rem",
        background: "rgba(10, 15, 26, 0.8)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "4px",
        fontSize: "0.65rem",
        color: "#6b7280"
      }}>
        Drag nodes • Scroll to zoom • Click to select
      </div>
    </div>
  );
}
