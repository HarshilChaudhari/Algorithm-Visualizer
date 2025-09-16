// algorithms/sorting/quickSortSteps.js
export function quickSortSteps(inputArray) {
  // normalize input -> { id, value }
  const items = (inputArray || []).map((v, idx) => {
    if (typeof v === "number") return { id: idx, value: v };
    if (v && typeof v === "object" && typeof v.value === "number")
      return { id: idx, value: v.value };
    const num = Number(v);
    return { id: idx, value: Number.isNaN(num) ? 0 : num };
  });

  const steps = [];
  const arr = items.map((x) => ({ ...x }));

  function record(array, comparing = [], swapped = [], pivot = null, done = false) {
    steps.push({
      array: array.map((x) => ({ ...x })),
      comparing,
      swapped,
      pivot,
      done,
    });
  }

  function partition(low, high) {
    const pivot = arr[high];
    let i = low;

    for (let j = low; j < high; j++) {
      record(arr, [arr[j].id], [], pivot.id); // compare with pivot
      if (arr[j].value < pivot.value) {
        // swap arr[i] and arr[j]
        [arr[i], arr[j]] = [arr[j], arr[i]];
        record(arr, [], [arr[i].id, arr[j].id], pivot.id);
        i++;
      }
    }

    // final swap: pivot to correct position
    [arr[i], arr[high]] = [arr[high], arr[i]];
    record(arr, [], [arr[i].id, arr[high].id], pivot.id);
    return i;
  }

  function quickSort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  }

  // initial snapshot
  record(arr, [], [], null, false);
  quickSort(0, arr.length - 1);
  record(arr, [], [], null, true); // final sorted

  return steps;
}
