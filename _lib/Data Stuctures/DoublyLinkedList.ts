class DoublyLinkedNode<T> {
  public data: T;
  public next: DoublyLinkedNode<T> | null;
  public prev: DoublyLinkedNode<T> | null;

  constructor(
    data: T,
    next: DoublyLinkedNode<T> | null = null,
    prev: DoublyLinkedNode<T> | null = null
  ) {
    this.data = data;
    this.next = next;
    this.prev = prev;
  }
}

class DoublyLinkedList<T> {
  private head: DoublyLinkedNode<T> | null;
  private tail: DoublyLinkedNode<T> | null;
  private _size: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  // Adds a node at the start of list, the head node
  insertFirst(data: T): void {
    const node = new DoublyLinkedNode(data);

    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this._size++;
  }

  // Adds a node at the end of list, the tail node - now O(1)!
  insertLast(data: T): void {
    const node = new DoublyLinkedNode(data);

    if (this.tail === null) {
      this.head = node;
      this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
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

    const node = new DoublyLinkedNode(data);
    let current: DoublyLinkedNode<T>;

    // Optimize: traverse from closer end
    if (index <= this._size / 2) {
      // Traverse from head
      current = this.head!;
      for (let i = 0; i < index; i++) {
        current = current.next!;
      }
    } else {
      // Traverse from tail
      current = this.tail!;
      for (let i = this._size - 1; i > index; i--) {
        current = current.prev!;
      }
    }

    // Insert node before current
    node.next = current;
    node.prev = current.prev;
    current.prev!.next = node;
    current.prev = node;

    this._size++;
  }

  // Returns data at index
  getAt(index: number): T | null {
    if (index < 0 || index >= this._size) {
      return null;
    }

    let current: DoublyLinkedNode<T>;

    // Optimize: traverse from closer end
    if (index <= this._size / 2) {
      // Traverse from head
      current = this.head!;
      for (let i = 0; i < index; i++) {
        current = current.next!;
      }
    } else {
      // Traverse from tail
      current = this.tail!;
      for (let i = this._size - 1; i > index; i--) {
        current = current.prev!;
      }
    }

    return current.data;
  }

  // Returns data at head entry
  getFirst(): T | null {
    return this.head ? this.head.data : null;
  }

  // Returns data at tail entry - now O(1)!
  getLast(): T | null {
    return this.tail ? this.tail.data : null;
  }

  // Gets data at a random entry
  getRandom(): T | null {
    if (this._size === 0) {
      return null;
    }
    return this.getAt(Math.floor(Math.random() * this._size));
  }

  // Remove node at the given index and returns it
  removeAt(index: number): T | null {
    if (index < 0 || index >= this._size) {
      return null;
    }

    let nodeToRemove: DoublyLinkedNode<T>;

    if (index === 0) {
      nodeToRemove = this.head!;
      this.head = nodeToRemove.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null; // List is now empty
      }
    } else if (index === this._size - 1) {
      nodeToRemove = this.tail!;
      this.tail = nodeToRemove.prev;
      if (this.tail) {
        this.tail.next = null;
      } else {
        this.head = null; // List is now empty
      }
    } else {
      // Find node to remove (optimize by traversing from closer end)
      if (index <= this._size / 2) {
        nodeToRemove = this.head!;
        for (let i = 0; i < index; i++) {
          nodeToRemove = nodeToRemove.next!;
        }
      } else {
        nodeToRemove = this.tail!;
        for (let i = this._size - 1; i > index; i--) {
          nodeToRemove = nodeToRemove.prev!;
        }
      }

      // Update pointers to bypass the node
      nodeToRemove.prev!.next = nodeToRemove.next;
      nodeToRemove.next!.prev = nodeToRemove.prev;
    }

    this._size--;
    return nodeToRemove.data;
  }

  // Removes the head node and returns it
  removeFirst(): T | null {
    return this.removeAt(0);
  }

  // Removes the tail node and returns it - now O(1)!
  removeLast(): T | null {
    return this.removeAt(this._size - 1);
  }

  // Removes a random node from the list
  removeRandom(): T | null {
    if (this._size === 0) {
      return null;
    }
    return this.removeAt(Math.floor(Math.random() * this._size));
  }

  // Returns true if the list has the given value, returns false otherwise
  contains(value: T): boolean {
    let current = this.head;

    while (current) {
      if (current.data === value) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Returns the index of the first appearance of the given value, returns null otherwise
  find(value: T): number | null {
    let current = this.head;
    let count = 0;

    while (current) {
      if (current.data === value) {
        return count;
      }
      current = current.next;
      count++;
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
    const result: T[] = [];
    let current = this.head;

    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  // Convert list to array (reverse direction)
  toArrayReverse(): T[] {
    const result: T[] = [];
    let current = this.tail;

    while (current) {
      result.push(current.data);
      current = current.prev;
    }
    return result;
  }

  // Prints list data to console
  toString(): string {
    let current = this.head;
    let str = "";

    while (current) {
      str += current.data + " ↔ ";
      current = current.next;
    }
    str += "null";

    return str;
  }

  // Create iterator for for...of loops (forward)
  *[Symbol.iterator](): Iterator<T> {
    let current = this.head;
    while (current) {
      yield current.data;
      current = current.next;
    }
  }

  // Create reverse iterator
  *reverseIterator(): Iterator<T> {
    let current = this.tail;
    while (current) {
      yield current.data;
      current = current.prev;
    }
  }

  // Reverse the linked list
  reverse(): void {
    let current = this.head;

    // Swap head and tail
    [this.head, this.tail] = [this.tail, this.head];

    // Swap next and prev for each node
    while (current) {
      [current.next, current.prev] = [current.prev, current.next];
      current = current.prev; // Note: this was originally 'next'
    }
  }

  // Create a copy of the linked list
  clone(): DoublyLinkedList<T> {
    const newList = new DoublyLinkedList<T>();
    let current = this.head;

    while (current) {
      newList.insertLast(current.data);
      current = current.next;
    }

    return newList;
  }
}

export { DoublyLinkedNode, DoublyLinkedList };
