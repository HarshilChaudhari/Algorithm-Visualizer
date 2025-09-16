// src/algorithms/sorting/mergeSort.js
// Generates steps for Merge Sort visualization with a persistent recursion tree.
// All nodes are created upfront and remain visible throughout the animation.

export function mergeSortSteps(inputArray) {
  const items = (inputArray || []).map((v, idx) => ({
    id: idx,
    value: typeof v === "number" ? v : Number(v) || 0,
  }));

  const steps = [];

  // Create a node for array slice [left..right]
  const createNode = (left, right, arr) => ({
    id: `${left}-${right}`,
    leftIndex: left,
    rightIndex: right,
    array: arr.slice(left, right + 1).map((x) => ({ ...x })),
    left: null,
    right: null,
    merged: false,
  });

  // Recursively build full tree (persistent)
  const buildTree = (arr, left, right) => {
    const node = createNode(left, right, arr);
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      node.left = buildTree(arr, left, mid);
      node.right = buildTree(arr, mid + 1, right);
    }
    return node;
  };

  // Deep clone node for snapshot (so steps are immutable)
  const cloneNode = (node) => {
    if (!node) return null;
    return {
      id: node.id,
      leftIndex: node.leftIndex,
      rightIndex: node.rightIndex,
      array: node.array.map((x) => ({ ...x })),
      merged: node.merged,
      left: cloneNode(node.left),
      right: cloneNode(node.right),
    };
  };

  // Safe push step
  const pushStep = (rootNode, action = { type: "idle" }) => {
    steps.push({
      tree: cloneNode(rootNode),
      action: action || { type: "idle" },
    });
  };

  // Merge with compare/place actions
  const merge = (rootNode, node, sourceArr, left, mid, right) => {
    const n1 = mid - left + 1;
    const n2 = right - mid;

    const L = [];
    const R = [];
    for (let i = 0; i < n1; i++) L.push({ ...sourceArr[left + i] });
    for (let j = 0; j < n2; j++) R.push({ ...sourceArr[mid + 1 + j] });

    let i = 0,
      j = 0,
      k = left;

    while (i < n1 && j < n2) {
      pushStep(rootNode, {
        type: "compare",
        nodeId: node.id,
        indices: [L[i].id, R[j].id],
      });

      if (L[i].value <= R[j].value) {
        sourceArr[k] = { ...L[i] };
        node.array[k - left] = { ...L[i] };
        pushStep(rootNode, {
          type: "place",
          id: L[i].id,
          nodeId: node.id,
          fromNodeId: node.left ? node.left.id : null,
          targetIndex: k - left,
        });
        i++;
      } else {
        sourceArr[k] = { ...R[j] };
        node.array[k - left] = { ...R[j] };
        pushStep(rootNode, {
          type: "place",
          id: R[j].id,
          nodeId: node.id,
          fromNodeId: node.right ? node.right.id : null,
          targetIndex: k - left,
        });
        j++;
      }
      k++;
    }

    while (i < n1) {
      sourceArr[k] = { ...L[i] };
      node.array[k - left] = { ...L[i] };
      pushStep(rootNode, {
        type: "place",
        id: L[i].id,
        nodeId: node.id,
        fromNodeId: node.left ? node.left.id : null,
        targetIndex: k - left,
      });
      i++;
      k++;
    }

    while (j < n2) {
      sourceArr[k] = { ...R[j] };
      node.array[k - left] = { ...R[j] };
      pushStep(rootNode, {
        type: "place",
        id: R[j].id,
        nodeId: node.id,
        fromNodeId: node.right ? node.right.id : null,
        targetIndex: k - left,
      });
      j++;
      k++;
    }
  };

  // Recursive merge sort on persistent tree
  const mergeSortRecursive = (rootNode, node, sourceArr, left, right) => {
    if (left >= right) {
      pushStep(rootNode, { type: "leaf", nodeId: node.id });
      return;
    }

    const mid = Math.floor((left + right) / 2);

    pushStep(rootNode, { type: "split", nodeId: node.id, left, mid, right });

    mergeSortRecursive(rootNode, node.left, sourceArr, left, mid);
    mergeSortRecursive(rootNode, node.right, sourceArr, mid + 1, right);

    merge(rootNode, node, sourceArr, left, mid, right);

    node.merged = true;
    pushStep(rootNode, { type: "merged", nodeId: node.id, left, mid, right });
  };

  // Build persistent root
  const root = buildTree(items, 0, items.length - 1);

  pushStep(root, { type: "start" });
  mergeSortRecursive(root, root, items, 0, items.length - 1);
  pushStep(root, { type: "done" });

  return steps;
}
