import React, { useEffect, useState } from "react";

/*
Props:
 - steps: array of step objects from sort algorithms
 - isPlaying: boolean
 - resetSignal: numeric; increment to reset to step 0
 - speed: ms per step
 - runId: number/string used to prefix keys so new runs create new DOM nodes
 - onFinish(optional): callback when animation finishes
*/

export default function SortingCanvas({
  steps = [],
  isPlaying,
  resetSignal = 0,
  speed = 500,
  runId = 0,
  onFinish,
}) {
  const [currentStep, setCurrentStep] = useState(0);

  // reset whenever steps or resetSignal changes
  useEffect(() => setCurrentStep(0), [steps, resetSignal]);

  // animation timer
  useEffect(() => {
    if (!isPlaying || !steps || steps.length === 0) return;

    if (currentStep >= steps.length - 1) {
      if (onFinish) onFinish();
      return;
    }

    const t = setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, speed);

    return () => clearTimeout(t);
  }, [isPlaying, currentStep, steps, speed, onFinish]);

  if (!steps || steps.length === 0) {
    return <div style={{ textAlign: "center", padding: 20 }}>No steps to display</div>;
  }

  const step = steps[currentStep];
  if (!step || !step.array) return null;

  const array = step.array;

  const barWidth = 40;
  const gap = 10;
  const barScale = 12;

  // only count non-null items for container width to align bars properly
  const nonNullCount = array.filter((x) => x !== null).length;
  const containerWidth = array.length * (barWidth + gap);

  const transitionMs = Math.min(Math.max(80, Math.floor(speed * 0.75)), 350);

  const bars = [];

  // Render array bars (skip null = gap for floating key in insertion sort)
  array.forEach((item, index) => {
    if (!item) return;

    const isComparing = (step.comparing || []).includes(item.id);
    const isShifted = (step.shifted || []).includes(item.id);
    const isSwapped = (step.swapped || []).includes(item.id);

    let color = "steelblue";
    if (isComparing) color = "gold";
    if (isShifted || isSwapped) color = "tomato";

    bars.push(
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

  // Render floating key (insertion sort only)
  if (step.floatingKey) {
    const fk = step.floatingKey;
    bars.push(
      <div
        key={`floating-${runId}-${fk.id}`}
        style={{
          position: "absolute",
          bottom: 60, // lifted above baseline
          left: 0,
          width: `${barWidth}px`,
          height: `${fk.value * barScale}px`,
          background: "orange",
          transform: `translateX(${fk.targetIndex * (barWidth + gap)}px)`,
          transition: `transform ${transitionMs}ms ease, bottom 300ms ease`,
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
        <div style={{ paddingBottom: 6 }}>{fk.value}</div>
      </div>
    );
  }

  return (
    <div style={{ margin: "0 auto", maxWidth: "100%", padding: 10 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <strong>Step:</strong> {currentStep} / {steps.length - 1}
      </div>

      <div style={{ overflowX: "auto", padding: 6 }}>
        <div
          style={{
            position: "relative",
            height: `${barScale * (Math.max(...array.map((x) => x?.value || 0)) + 1) + 60}px`,
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
