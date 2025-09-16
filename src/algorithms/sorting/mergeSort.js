// src/algorithms/sorting/mergeSort.js
// Generates fine-grained steps for Merge Sort tree visualization.
// Steps include actions: start, split, compare, place, merged, leaf, done
export function mergeSortSteps(inputArray) {
  const items = (inputArray || []).map((v, idx) => ({
    id: idx,
    value: typeof v === "number" ? v : Number(v) || 0,
  }));

  const steps = [];

  // create a node representing array slice [left..right]
  const createNode = (left, right, arr) => ({
    id: `${left}-${right}`,
    leftIndex: left,
    rightIndex: right,
    array: arr.slice(left, right + 1).map((x) => ({ ...x })),
    left: null,
    right: null,
  });

  const cloneNode = (node) => {
    if (!node) return null;
    return {
      id: node.id,
      leftIndex: node.leftIndex,
      rightIndex: node.rightIndex,
      array: node.array.map((x) => ({ ...x })),
      left: cloneNode(node.left),
      right: cloneNode(node.right),
    };
  };

  // safe pushStep (always include an action object)
  const pushStep = (rootNode, action = { type: "idle" }) => {
    steps.push({
      tree: cloneNode(rootNode),
      action: action || { type: "idle" },
    });
  };

  // merge for [left..mid] and [mid+1..right], emitting compare/place actions
  const merge = (node, sourceArr, left, mid, right) => {
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
      // show compare of the two head elements (include parent node for context)
      pushStep(node, { type: "compare", nodeId: node.id, indices: [L[i].id, R[j].id] });

      if (L[i].value <= R[j].value) {
        sourceArr[k] = { ...L[i] };
        // place action includes item id, parent node id, source node id and target index within parent
        pushStep(node, {
          type: "place",
          id: L[i].id,
          nodeId: node.id,
          fromNodeId: node.left ? node.left.id : null,
          targetIndex: k - left,
        });
        i++;
      } else {
        sourceArr[k] = { ...R[j] };
        pushStep(node, {
          type: "place",
          id: R[j].id,
          nodeId: node.id,
          fromNodeId: node.right ? node.right.id : null,
          targetIndex: k - left,
        });
        j++;
      }
      k++;
      // update parent node slice so snapshot shows partial merged state
      node.array = sourceArr.slice(left, right + 1).map((x) => ({ ...x }));
    }

    while (i < n1) {
      sourceArr[k] = { ...L[i] };
      pushStep(node, {
        type: "place",
        id: L[i].id,
        nodeId: node.id,
        fromNodeId: node.left ? node.left.id : null,
        targetIndex: k - left,
      });
      i++;
      k++;
      node.array = sourceArr.slice(left, right + 1).map((x) => ({ ...x }));
    }

    while (j < n2) {
      sourceArr[k] = { ...R[j] };
      pushStep(node, {
        type: "place",
        id: R[j].id,
        nodeId: node.id,
        fromNodeId: node.right ? node.right.id : null,
        targetIndex: k - left,
      });
      j++;
      k++;
      node.array = sourceArr.slice(left, right + 1).map((x) => ({ ...x }));
    }
  };

  // recursive build + emits
  const mergeSortRecursive = (node, sourceArr, left, right) => {
    if (left >= right) {
      // base single-element snapshot
      pushStep(node, { type: "leaf", nodeId: node.id });
      return;
    }

    const mid = Math.floor((left + right) / 2);

    node.left = createNode(left, mid, sourceArr);
    node.right = createNode(mid + 1, right, sourceArr);

    // snapshot showing split
    pushStep(node, { type: "split", nodeId: node.id, left, mid, right });

    mergeSortRecursive(node.left, sourceArr, left, mid);
    mergeSortRecursive(node.right, sourceArr, mid + 1, right);

    // merge with animated steps
    merge(node, sourceArr, left, mid, right);

    // collapse children into parent array
    node.left = null;
    node.right = null;
    node.array = sourceArr.slice(left, right + 1).map((x) => ({ ...x }));
    pushStep(node, { type: "merged", nodeId: node.id, left, mid, right });
  };

  // root and run
  const root = createNode(0, items.length - 1, items);
  pushStep(root, { type: "start" });
  mergeSortRecursive(root, items, 0, items.length - 1);
  pushStep(root, { type: "done" });

  return steps;
}
