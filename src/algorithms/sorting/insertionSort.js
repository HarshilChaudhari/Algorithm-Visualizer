// insertionSort.js
export function insertionSortSteps(inputArray) {
  // normalize input -> items with numeric value and stable ids
  const items = (inputArray || []).map((v, idx) => {
    if (typeof v === "number") return { id: idx, value: v };
    if (v && typeof v === "object" && typeof v.value === "number") return { id: idx, value: v.value };
    const num = Number(v);
    return { id: idx, value: Number.isNaN(num) ? 0 : num };
  });

  const steps = [];
  const arr = items.map(x => ({ ...x })); // working array
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    const key = { ...arr[i] };
    let j = i - 1;

    // Step 1: lift key, create gap at i
    arr[i] = null;
    steps.push({
      array: arr.map(x => (x ? { ...x } : null)),
      comparing: [],
      shifted: [],
      floatingKey: { id: key.id, value: key.value, targetIndex: i }
    });

    // Step 2: shift elements right until correct position
    while (j >= 0 && arr[j] && arr[j].value > key.value) {
      arr[j + 1] = { ...arr[j] }; // move element right
      arr[j] = null; // gap moves to previous element

      steps.push({
        array: arr.map(x => (x ? { ...x } : null)),
        comparing: [arr[j + 1].id, key.id],
        shifted: [arr[j + 1].id],
        floatingKey: { id: key.id, value: key.value, targetIndex: j }
      });

      j--;
    }

    // Step 3: insert key into correct spot
    arr[j + 1] = { ...key };
    steps.push({
      array: arr.map(x => (x ? { ...x } : null)),
      comparing: [],
      shifted: [key.id],
      floatingKey: null
    });
  }

  // Final done step
  steps.push({
    array: arr.map(x => (x ? { ...x } : null)),
    comparing: [],
    shifted: [],
    floatingKey: null,
    done: true
  });

  return steps;
}
