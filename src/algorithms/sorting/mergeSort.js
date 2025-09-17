// src/algorithms/sorting/mergeSort.js
// Emits step-by-step snapshots for Merge Sort with lazy node creation
// so that the recursion tree grows as the algorithm unfolds.

// Named export + default export at bottom so either import style works.

export function mergeSortSteps(inputArr = []) {
  const steps = [];

  // normalize values (accept number | {value} | string)
  const toVal = (v) =>
    typeof v === "number" ? v : v && typeof v.value === "number" ? v.value : Number(v) || 0;

  const items = (inputArr || []).map((v, idx) => ({
    id: idx,
    value: toVal(v),
  }));

  // if no items, return a single done step (safe)
  if (items.length === 0) {
    const doneStep = { tree: null, action: { type: "done" }, type: "done", done: true };
    steps.push(doneStep);
    return steps;
  }

  // Utility: deep snapshot of the tree
  const snapshot = (node) => {
    if (!node) return null;
    return {
      id: node.id,
      leftIndex: node.leftIndex,
      rightIndex: node.rightIndex,
      array: (node.array || []).map((x) => ({ ...x })),
      merged: !!node.merged,
      left: snapshot(node.left),
      right: snapshot(node.right),
    };
  };

  // pushStep: builds step with a nested `action` object and also spreads
  // action props at the root (for backward compatibility).
  const pushStep = (root, action = {}) => {
    const actionObj = Object.keys(action).length ? action : { type: "idle" };
    const stepObj = {
      tree: snapshot(root),
      action: actionObj,
      // also include fields at top-level to support older consumers
      ...actionObj,
    };
    if (actionObj.type === "done") stepObj.done = true;
    steps.push(stepObj);
  };

  // create node lazily
  const createNode = (left, right, arr) => ({
    id: `${left}-${right}`,
    leftIndex: left,
    rightIndex: right,
    array: arr.slice(left, right + 1).map((x) => ({ ...x })),
    left: null,
    right: null,
    merged: false,
  });

  // merge routine: emits compare & place steps
  const merge = (rootNode, node, arr, left, mid, right) => {
    const n1 = mid - left + 1;
    const n2 = right - mid;

    const L = [];
    const R = [];
    for (let i = 0; i < n1; i++) L.push({ ...arr[left + i] });
    for (let j = 0; j < n2; j++) R.push({ ...arr[mid + 1 + j] });

    let i = 0,
      j = 0,
      k = left;

    while (i < n1 && j < n2) {
      // comparison step
      pushStep(rootNode, {
        type: "compare",
        indices: [L[i].id, R[j].id],
        nodeId: node.id,
      });

      // pick smaller (stable: <=)
      const chosen = L[i].value <= R[j].value ? L[i] : R[j];
      const chosenFrom = chosen === L[i] ? (node.left ? node.left.id : null) : (node.right ? node.right.id : null);

      arr[k] = { ...chosen };

      // update node's visible array slice
      node.array = arr.slice(node.leftIndex, node.rightIndex + 1).map((x) => ({ ...x }));

      // place step (drives floating animation)
      pushStep(rootNode, {
        type: "place",
        id: chosen.id,
        nodeId: node.id,
        fromNodeId: chosenFrom,
        targetIndex: k - left,
      });

      if (chosen === L[i]) i++;
      else j++;
      k++;
    }

    // leftover from L
    while (i < n1) {
      const chosen = { ...L[i] };
      arr[k] = chosen;
      node.array = arr.slice(node.leftIndex, node.rightIndex + 1).map((x) => ({ ...x }));

      pushStep(rootNode, {
        type: "place",
        id: chosen.id,
        nodeId: node.id,
        fromNodeId: node.left ? node.left.id : null,
        targetIndex: k - left,
      });

      i++;
      k++;
    }

    // leftover from R
    while (j < n2) {
      const chosen = { ...R[j] };
      arr[k] = chosen;
      node.array = arr.slice(node.leftIndex, node.rightIndex + 1).map((x) => ({ ...x }));

      pushStep(rootNode, {
        type: "place",
        id: chosen.id,
        nodeId: node.id,
        fromNodeId: node.right ? node.right.id : null,
        targetIndex: k - left,
      });

      j++;
      k++;
    }
  };

  // recursive merge sort (with lazy creation of children)
  const mergeSortRecursive = (rootNode, node, sourceArr, left, right) => {
    if (left >= right) {
      pushStep(rootNode, { type: "leaf", nodeId: node.id });
      return;
    }

    const mid = Math.floor((left + right) / 2);

    // create children lazily when we split
    node.left = createNode(left, mid, sourceArr);
    node.right = createNode(mid + 1, right, sourceArr);

    pushStep(rootNode, { type: "split", nodeId: node.id, left, mid, right });

    mergeSortRecursive(rootNode, node.left, sourceArr, left, mid);
    mergeSortRecursive(rootNode, node.right, sourceArr, mid + 1, right);

    merge(rootNode, node, sourceArr, left, mid, right);

    node.merged = true;
    pushStep(rootNode, { type: "merged", nodeId: node.id, left, mid, right });
  };

  // kickoff
  const root = createNode(0, items.length - 1, items);
  pushStep(root, { type: "start" });
  mergeSortRecursive(root, root, items, 0, items.length - 1);
  pushStep(root, { type: "done" });

  return steps;
}

// exports: named + default
export default mergeSortSteps;
