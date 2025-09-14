// bubbleSort.js
export function bubbleSortSteps(inputArray) {
  // normalize input -> items with numeric value
  const items = (inputArray || []).map((v, idx) => {
    if (typeof v === "number") return { id: idx, value: v };
    if (v && typeof v === "object" && typeof v.value === "number") return { id: idx, value: v.value };
    const num = Number(v);
    return { id: idx, value: Number.isNaN(num) ? 0 : num };
  });

  const steps = [];
  const arr = items.map(x => ({ ...x })); // working array

  // initial snapshot
  steps.push({ array: arr.map(x => ({ ...x })), comparing: [], swapped: [] });

  const n = arr.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // mark comparing
      steps.push({
        array: arr.map(x => ({ ...x })),
        comparing: [arr[j].id, arr[j + 1].id],
        swapped: []
      });

      if (arr[j].value > arr[j + 1].value) {
        // swap elements
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;

        // mark swapped
        steps.push({
          array: arr.map(x => ({ ...x })),
          comparing: [],
          swapped: [arr[j].id, arr[j + 1].id]
        });
      }
    }
  }

  // final done step
  steps.push({
    array: arr.map(x => ({ ...x })),
    comparing: [],
    swapped: [],
    done: true
  });

  return steps;
}
