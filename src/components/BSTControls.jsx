// src/components/BSTControls.jsx
import React, { useState } from 'react';

export default function BSTControls({
  onInsert,
  onDelete,
  onSearch,
  onReset,
  isPlaying,
  onPlayPause,
  onBackToSorting // new prop
}) {
  const [valueInput, setValueInput] = useState('');
  const [listInput, setListInput] = useState('');

  const handleInsertSingle = () => {
    const val = parseInt(valueInput, 10);
    if (!isNaN(val)) {
      onInsert([val]);
      setValueInput('');
    }
  };

  const handleInsertList = () => {
    const vals = listInput.split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(v => !isNaN(v));
    if (vals.length > 0) {
      onInsert(vals);
      setListInput('');
    }
  };

  const handleDelete = () => {
    const val = parseInt(valueInput, 10);
    if (!isNaN(val)) {
      onDelete(val);
      setValueInput('');
    }
  };

  const handleSearch = () => {
    const val = parseInt(valueInput, 10);
    if (!isNaN(val)) {
      onSearch(val);
      setValueInput('');
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: 16 }}>
      <input
        type="number"
        placeholder="Single value"
        value={valueInput}
        onChange={e => setValueInput(e.target.value)}
      />
      <button onClick={handleInsertSingle}>Insert</button>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleSearch}>Search</button>

      <input
        type="text"
        placeholder="Comma-separated list"
        value={listInput}
        onChange={e => setListInput(e.target.value)}
      />
      <button onClick={handleInsertList}>Insert List</button>

      <button onClick={onReset}>Reset</button>
      <button onClick={onPlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>

      {/* New button to go back to sorting */}
      <button onClick={onBackToSorting}>Back to Sorting</button>
    </div>
  );
}
