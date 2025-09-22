// src/algorithms/dataStructures/bst.js
let nodeIdCounter = 0;

export function resetNodeIdCounter() {
  nodeIdCounter = 0;
}

export class BSTNode {
  constructor(value) {
    this.id = nodeIdCounter++;
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

/**
 * Inserts a value into a BST and returns steps for visualization
 */
export function bstInsertSteps(root, value) {
  const steps = [];

  function insert(node, value) {
    if (!node) {
      const newNode = new BSTNode(value);
      steps.push({
        root: cloneTree(root),
        action: "insert",
        message: `Inserted ${value} as a new node`,
        highlighted: [newNode.id],
      });
      return newNode;
    }

    steps.push({
      root: cloneTree(root),
      action: "compare",
      message: `Comparing ${value} with ${node.value}`,
      highlighted: [node.id],
    });

    if (value < node.value) {
      node.left = insert(node.left, value);
    } else {
      node.right = insert(node.right, value);
    }
    return node;
  }

  const newRoot = insert(root, value);
  steps.push({ root: cloneTree(newRoot), action: "done", message: "Insertion complete", highlighted: [] });
  return { root: newRoot, steps };
}

/**
 * Deletes a value from a BST and returns steps for visualization
 */
export function bstDeleteSteps(root, value) {
  const steps = [];

  function findMin(node) {
    while (node.left) node = node.left;
    return node;
  }

  function remove(node, value) {
    if (!node) return null;

    steps.push({
      root: cloneTree(root),
      action: "compare",
      message: `Comparing ${value} with ${node.value}`,
      highlighted: [node.id],
    });

    if (value < node.value) {
      node.left = remove(node.left, value);
    } else if (value > node.value) {
      node.right = remove(node.right, value);
    } else {
      // node to delete found
      steps.push({
        root: cloneTree(root),
        action: "delete",
        message: `Deleting node ${node.value}`,
        highlighted: [node.id],
      });

      // case 1: no child
      if (!node.left && !node.right) {
        return null;
      }
      // case 2: one child
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // case 3: two children -> replace with inorder successor
      const minNode = findMin(node.right);
      steps.push({
        root: cloneTree(root),
        action: "replace",
        message: `Replacing ${node.value} with inorder successor ${minNode.value}`,
        highlighted: [node.id, minNode.id],
      });
      node.value = minNode.value;
      node.right = remove(node.right, minNode.value);
    }
    return node;
  }

  const newRoot = remove(root, value);
  steps.push({ root: cloneTree(newRoot), action: "done", message: "Deletion complete", highlighted: [] });
  return { root: newRoot, steps };
}

/**
 * Searches a value in a BST and returns steps for visualization
 */
export function bstSearchSteps(root, value) {
  const steps = [];

  function search(node, value) {
    if (!node) {
      steps.push({
        root: cloneTree(root),
        action: "not_found",
        message: `${value} not found in tree`,
        highlighted: [],
      });
      return null;
    }

    steps.push({
      root: cloneTree(root),
      action: "compare",
      message: `Comparing ${value} with ${node.value}`,
      highlighted: [node.id],
    });

    if (value === node.value) {
      steps.push({
        root: cloneTree(root),
        action: "found",
        message: `Found ${value}!`,
        highlighted: [node.id],
      });
      return node;
    }

    if (value < node.value) {
      return search(node.left, value);
    } else {
      return search(node.right, value);
    }
  }

  search(root, value);
  steps.push({ root: cloneTree(root), action: "done", message: "Search complete", highlighted: [] });
  return { steps };
}

/**
 * Deep clones a BST (preserves node IDs)
 */
function cloneTree(node) {
  if (!node) return null;
  const newNode = new BSTNode(node.value);
  newNode.id = node.id; // preserve ID
  newNode.left = cloneTree(node.left);
  newNode.right = cloneTree(node.right);
  return newNode;
}
