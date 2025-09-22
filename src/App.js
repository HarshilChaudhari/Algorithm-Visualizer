import React, { useEffect, useState } from "react";
import Controls from "./components/Controls";
import SortingCanvas from "./visualizations/sorting/SortingCanvas";
import QuickSortCanvas from "./visualizations/sorting/QuickSortCanvas";
import MergeSortCanvas from "./visualizations/sorting/MergeSortCanvas";
import BSTCanvas from "./visualizations/dataStructures/BSTCanvas";
import BSTControls from "./components/BSTControls";

import { bubbleSortSteps } from "./algorithms/sorting/bubbleSort";
import { insertionSortSteps } from "./algorithms/sorting/insertionSort";
import { heapSortSteps } from "./algorithms/sorting/heapSort";
import { quickSortSteps } from "./algorithms/sorting/quickSortSteps";
import { mergeSortSteps } from "./algorithms/sorting/mergeSort";
import {
  bstInsertSteps,
  bstDeleteSteps,
  bstSearchSteps,
  resetNodeIdCounter,
} from "./algorithms/dataStructures/bst";

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

  // BST state
  const [bstRoot, setBstRoot] = useState(null);

  // pick correct algorithm generator
  const generateSteps = (arr, algo) => {
    switch (algo) {
      case "insertion":
        return insertionSortSteps(arr);
      case "heap":
        return heapSortSteps(arr);
      case "quick":
        return quickSortSteps(arr);
      case "merge":
        return mergeSortSteps(arr);
      case "bubble":
      default:
        return bubbleSortSteps(arr);
    }
  };

  // regenerate sorting steps whenever array, runId, or algorithm changes
  useEffect(() => {
    if (algorithm === "bst") return; // skip sorting for BST

    const s = generateSteps(array, algorithm);
    setSteps(s || []);
    setResetCounter((prev) => prev + 1);
    setIsPlaying(false);
  }, [array, runId, algorithm]);

  const handlePlayPause = () => setIsPlaying((p) => !p);

  const handleReset = () => {
    setIsPlaying(false);
    setResetCounter((p) => p + 1);
    if (algorithm === "bst") {
      setBstRoot(null);
      resetNodeIdCounter();
      setSteps([]);
    }
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

  // === BST handlers ===
  const handleBstInsert = (values) => {
    let newRoot = bstRoot;
    let allSteps = [];
    values.forEach((val) => {
      const res = bstInsertSteps(newRoot, val);
      newRoot = res.root;
      allSteps = allSteps.concat(res.steps);
    });
    setBstRoot(newRoot);
    setSteps(allSteps);
    setResetCounter((p) => p + 1);
    setIsPlaying(true);
  };

  const handleBstDelete = (value) => {
    if (bstRoot === null) return;
    const res = bstDeleteSteps(bstRoot, value);
    setBstRoot(res.root);
    setSteps(res.steps);
    setResetCounter((p) => p + 1);
    setIsPlaying(true);
  };

  const handleBstSearch = (value) => {
    if (bstRoot === null) return;
    const res = bstSearchSteps(bstRoot, value);
    setSteps(res.steps);
    setResetCounter((p) => p + 1);
    setIsPlaying(true);
  };

  // select canvas
  const CanvasComponent =
    algorithm === "quick"
      ? QuickSortCanvas
      : algorithm === "merge"
      ? MergeSortCanvas
      : algorithm === "bst"
      ? BSTCanvas
      : SortingCanvas;

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
        {algorithm === "bst" ? "BST Visualizer" : "Sorting Visualizer"}
      </h1>

      {algorithm === "bst" ? (
        <BSTControls
          onInsert={handleBstInsert}
          onDelete={handleBstDelete}
          onSearch={handleBstSearch}
          onReset={handleReset}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onBackToSorting={() => setAlgorithm("bubble")}
        />
      ) : (
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
          onAlgorithmChange={setAlgorithm}
        />
      )}

      <CanvasComponent
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
