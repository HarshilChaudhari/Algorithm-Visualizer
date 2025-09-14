import React from "react";

const Controls = ({
  isPlaying,
  onPlayPause,
  onReset,
  onRandomize,
  speed,
  onSpeedChange,
  arraySize,
  onArraySizeChange,
  algorithm,
  onAlgorithmChange
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        margin: "16px 0"
      }}
    >
      <div>
        <button
          onClick={onPlayPause}
          style={{
            padding: "8px 14px",
            background: isPlaying ? "tomato" : "green",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginRight: 8
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          onClick={onReset}
          style={{
            padding: "8px 12px",
            background: "#2b6cb0",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginRight: 8
          }}
        >
          Reset
        </button>

        <button
          onClick={onRandomize}
          style={{
            padding: "8px 12px",
            background: "#4a5568",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Randomize
        </button>
      </div>

      {/* Algorithm selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ fontSize: 12 }}>Algorithm:</label>
        <select
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value)}
          style={{ padding: "4px 6px" }}
        >
          <option value="bubble">Bubble Sort</option>
          <option value="insertion">Insertion Sort</option>
          <option value="heap">Heap Sort</option> {/* new option */}
        </select>
      </div>

      {/* Speed Slider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ fontSize: 12 }}>
          Speed: <strong>{speed} ms</strong>
        </label>
        <input
          type="range"
          min="80"
          max="1200"
          step="10"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
        />
      </div>

      {/* Array Size Slider */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ fontSize: 12 }}>
          Array size: <strong>{arraySize}</strong>
        </label>
        <input
          type="range"
          min="3"
          max="30"
          step="1"
          value={arraySize}
          onChange={(e) => onArraySizeChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default Controls;
