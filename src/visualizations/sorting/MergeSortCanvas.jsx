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
const BAR_SCALE = 6; // px per value unit
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
  const [floating, setFloating] = useState(null); // {id, value, left, top, targetLeft, targetTop, visible}

  // reset when steps or resetSignal changes
  useEffect(() => {
    setCurrentStep(0);
    setFloating(null);
  }, [steps, resetSignal, runId]);

  // animation timer
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

  const step = steps[currentStep] || { tree: null, action: { type: "idle" } };
  const action = step.action || { type: "idle" };

  // compute layout for a given tree (returns nodes with x,y and widths)
  const computeLayout = (tree) => {
    if (!tree) return null;

    // deep clone to attach layout props
    const clone = (node) => {
      if (!node) return null;
      return {
        id: node.id,
        leftIndex: node.leftIndex,
        rightIndex: node.rightIndex,
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

    // compute sizes (post-order)
    const computeSizes = (node) => {
      if (!node) return 0;
      const bars = node.array || [];
      const barsWidth = Math.max(0, (bars.length || 0) * (BAR_WIDTH + GAP) - GAP);
      const nodeInner = barsWidth + NODE_PADDING * 2;
      node.nodeWidth = Math.max(60, nodeInner); // min width
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

    // assign positions (pre-order)
    const assign = (node, startX = LEFT_PADDING, depth = 0) => {
      if (!node) return;
      node.x = startX + (node.totalWidth - node.nodeWidth) / 2;
      node.y = TOP_PADDING + depth * LEVEL_GAP;
      const leftW = node.left ? node.left.totalWidth : 0;
      const rightW = node.right ? node.right.totalWidth : 0;
      if (node.left || node.right) {
        const leftStart = startX;
        const rightStart = startX + leftW + CHILD_SPACING;
        if (node.left) assign(node.left, leftStart, depth + 1);
        if (node.right) assign(node.right, rightStart, depth + 1);
      }
    };

    computeSizes(root);
    assign(root, LEFT_PADDING, 0);
    return root;
  };

  // layout for current step tree
  const layoutRoot = useMemo(() => computeLayout(step.tree), [step.tree]);

  // helper to find node by id in layout tree
  const findNode = (node, id) => {
    if (!node) return null;
    if (node.id === id) return node;
    return findNode(node.left, id) || findNode(node.right, id);
  };

  // helper to compute bar position for item idx in node
  const barPosition = (node, idx) => {
    if (!node) return null;
    const bars = node.array || [];
    const barsWidth = Math.max(0, (bars.length || 0) * (BAR_WIDTH + GAP) - GAP);
    const contentLeft = node.x + (node.nodeWidth - barsWidth) / 2;
    const x = contentLeft + idx * (BAR_WIDTH + GAP);
    const barHeight = Math.max(4, (bars[idx]?.value || 0) * BAR_SCALE);
    // bars area bottom coordinate:
    const barAreaBottom = node.y + NODE_PADDING + (LEVEL_GAP / 2);
    const top = barAreaBottom - barHeight;
    const left = x;
    return { left, top, width: BAR_WIDTH, height: barHeight };
  };

  // when we arrive at a 'place' action, create a floating element that moves from source -> target
  useEffect(() => {
    if (action.type !== "place") {
      // clear any floating when not placing
      setFloating(null);
      return;
    }

    // need previous step to find source location (child)
    const prevIndex = Math.max(0, currentStep - 1);
    const prevStep = steps[prevIndex] || {};
    const prevLayout = computeLayout(prevStep.tree);
    if (!prevLayout) return;

    const fromNodeId = action.fromNodeId || null;
    const parentNodeId = action.nodeId || null;
    const itemId = action.id;
    const targetIndex = typeof action.targetIndex === "number" ? action.targetIndex : null;

    // find source node and index of item
    let sourceNode = null;
    if (fromNodeId) sourceNode = findNode(prevLayout, fromNodeId);
    if (!sourceNode) {
      // fallback: search any node in prevLayout that contains item
      const search = (n) => {
        if (!n) return null;
        if ((n.array || []).some((it) => it.id === itemId)) return n;
        return search(n.left) || search(n.right);
      };
      sourceNode = search(prevLayout);
    }

    const targetLayout = layoutRoot;
    const targetNode = parentNodeId ? findNode(targetLayout, parentNodeId) : null;

    if (!sourceNode || !targetNode) {
      // nothing to animate; bail
      setFloating(null);
      return;
    }

    const sourceIdx = (sourceNode.array || []).findIndex((it) => it.id === itemId);
    if (sourceIdx === -1) {
      setFloating(null);
      return;
    }
    const srcBar = barPosition(sourceNode, sourceIdx);
    // target position inside parent: targetIndex gives offset inside parent
    const tgtIdx = targetIndex !== null ? targetIndex : (targetNode.array || []).findIndex((it) => it.id === itemId);
    if (tgtIdx === -1) {
      setFloating(null);
      return;
    }
    const tgtBar = barPosition(targetNode, tgtIdx);

    // floating initial (source) -> then animate to target
    const duration = Math.min(Math.max(80, Math.floor(speed * 0.75)), 450);

    // initial floating: source coords
    setFloating({
      id: itemId,
      value: sourceNode.array[sourceIdx].value,
      left: srcBar.left,
      top: srcBar.top,
      width: srcBar.width,
      height: srcBar.height,
      targetLeft: tgtBar.left,
      targetTop: tgtBar.top,
      visible: true,
      startedAt: Date.now(),
    });

    // move a tick later to target so CSS transition animates
    const moveTimeout = setTimeout(() => {
      setFloating((f) => (f ? { ...f, left: tgtBar.left, top: tgtBar.top } : f));
    }, 20);

    // clear floating after animation duration + small buffer
    const clearTimeoutId = setTimeout(() => {
      setFloating(null);
    }, duration + 80);

    return () => {
      clearTimeout(moveTimeout);
      clearTimeout(clearTimeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, action?.type, step.tree, speed, layoutRoot]); // layoutRoot included

  // collect nodes and connections for render
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

  const maxX = nodes.reduce((m, n) => Math.max(m, (n.x || 0) + (n.nodeWidth || 0)), 0);
  const maxY = nodes.reduce((m, n) => Math.max(m, (n.y || 0) + LEVEL_GAP), 0);
  const svgWidth = Math.max(maxX + LEFT_PADDING, 700);
  const svgHeight = Math.max(maxY + LEVEL_GAP + 60, 300);

  // render
  return (
    <div style={{ overflowX: "auto", padding: 10 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <strong>Merge Sort — Step:</strong> {currentStep + 1} / {steps.length}
        <div style={{ fontSize: 12, color: "#666" }}>Action: <strong>{action.type}</strong></div>
      </div>

      <div style={{ position: "relative", width: svgWidth, height: svgHeight, margin: "0 auto" }}>
        {/* connector lines */}
        <svg style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} width={svgWidth} height={svgHeight}>
          {connections.map((c, idx) => (
            <line key={idx} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="#999" strokeWidth={1} />
          ))}
        </svg>

        {/* node boxes */}
        {nodes.map((node) => {
          const nodeLeft = node.x;
          const nodeTop = node.y;
          const nodeWidth = node.nodeWidth;
          const isSplit = action.type === "split" && action.nodeId === node.id;
          const isMerged = action.type === "merged" && action.nodeId === node.id;
          const isLeaf = action.type === "leaf" && action.nodeId === node.id;

          const borderColor = isSplit ? "#ffb74d" : isMerged ? "#81c784" : isLeaf ? "#90caf9" : "#e0e0e0";
          const boxShadow = isSplit ? "0 8px 20px rgba(255,183,77,0.12)" : "0 6px 12px rgba(0,0,0,0.05)";

          // bars area width & left
          const bars = node.array || [];
          const barsWidth = Math.max(0, (bars.length || 0) * (BAR_WIDTH + GAP) - GAP);
          const contentLeft = nodeLeft + (nodeWidth - barsWidth) / 2;

          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                left: nodeLeft,
                top: nodeTop,
                width: nodeWidth,
                border: `2px solid ${borderColor}`,
                borderRadius: 10,
                background: "#fff",
                boxShadow,
                boxSizing: "border-box",
                padding: NODE_PADDING,
                transition: "all 250ms ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* bars area */}
              <div style={{ display: "flex", gap: GAP, alignItems: "flex-end", height: LEVEL_GAP / 2 }}>
                {bars.map((item, idx) => {
                  const height = Math.max(4, (item.value || 0) * BAR_SCALE);
                  const isComp = action.type === "compare" && Array.isArray(action.indices) && action.indices.includes(item.id);
                  const isPlace = action.type === "place" && action.id === item.id && action.nodeId === node.id;
                  const bg = isComp ? "#ffa726" : isPlace ? "#66bb6a" : "#3182ce";
                  const transform = isPlace ? "translateY(-12px)" : "translateY(0)";
                  return (
                    <div key={`${node.id}-${item.id}`} title={`value: ${item.value}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div
                        style={{
                          width: BAR_WIDTH,
                          height,
                          background: bg,
                          transition: "height 300ms ease, transform 300ms ease, background 200ms ease",
                          transform,
                          borderRadius: 4,
                        }}
                      />
                      {/* numeric label */}
                      <div style={{ marginTop: 6, fontSize: 11, color: "#222" }}>{item.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* range label */}
              <div style={{ fontSize: 11, color: "#666", marginTop: 8 }}>
                [{node.leftIndex} - {node.rightIndex}]
              </div>
            </div>
          );
        })}

        {/* floating bar (animated) */}
        {floating && (
          <div
            style={{
              position: "absolute",
              left: floating.left,
              top: floating.top,
              width: floating.width,
              height: floating.height,
              background: "#ff7043",
              borderRadius: 4,
              transform: "translateZ(0)",
              transition: `left ${Math.min(Math.max(80, Math.floor(speed * 0.75)), 450)}ms ease, top ${Math.min(Math.max(80, Math.floor(speed * 0.75)), 450)}ms ease`,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            }}
          >
            <span style={{ fontSize: 12 }}>{floating.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
