import React, { useEffect, useState } from "react";
import Controls from "./components/Controls";
import SortingCanvas from "./visualizations/sorting/SortingCanvas";
import { bubbleSortSteps } from "./algorithms/sorting/bubbleSort";
import { insertionSortSteps } from "./algorithms/sorting/insertionSort";
import { heapSortSteps } from "./algorithms/sorting/heapSort"; // new import

function generateRandomArray(size, maxValue = 20) {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * maxValue) + 1
  );
}

export default function App() {
  const initialArray = generateRandomArray(6, 20);

  const [arraySize, setArraySize] = useState(initialArray.length);
  const [array, setArray] = useState(initialArray);
  const [steps, setSteps] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [resetCounter, setResetCounter] = useState(0);
  const [runId, setRunId] = useState(0);
  const [algorithm, setAlgorithm] = useState("bubble");

  // pick correct algorithm generator
  const generateSteps = (arr, algo) => {
    switch (algo) {
      case "insertion":
        return insertionSortSteps(arr);
      case "heap":
        return heapSortSteps(arr); // new case for Heap Sort
      case "bubble":
      default:
        return bubbleSortSteps(arr);
    }
  };

  // regenerate steps whenever array, runId, or algorithm changes
  useEffect(() => {
    const s = generateSteps(array, algorithm);
    if (s && s.length > 0) {
      setSteps(s);
      setResetCounter((prev) => prev + 1); // reset canvas to step 0
      setIsPlaying(false);
    } else {
      setSteps([]); // guard for empty steps
    }
  }, [array, runId, algorithm]);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setIsPlaying(false);
    setResetCounter((p) => p + 1);
  };
  const handleRandomize = () => {
    const newArr = generateRandomArray(arraySize, 20);
    setArray(newArr);
    setRunId((r) => r + 1);
  };
  const handleArraySizeChange = (size) => {
    setArraySize(size);
    const newArr = generateRandomArray(size, 20);
    setArray(newArr);
    setRunId((r) => r + 1);
  };
  const handleFinish = () => setIsPlaying(false);

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "18px auto",
        fontFamily: "Inter, Roboto, Arial, sans-serif",
        padding: 12,
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 10 }}>
        Sorting Visualizer
      </h1>

      <Controls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onRandomize={handleRandomize}
        speed={speed}
        onSpeedChange={setSpeed}
        arraySize={arraySize}
        onArraySizeChange={handleArraySizeChange}
        algorithm={algorithm}
        onAlgorithmChange={setAlgorithm} // dropdown callback
      />

      <SortingCanvas
        steps={steps}
        isPlaying={isPlaying}
        resetSignal={resetCounter}
        speed={speed}
        runId={runId}
        onFinish={handleFinish}
      />
    </div>
  );
}
