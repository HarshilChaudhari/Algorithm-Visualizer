// src/visualizations/dataStructures/BSTCanvas.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";

const NODE_RADIUS = 22; // radius (instead of width/height) for easier math
const NODE_DIAM = NODE_RADIUS * 2;
const LEVEL_HEIGHT = 90;
const BANNER_HEIGHT = 50;
const TOP_MARGIN = 20; // gap between banner and root node

export default function BSTCanvas({
  steps,
  isPlaying,
  resetSignal,
  speed: parentSpeed,
  runId,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(parentSpeed || 800);
  const containerRef = useRef(null);

  useEffect(() => {
    if (parentSpeed) setSpeed(parentSpeed);
  }, [parentSpeed]);

  useEffect(() => {
    setCurrentStep(0);
  }, [steps, resetSignal, runId]);

  useEffect(() => {
    if (!isPlaying || !steps?.length || currentStep >= steps.length - 1) return;
    const t = setTimeout(
      () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1)),
      speed
    );
    return () => clearTimeout(t);
  }, [isPlaying, currentStep, steps, speed]);

  const { nodes, edges } = useMemo(() => {
    const step = steps?.[currentStep] || { root: null };
    const nodesArr = [];
    const edgeIds = [];

    if (!step.root) return { nodes: [], edges: [] };

    const containerWidth = Math.max(containerRef.current?.clientWidth || 800, 200);

    function layout(node, depth, xMin, xMax) {
      if (!node) return null;
      const x = (xMin + xMax) / 2;
      const y = BANNER_HEIGHT + TOP_MARGIN + depth * LEVEL_HEIGHT;
      nodesArr.push({ id: node.id, value: node.value, _cx: x, _cy: y });

      if (node.left) {
        layout(node.left, depth + 1, xMin, x);
        edgeIds.push({ fromId: node.id, toId: node.left.id });
      }
      if (node.right) {
        layout(node.right, depth + 1, x, xMax);
        edgeIds.push({ fromId: node.id, toId: node.right.id });
      }
      return node;
    }

    const padding = NODE_DIAM;
    layout(step.root, 0, padding / 2, containerWidth - padding / 2);

    const nodesById = Object.fromEntries(nodesArr.map((n) => [n.id, n]));

    const edgesFinal = edgeIds
      .map(({ fromId, toId }) => {
        const from = nodesById[fromId];
        const to = nodesById[toId];
        if (!from || !to) return null;

        // vector from parent to child
        const dx = to._cx - from._cx;
        const dy = to._cy - from._cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offsetX = (dx / dist) * NODE_RADIUS;
        const offsetY = (dy / dist) * NODE_RADIUS;

        return {
          fromId,
          toId,
          x1: from._cx + offsetX,
          y1: from._cy + offsetY,
          x2: to._cx - offsetX,
          y2: to._cy - offsetY,
        };
      })
      .filter(Boolean);

    return { nodes: nodesArr, edges: edgesFinal };
  }, [steps, currentStep]);

  const stepInfo = steps?.[currentStep] || {};
  const action = stepInfo.action || "";
  const highlighted = stepInfo.highlighted || [];

  const actionStyles = {
    compare: { color: "#f39c12", icon: "🔍", label: "Comparing" },
    insert: { color: "#2ecc71", icon: "➕", label: "Inserting" },
    delete: { color: "#ff6b6b", icon: "❌", label: "Deleting" },
    found: { color: "#3498db", icon: "✅", label: "Found" },
    not_found: { color: "#9b59b6", icon: "❓", label: "Not found" },
    replace: { color: "#e67e22", icon: "♻️", label: "Replacing" },
    done: { color: "#7f8c8d", icon: "🏁", label: "Done" },
    default: { color: "#34495e", icon: "ℹ️", label: "Idle" },
  };
  const currentStyle = actionStyles[action] || actionStyles.default;

  const edgeIsHighlighted = (edge) =>
    highlighted.includes(edge.toId) ||
    (highlighted.includes(edge.fromId) && highlighted.includes(edge.toId));

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 420,
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fff",
        overflow: "visible",
      }}
    >
      {/* banner */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: BANNER_HEIGHT,
          backgroundColor: currentStyle.color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 15,
          padding: "0 10px",
          zIndex: 3,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {currentStyle.icon} {stepInfo.message || currentStyle.label}
      </div>

      {/* edges */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        {edges.map((e, idx) => (
          <line
            key={`${e.fromId}-${e.toId}-${idx}`}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={edgeIsHighlighted(e) ? currentStyle.color : "#bbb"}
            strokeWidth={edgeIsHighlighted(e) ? 3 : 2}
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* nodes */}
      {nodes.map((n) => {
        const isHighlighted = highlighted.includes(n.id);
        const nodeBg = isHighlighted
          ? currentStyle.color
          : "linear-gradient(145deg, #e0f7fa, #87CEEB)";
        const nodeColor = isHighlighted ? "#fff" : "#111";
        const glow = isHighlighted ? `0 0 12px ${currentStyle.color}99` : "0 1px 3px #0003";

        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: n._cx,
              top: n._cy,
              transform: "translate(-50%, -50%)",
              width: NODE_DIAM,
              height: NODE_DIAM,
              borderRadius: "50%",
              background: nodeBg,
              color: nodeColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
              boxShadow: glow,
              border: isHighlighted ? `2px solid ${currentStyle.color}` : "1px solid #6662",
              zIndex: 2,
              transition: "all 0.25s ease",
            }}
          >
            {n.value}
          </div>
        );
      })}

      {/* speed control */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#fafafa",
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid #eee",
          zIndex: 4,
        }}
      >
        <label style={{ fontSize: 13 }}>Speed</label>
        <input
          type="range"
          min={100}
          max={2000}
          step={50}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
        <span style={{ width: 60, textAlign: "right", fontSize: 13 }}>{speed} ms</span>
      </div>
    </div>
  );
}
