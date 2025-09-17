// src/visualizations/sorting/MergeSortCanvas.jsx
import React, { useEffect, useMemo, useState } from "react";

/*
Props:
 - steps: array from mergeSortSteps
 - isPlaying: boolean
 - resetSignal: numeric
 - speed: ms per step
 - runId: string/number
 - onFinish: callback
*/

const BAR_WIDTH = 18;
const GAP = 6;
const LEVEL_GAP = 120;
const TOP_PADDING = 20;
const LEFT_PADDING = 20;
const CHILD_SPACING = 20;
const BAR_SCALE = 6;
const NODE_PADDING = 8;

export default function MergeSortCanvas({
  steps = [],
  isPlaying,
  resetSignal = 0,
  speed = 500,
  runId = 0,
  onFinish,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [floating, setFloating] = useState(null);
  const [lastComparing, setLastComparing] = useState(null);

  // Reset when steps or resetSignal changes
  useEffect(() => {
    setCurrentStep(0);
    setFloating(null);
    setLastComparing(null);
  }, [steps, resetSignal, runId]);

  // Animation timer
  useEffect(() => {
    if (!isPlaying || !steps || steps.length === 0) return;
    if (currentStep >= steps.length - 1) {
      if (typeof onFinish === "function") onFinish();
      return;
    }
    const t = setTimeout(
      () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1)),
      speed
    );
    return () => clearTimeout(t);
  }, [isPlaying, currentStep, steps, speed, onFinish]);

  if (!steps || steps.length === 0) {
    return <div style={{ textAlign: "center", padding: 20 }}>No steps to display</div>;
  }

  const step = steps[currentStep] || { tree: null, type: "idle" };
  const action = step.type ? step : { type: "idle" };

  // Keep comparison highlight alive during next "place"
  useEffect(() => {
    if (action.type === "comparing") {
      setLastComparing(action.comparing || []);
    } else if (action.type !== "place") {
      setLastComparing(null);
    }
  }, [action]);

  // Deep clone tree & assign layout positions
  const computeLayout = (tree) => {
    if (!tree) return null;

    const clone = (node) => {
      if (!node) return null;
      return {
        ...node,
        array: (node.array || []).map((x) => ({ ...x })),
        left: clone(node.left),
        right: clone(node.right),
        nodeWidth: 0,
        totalWidth: 0,
        x: 0,
        y: 0,
      };
    };

    const root = clone(tree);

    const computeSizes = (node) => {
      if (!node) return 0;
      const barsWidth = (node.array.length || 0) * (BAR_WIDTH + GAP) - GAP;
      const nodeInner = barsWidth + NODE_PADDING * 2;
      node.nodeWidth = Math.max(60, nodeInner);

      const leftW = computeSizes(node.left);
      const rightW = computeSizes(node.right);

      if (node.left || node.right) {
        const childrenWidth = (leftW || 0) + CHILD_SPACING + (rightW || 0);
        node.totalWidth = Math.max(node.nodeWidth, childrenWidth);
      } else {
        node.totalWidth = node.nodeWidth;
      }
      return node.totalWidth;
    };

    const assign = (node, startX = LEFT_PADDING, depth = 0) => {
      if (!node) return;
      node.x = startX + (node.totalWidth - node.nodeWidth) / 2;
      node.y = TOP_PADDING + depth * LEVEL_GAP;
      if (node.left) assign(node.left, startX, depth + 1);
      if (node.right) assign(node.right, startX + (node.left?.totalWidth || 0) + CHILD_SPACING, depth + 1);
    };

    computeSizes(root);
    assign(root);
    return root;
  };

  const layoutRoot = useMemo(() => computeLayout(step.tree), [step.tree]);

  // Find node by id
  const findNode = (node, id) => {
    if (!node) return null;
    if (node.id === id) return node;
    return findNode(node.left, id) || findNode(node.right, id);
  };

  // Bar position in node
  const barPosition = (node, idx) => {
    if (!node) return null;
    const bars = node.array || [];
    if (idx < 0 || idx >= bars.length) return null;
    const barsWidth = (bars.length || 0) * (BAR_WIDTH + GAP) - GAP;
    const contentLeft = node.x + (node.nodeWidth - barsWidth) / 2;
    const x = contentLeft + idx * (BAR_WIDTH + GAP);
    const barHeight = Math.max(4, (bars[idx]?.value || 0) * BAR_SCALE);
    const barAreaBottom = node.y + NODE_PADDING + (LEVEL_GAP / 2);
    const top = barAreaBottom - barHeight;
    return { left: x, top, width: BAR_WIDTH, height: barHeight };
  };

  // Handle floating "place" animation
  useEffect(() => {
    if (action.type !== "place") {
      setFloating(null);
      return;
    }

    const prevLayout = computeLayout(steps[Math.max(0, currentStep - 1)]?.tree);
    if (!prevLayout) return;

    const fromNodeId = action.fromNodeId || null;
    const parentNodeId = action.nodeId || null;
    const itemId = action.id;
    const targetIndex = action.targetIndex;

    let sourceNode = fromNodeId ? findNode(prevLayout, fromNodeId) : null;
    if (!sourceNode) {
      const search = (n) => {
        if (!n) return null;
        if ((n.array || []).some((it) => it.id === itemId)) return n;
        return search(n.left) || search(n.right);
      };
      sourceNode = search(prevLayout);
    }

    const targetNode = parentNodeId ? findNode(layoutRoot, parentNodeId) : null;
    if (!sourceNode || !targetNode) return;

    const srcIdx = (sourceNode.array || []).findIndex((it) => it.id === itemId);
    const tgtIdx = targetIndex; // rely strictly on mergeSortSteps
    if (srcIdx === -1 || tgtIdx == null) return;

    const srcBar = barPosition(sourceNode, srcIdx);
    const tgtBar = barPosition(targetNode, tgtIdx);
    if (!srcBar || !tgtBar) return;

    const duration = Math.min(Math.max(120, Math.floor(speed * 0.75)), 600);

    setFloating({
      id: itemId,
      value: sourceNode.array[srcIdx].value,
      left: srcBar.left,
      top: srcBar.top,
      width: srcBar.width,
      height: srcBar.height,
      targetLeft: tgtBar.left,
      targetTop: tgtBar.top,
    });

    const moveTimeout = setTimeout(() => {
      setFloating((f) => (f ? { ...f, left: tgtBar.left, top: tgtBar.top } : f));
    }, 20);

    const clearTimeoutId = setTimeout(() => {
      setFloating(null);
    }, duration + 80);

    return () => {
      clearTimeout(moveTimeout);
      clearTimeout(clearTimeoutId);
    };
  }, [currentStep, action, layoutRoot, speed, steps]);

  // Collect nodes + edges
  const nodes = [];
  const connections = [];
  const collect = (node) => {
    if (!node) return;
    nodes.push(node);
    if (node.left) {
      connections.push({
        x1: node.x + node.nodeWidth / 2,
        y1: node.y + NODE_PADDING + (LEVEL_GAP / 4),
        x2: node.left.x + node.left.nodeWidth / 2,
        y2: node.left.y - NODE_PADDING,
      });
      collect(node.left);
    }
    if (node.right) {
      connections.push({
        x1: node.x + node.nodeWidth / 2,
        y1: node.y + NODE_PADDING + (LEVEL_GAP / 4),
        x2: node.right.x + node.right.nodeWidth / 2,
        y2: node.right.y - NODE_PADDING,
      });
      collect(node.right);
    }
  };
  collect(layoutRoot);

  const maxX = nodes.reduce((m, n) => Math.max(m, n.x + n.nodeWidth), 0);
  const maxY = nodes.reduce((m, n) => Math.max(m, n.y + LEVEL_GAP), 0);
  const svgWidth = Math.max(maxX + LEFT_PADDING, 800);
  const svgHeight = Math.max(maxY + LEVEL_GAP + 60, 400);

  return (
    <div style={{ overflowX: "auto", padding: 10 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <strong>Merge Sort — Step:</strong> {currentStep + 1} / {steps.length}
        <div style={{ fontSize: 12, color: "#666" }}>
          Action: <strong>{action.type}</strong>
        </div>
      </div>

      <div style={{ position: "relative", width: svgWidth, height: svgHeight, margin: "0 auto" }}>
        {/* Edges */}
        <svg style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} width={svgWidth} height={svgHeight}>
          {connections.map((c, idx) => (
            <line key={idx} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="#aaa" strokeWidth={1} />
          ))}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const isActive = action.nodeId === node.id;
          const borderColor =
            action.type === "split" && isActive ? "#ff9800" :
            action.type === "merged" && isActive ? "#4caf50" :
            action.type === "leaf" && isActive ? "#2196f3" :
            node.merged ? "#81c784" : "#ccc";

          const bars = node.array || [];
          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                left: node.x,
                top: node.y,
                width: node.nodeWidth,
                border: `2px solid ${borderColor}`,
                borderRadius: 10,
                background: "#fff",
                padding: NODE_PADDING,
                boxSizing: "border-box",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", gap: GAP, alignItems: "flex-end", justifyContent: "center", height: LEVEL_GAP / 2 }}>
                {bars.map((item, idx) => {
                  const height = Math.max(4, item.value * BAR_SCALE);
                  const isComp =
                    (action.type === "comparing" && action.comparing?.includes(item.id)) ||
                    (lastComparing?.includes(item.id) && action.type === "place");
                  const isPlace = action.type === "place" && action.id === item.id && isActive;
                  const isCoveredByFloating = floating && floating.id === item.id;

                  if (isCoveredByFloating) {
                    return <div key={`${node.id}-${item.id}`} style={{ width: BAR_WIDTH, height }} />; // reserve space
                  }

                  const bg = isComp ? "#ff9800" : isPlace ? "#4caf50" : "#3182ce";
                  return (
                    <div key={`${node.id}-${item.id}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div
                        style={{
                          width: BAR_WIDTH,
                          height,
                          background: bg,
                          borderRadius: 4,
                          transition: "all 250ms ease",
                        }}
                      />
                      <div style={{ fontSize: 11, marginTop: 4 }}>{item.value}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                [{node.leftIndex} - {node.rightIndex}]
              </div>
            </div>
          );
        })}

        {/* Floating bar animation */}
        {floating && (
          <div
            style={{
              position: "absolute",
              left: floating.left,
              top: floating.top,
              width: floating.width,
              height: floating.height,
              background: "#f44336",
              borderRadius: 4,
              transition: `left ${Math.min(Math.max(120, Math.floor(speed * 0.75)), 600)}ms ease, top ${Math.min(Math.max(120, Math.floor(speed * 0.75)), 600)}ms ease`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 12,
              fontWeight: "bold",
              zIndex: 9999,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            {floating.value}
          </div>
        )}
      </div>
    </div>
  );
}
