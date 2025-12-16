class CircularNode<T> {
  public data: T;
  public next: CircularNode<T> | null;

  constructor(data: T, next: CircularNode<T> | null = null) {
    this.data = data;
    this.next = next;
  }
}

class CircularLinkedList<T> {
  private head: CircularNode<T> | null;
  private tail: CircularNode<T> | null;
  private _size: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  // Adds a node at the start of list, the head node
  insertFirst(data: T): void {
    const node = new CircularNode(data);

    if (this.head === null) {
      // First node - points to itself
      this.head = node;
      this.tail = node;
      node.next = node;
    } else {
      // Insert at head, maintain circle
      node.next = this.head;
      this.head = node;
      this.tail!.next = this.head; // Keep tail pointing to new head
    }
    this._size++;
  }

  // Adds a node at the end of list, the tail node
  insertLast(data: T): void {
    const node = new CircularNode(data);

    if (this.tail === null) {
      // First node - points to itself
      this.head = node;
      this.tail = node;
      node.next = node;
    } else {
      // Insert at tail, maintain circle
      node.next = this.head;
      this.tail!.next = node;
      this.tail = node;
    }
    this._size++;
  }

  // Adds a node at the given index
  insertAt(data: T, index: number): void {
    if (index < 0 || index > this._size) {
      throw new Error(
        `Index ${index} is out of bounds. Valid range: 0 to ${this._size}`
      );
    }

    if (index === 0) {
      this.insertFirst(data);
      return;
    }

    if (index === this._size) {
      this.insertLast(data);
      return;
    }

    const node = new CircularNode(data);
    let current = this.head!;
    let previous: CircularNode<T>;

    for (let i = 0; i < index; i++) {
      previous = current;
      current = current.next!;
    }

    node.next = current;
    previous!.next = node;
    this._size++;
  }

  // Returns data at index
  getAt(index: number): T | null {
    if (index < 0 || index >= this._size || this._size === 0) {
      return null;
    }

    let current = this.head!;
    for (let i = 0; i < index; i++) {
      current = current.next!;
    }
    return current.data;
  }

  // Returns data at head entry
  getFirst(): T | null {
    return this.head ? this.head.data : null;
  }

  // Returns data at tail entry
  getLast(): T | null {
    return this.tail ? this.tail.data : null;
  }

  // Remove node at the given index and returns it
  removeAt(index: number): T | null {
    if (index < 0 || index >= this._size || this._size === 0) {
      return null;
    }

    let nodeToRemove: CircularNode<T>;

    if (this._size === 1) {
      // Removing the only node - break the circle
      nodeToRemove = this.head!;
      this.head = null;
      this.tail = null;
    } else if (index === 0) {
      // Remove head
      nodeToRemove = this.head!;
      this.head = nodeToRemove.next;
      this.tail!.next = this.head; // Maintain circle
    } else {
      // Find node to remove
      let current = this.head!;
      let previous: CircularNode<T>;

      for (let i = 0; i < index; i++) {
        previous = current;
        current = current.next!;
      }

      nodeToRemove = current;
      previous!.next = current.next;

      // Update tail if we removed the tail node
      if (current === this.tail) {
        this.tail = previous!;
        this.tail.next = this.head; // Maintain circle
      }
    }

    this._size--;
    return nodeToRemove.data;
  }

  // Removes the head node and returns it
  removeFirst(): T | null {
    return this.removeAt(0);
  }

  // Removes the tail node and returns it
  removeLast(): T | null {
    return this.removeAt(this._size - 1);
  }

  // Returns true if the list has the given value, returns false otherwise
  contains(value: T): boolean {
    if (this._size === 0) return false;

    let current = this.head!;
    for (let i = 0; i < this._size; i++) {
      if (current.data === value) {
        return true;
      }
      current = current.next!;
    }
    return false;
  }

  // Returns the index of the first appearance of the given value, returns null otherwise
  find(value: T): number | null {
    if (this._size === 0) return null;

    let current = this.head!;
    for (let i = 0; i < this._size; i++) {
      if (current.data === value) {
        return i;
      }
      current = current.next!;
    }
    return null;
  }

  // Returns the size of the list
  get size(): number {
    return this._size;
  }

  // Check if list is empty
  isEmpty(): boolean {
    return this._size === 0;
  }

  // Clear list
  clear(): void {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  // Convert list to array
  toArray(): T[] {
    if (this._size === 0) return [];

    const result: T[] = [];
    let current = this.head!;

    for (let i = 0; i < this._size; i++) {
      result.push(current.data);
      current = current.next!;
    }
    return result;
  }

  // Prints list data to console
  toString(): string {
    if (this._size === 0) return "CircularList: (empty)";

    let current = this.head!;
    let str = "";

    for (let i = 0; i < this._size; i++) {
      str += current.data;
      if (i < this._size - 1) str += " → ";
      current = current.next!;
    }
    str += " ↻"; // Show it's circular
    return str;
  }

  // Create iterator for for...of loops
  *[Symbol.iterator](): Iterator<T> {
    if (this._size === 0) return;

    let current = this.head!;
    for (let i = 0; i < this._size; i++) {
      yield current.data;
      current = current.next!;
    }
  }

  // Rotate forward by one position (useful for round-robin)
  rotateForward(): void {
    if (this._size <= 1) return;
    this.head = this.head!.next;
    this.tail = this.tail!.next;
  }

  // Rotate backward by one position
  rotateBackward(): void {
    if (this._size <= 1) return;

    let current = this.head!;
    // Rotates around the last node
    for (let i = 0; i < this._size - 1; i++) {
      current = current.next!;
    }

    // current is now the node before head (the last node)
    this.tail = this.head; // Old head becomes new tail
    this.head = current; // Last node becomes new head
  }

  // Rotate to put a specific value at the head
  rotateTo(value: T): boolean {
    const index = this.find(value);
    if (index === null) return false;

    for (let i = 0; i < index; i++) {
      this.rotateForward();
    }
    return true;
  }

  // Create a copy of the circular linked list
  clone(): CircularLinkedList<T> {
    const newList = new CircularLinkedList<T>();

    if (this._size === 0) return newList;

    let current = this.head!;
    for (let i = 0; i < this._size; i++) {
      newList.insertLast(current.data);
      current = current.next!;
    }

    return newList;
  }
}

export { CircularNode, CircularLinkedList };
