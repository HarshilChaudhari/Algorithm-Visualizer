// algorithms/sorting/heapSort.js
// Generates step objects for Heap Sort visualization

export function heapSortSteps(inputArray) {
  // Normalize input -> array of {id, value}
  const items = (inputArray || []).map((v, idx) => {
    if (typeof v === "number") return { id: idx, value: v };
    if (v && typeof v === "object" && typeof v.value === "number")
      return { id: idx, value: v.value };
    const num = Number(v);
    return { id: idx, value: Number.isNaN(num) ? 0 : num };
  });

  const steps = [];
  const a = items.map(x => ({ ...x })); // working array

  const n = a.length;

  const pushStep = (comparing = [], swapped = []) => {
    steps.push({
      array: a.map(x => ({ ...x })),
      comparing,
      swapped,
      done: false,
    });
  };

  // Heapify function
  const heapify = (size, root) => {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    // Compare left child
    if (left < size) {
      pushStep([largest, left]);
      if (a[left].value > a[largest].value) largest = left;
    }

    // Compare right child
    if (right < size) {
      pushStep([largest, right]);
      if (a[right].value > a[largest].value) largest = right;
    }

    // Swap if root is not largest
    if (largest !== root) {
      [a[root], a[largest]] = [a[largest], a[root]];
      pushStep([], [a[root].id, a[largest].id]);
      heapify(size, largest);
    }
  };

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  // Extract elements from heap
  for (let i = n - 1; i >= 0; i--) {
    // Swap root (max) with last element
    [a[0], a[i]] = [a[i], a[0]];
    pushStep([], [a[0].id, a[i].id]);

    // Heapify reduced heap
    heapify(i, 0);
  }

  // Final step marked done
  steps.push({
    array: a.map(x => ({ ...x })),
    comparing: [],
    swapped: [],
    done: true,
  });

  return steps;
}
