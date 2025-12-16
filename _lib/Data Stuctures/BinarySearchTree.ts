// Function to visualize the binary search tree in terminal
const prettyPrint = <T>(
  node: TreeNode<T> | null,
  prefix: string = "",
  isLeft: boolean = true
): void => {
  if (node === null) return;

  if (node.right) {
    prettyPrint(node.right, `${prefix}${isLeft ? "│   " : "    "}`, false);
  }
  console.log(`${prefix}${isLeft ? "└── " : "┌── "}${node.data}`);
  if (node.left) {
    prettyPrint(node.left, `${prefix}${isLeft ? "    " : "│   "}`, true);
  }
};

// Node class representing each element in the tree
class TreeNode<T> {
  public data: T;
  public left: TreeNode<T> | null;
  public right: TreeNode<T> | null;

  constructor(
    data: T,
    left: TreeNode<T> | null = null,
    right: TreeNode<T> | null = null
  ) {
    this.data = data;
    this.left = left;
    this.right = right;
  }
}

// Binary Search Tree implementation with automatic balancing capabilities
class BinarySearchTree<T> {
  public root: TreeNode<T> | null;
  private inputArray: T[];
  private preOrderData: T[];
  private inOrderData: T[];
  private postOrderData: T[];

  constructor(inputArray?: T[]) {
    if (inputArray && inputArray.length > 0) {
      // Remove duplicates and sort the input array
      this.inputArray = [...removeDuplicates(mergeSort(inputArray))];
      // Build a balanced tree from the sorted array
      this.root = this.buildTree(
        this.inputArray,
        0,
        this.inputArray.length - 1
      );
    } else {
      this.root = null;
      this.inputArray = [];
    }

    // Arrays to store traversal results
    this.preOrderData = [];
    this.inOrderData = [];
    this.postOrderData = [];
  }

  // Recursively builds a balanced binary search tree from a sorted array
  private buildTree(
    inputArray: T[],
    start: number,
    end: number
  ): TreeNode<T> | null {
    if (start > end) return null;

    // Find the middle element to maintain balance
    const mid = Math.floor((start + end) / 2);
    const root = new TreeNode(inputArray[mid]);

    // Recursively build left and right subtrees
    root.left = this.buildTree(inputArray, start, mid - 1);
    root.right = this.buildTree(inputArray, mid + 1, end);

    return root;
  }

  // Inserts a new value into the BST maintaining BST property
  insert(value: T, root: TreeNode<T> | null = this.root): TreeNode<T> {
    // Base case: create new node if we've reached a null position
    if (root === null) {
      const newNode = new TreeNode(value);
      if (this.root === null) this.root = newNode;
      return newNode;
    }

    // Insert in left or right subtree based on value comparison
    if (root.data > value) {
      root.left = this.insert(value, root.left);
    } else if (root.data < value) {
      root.right = this.insert(value, root.right);
    }
    // If value equals root.data, don't insert (avoid duplicates)

    return root;
  }

  // Deletes a value from the BST while maintaining BST property
  // Note: Rebalances tree first to avoid structural issues
  delete(value: T, root: TreeNode<T> | null = this.root): TreeNode<T> | null {
    // Rebalance before deletion to maintain tree structure
    this.rebalance();

    if (root === null) {
      return root;
    }

    // Navigate to the node to delete
    if (root.data > value) {
      root.left = this.delete(value, root.left);
    } else if (root.data < value) {
      root.right = this.delete(value, root.right);
    } else {
      // Found the node to delete

      // Case 1: Node has no left child
      if (root.left === null) {
        return root.right;
      }
      // Case 2: Node has no right child
      else if (root.right === null) {
        return root.left;
      }

      // Case 3: Node has both children
      // Replace with the smallest value in right subtree (inorder successor)
      root.data = this.findMinValue(root.right);
      root.right = this.delete(root.data, root.right);
    }

    return root;
  }

  // Finds the minimum value in a subtree (leftmost node)
  private findMinValue(root: TreeNode<T>): T {
    let current = root;
    while (current.left !== null) {
      current = current.left;
    }
    return current.data;
  }

  // Searches for a value in the BST and returns the node if found
  find(value: T, root: TreeNode<T> | null = this.root): TreeNode<T> | null {
    if (root === null) return null;

    if (root.data === value) return root;

    // Search left or right subtree based on comparison
    if (root.data > value) {
      return this.find(value, root.left);
    } else {
      return this.find(value, root.right);
    }
  }

  // Performs level-order (breadth-first) traversal of the tree
  levelOrder(root: TreeNode<T> | null = this.root): T[] {
    if (root === null) return [];

    const queue: TreeNode<T>[] = [];
    const result: T[] = [];

    queue.push(root);

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current.data);

      // Add children to queue for next level processing
      if (current.left !== null) queue.push(current.left);
      if (current.right !== null) queue.push(current.right);
    }

    return result;
  }

  // Performs in-order traversal (left, root, right) - returns sorted order for BST
  inOrder(root: TreeNode<T> | null = this.root): T[] {
    const result: T[] = [];
    this.inOrderHelper(root, result);
    return result;
  }

  private inOrderHelper(root: TreeNode<T> | null, result: T[]): void {
    if (root) {
      this.inOrderHelper(root.left, result); // Visit left subtree
      result.push(root.data); // Visit root
      this.inOrderHelper(root.right, result); // Visit right subtree
    }
  }

  // Performs pre-order traversal (root, left, right) - useful for tree copying
  preOrder(root: TreeNode<T> | null = this.root): T[] {
    const result: T[] = [];
    this.preOrderHelper(root, result);
    return result;
  }

  private preOrderHelper(root: TreeNode<T> | null, result: T[]): void {
    if (root) {
      result.push(root.data); // Visit root
      this.preOrderHelper(root.left, result); // Visit left subtree
      this.preOrderHelper(root.right, result); // Visit right subtree
    }
  }

  // Performs post-order traversal (left, right, root) - useful for tree deletion
  postOrder(root: TreeNode<T> | null = this.root): T[] {
    const result: T[] = [];
    this.postOrderHelper(root, result);
    return result;
  }

  private postOrderHelper(root: TreeNode<T> | null, result: T[]): void {
    if (root) {
      this.postOrderHelper(root.left, result); // Visit left subtree
      this.postOrderHelper(root.right, result); // Visit right subtree
      result.push(root.data); // Visit root
    }
  }

  // Calculates the height of the tree (longest path from root to leaf)
  height(root: TreeNode<T> | null = this.root): number {
    if (root === null) {
      return -1; // Height of empty tree is -1
    }

    const leftHeight = this.height(root.left);
    const rightHeight = this.height(root.right);

    return Math.max(leftHeight, rightHeight) + 1;
  }

  // Calculates the depth of a specific node (distance from root)
  depth(
    nodeVal: T,
    root: TreeNode<T> | null = this.root,
    edgeCount: number = 0
  ): number | null {
    if (root === null) return null;
    if (root.data === nodeVal) return edgeCount;

    // Search in appropriate subtree and increment edge count
    if (root.data < nodeVal) {
      return this.depth(nodeVal, root.right, edgeCount + 1);
    } else {
      return this.depth(nodeVal, root.left, edgeCount + 1);
    }
  }

  // Checks if the tree is balanced (height difference between subtrees ≤ 1)
  isBalanced(root: TreeNode<T> | null = this.root): boolean {
    if (root === null) return true;

    const leftHeight = this.height(root.left);
    const rightHeight = this.height(root.right);

    return Math.abs(leftHeight - rightHeight) <= 1;
  }

  // Rebalances the tree by rebuilding it from an in-order traversal
  rebalance(): TreeNode<T> | null {
    if (this.isBalanced(this.root)) return this.root;

    // Get all values in sorted order (in-order traversal)
    const sortedValues = this.inOrder(this.root);

    // Rebuild the tree as a balanced BST
    this.root = this.buildTree(sortedValues, 0, sortedValues.length - 1);

    return this.root;
  }

  // Returns the number of nodes in the tree
  size(): number {
    return this.sizeHelper(this.root);
  }

  private sizeHelper(root: TreeNode<T> | null): number {
    if (root === null) return 0;
    return 1 + this.sizeHelper(root.left) + this.sizeHelper(root.right);
  }

  // Checks if the tree is empty
  isEmpty(): boolean {
    return this.root === null;
  }

  // Clears the entire tree
  clear(): void {
    this.root = null;
    this.inputArray = [];
    this.preOrderData = [];
    this.inOrderData = [];
    this.postOrderData = [];
  }

  // Displays the tree structure in console
  display(): void {
    if (this.root === null) {
      console.log("Tree is empty");
      return;
    }
    console.log("Binary Search Tree:");
    prettyPrint<T>(this.root);
  }
}

// Utility function: Merge sort for sorting arrays
function mergeSort<T>(inputArray: T[]): T[] {
  if (inputArray.length <= 1) return inputArray;

  const mid = Math.floor(inputArray.length / 2);
  const left = mergeSort(inputArray.slice(0, mid));
  const right = mergeSort(inputArray.slice(mid));

  return merge(left, right);
}

function merge<T>(left: T[], right: T[]): T[] {
  const result: T[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] <= right[rightIndex]) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }

  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}

// Utility function: Remove duplicates from array
function removeDuplicates<T>(inputArray: T[]): T[] {
  return [...new Set(inputArray)];
}

// Example function to showcase BinarySearchTree functionality
function example(): void {
  console.log("=== Binary Search Tree Demo ===\n");

  const testInputArray = [1, 2, 3, 4, 5, 6, 7];
  const balancedBST = new BinarySearchTree<number>(testInputArray);

  console.log("Initial tree:");
  balancedBST.display();

  console.log("\nInserting 8 and 9...");
  balancedBST.insert(8);
  balancedBST.insert(9);

  console.log("\nTree after insertions:");
  balancedBST.display();

  console.log("\nRebalancing...");
  balancedBST.rebalance();
  balancedBST.display();

  console.log("\nDeleting 6...");
  balancedBST.delete(6);

  console.log("\nFinding node with value 8:", balancedBST.find(8));

  console.log("\nTraversal methods:");
  console.log("Level Order:", balancedBST.levelOrder());
  console.log("In Order:", balancedBST.inOrder());
  console.log("Pre Order:", balancedBST.preOrder());
  console.log("Post Order:", balancedBST.postOrder());

  console.log("\nTree properties:");
  console.log("Tree Height:", balancedBST.height());
  console.log("Tree Depth of 7:", balancedBST.depth(7));
  console.log("Is the tree balanced?", balancedBST.isBalanced());

  console.log("\nDeleting 3...");
  balancedBST.delete(3);

  console.log("Is the tree balanced after deletion?", balancedBST.isBalanced());
  console.log("Rebalancing the tree...");
  balancedBST.rebalance();

  console.log("\nInserting 11 and 12...");
  balancedBST.insert(11);
  balancedBST.insert(12);

  console.log(
    "Is the tree balanced after insertions?",
    balancedBST.isBalanced()
  );
  console.log("Final rebalance...");
  balancedBST.rebalance();

  console.log("\nFinal tree structure:");
  balancedBST.display();
}

export { TreeNode, BinarySearchTree, prettyPrint, example };
