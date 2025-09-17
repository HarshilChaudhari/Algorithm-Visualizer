// visualizations/sorting/QuickSortCanvas.jsx
import React, { useEffect, useState } from "react";

export default function QuickSortCanvas({
  steps = [],
  isPlaying,
  resetSignal = 0,
  speed = 500,
  runId = 0,
  onFinish,
}) {
  const [currentStep, setCurrentStep] = useState(0);

  // reset whenever steps or resetSignal changes
  useEffect(() => {
    setCurrentStep(0);
  }, [resetSignal, steps]);

  // animation loop
  useEffect(() => {
    if (!isPlaying) return;
    if (!steps || steps.length === 0) return;

    if (currentStep >= steps.length - 1) {
      if (typeof onFinish === "function") onFinish();
      return;
    }

    const t = setTimeout(() => {
      setCurrentStep((p) => Math.min(p + 1, steps.length - 1));
    }, speed);

    return () => clearTimeout(t);
  }, [isPlaying, currentStep, speed, steps, onFinish]);

  // ✅ guard: no steps OR invalid index
  if (!steps || steps.length === 0 || currentStep >= steps.length) {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        No steps to display
      </div>
    );
  }

  const step = steps[currentStep];
  if (!step || !step.array) {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        Preparing visualization...
      </div>
    );
  }

  const array = step.array;
  const barWidth = 40;
  const gap = 10;
  const barScale = 12;
  const containerWidth = array.length * (barWidth + gap);

  const transitionMs = Math.min(Math.max(80, Math.floor(speed * 0.75)), 350);

  const bars = array.map((item, index) => {
    if (!item) return null;

    const isPivot = step.pivot === item.id;
    const isComparing = (step.comparing || []).includes(item.id);
    const isSwapped = (step.swapped || []).includes(item.id);

    let color = "steelblue";
    if (isPivot) color = "purple";
    else if (isComparing) color = "gold";
    else if (isSwapped) color = "tomato";

    return (
      <div
        key={`${runId}-${item.id}`}
        title={`value: ${item.value}`}
        style={{
          position: "absolute",
          bottom: 12,
          left: 0,
          width: `${barWidth}px`,
          height: `${item.value * barScale}px`,
          background: color,
          transform: `translateX(${index * (barWidth + gap)}px)`,
          transition: `transform ${transitionMs}ms ease, height 300ms ease, background 150ms ease`,
          borderRadius: 4,
          textAlign: "center",
          color: "white",
          fontWeight: 600,
          fontSize: 12,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <div style={{ paddingBottom: 6 }}>{item.value}</div>
      </div>
    );
  });

  return (
    <div style={{ margin: "0 auto", maxWidth: "100%", padding: 10 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <strong>Step:</strong> {currentStep} / {steps.length - 1}
      </div>

      <div style={{ overflowX: "auto", padding: 6 }}>
        <div
          style={{
            position: "relative",
            height: `${barScale * (Math.max(...array.map((x) => x?.value || 0)) + 1) + 40}px`,
            width: `${containerWidth}px`,
            border: "1px solid #ddd",
            background: "#fafafa",
            margin: "0 auto",
          }}
        >
          {bars}
        </div>
      </div>
    </div>
  );
}
