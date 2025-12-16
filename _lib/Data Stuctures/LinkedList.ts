class Node<T> {
  public data: T;
  public next: Node<T> | null;

  constructor(data: T, next: Node<T> | null = null) {
    this.data = data;
    this.next = next;
  }
}

class LinkedList<T> {
  private head: Node<T> | null;
  private _size: number;

  constructor() {
    this.head = null;
    this._size = 0;
  }

  // Adds a node at the start of list, the head node
  insertFirst(data: T): void {
    this.head = new Node(data, this.head);
    this._size++;
  }

  // Adds a node at the end of list, the tail node
  insertLast(data: T): void {
    const node = new Node(data);

    // if empty, make head
    if (this.head === null) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    this._size++;
  }

  // Adds a node at the given index
  insertAt(data: T, index: number): void {
    //  If index is out of range
    if (index < 0 || index > this._size) {
      throw new Error(
        `Index ${index} is out of bounds. Valid range: 0 to ${this._size}`
      );
    }

    // If first index
    if (index === 0) {
      this.insertFirst(data);
      return;
    }

    const node = new Node(data);
    let current = this.head!;
    let previous: Node<T>;

    let count = 0;
    while (count < index) {
      previous = current; // Node before index
      count++;
      current = current.next!; // Node after index
    }

    node.next = current;
    previous!.next = node;

    this._size++;
  }

  // Returns data at index
  getAt(index: number): T | null {
    if (index < 0 || index >= this._size) {
      return null;
    }

    let current = this.head;
    let count = 0;

    while (current) {
      if (count === index) {
        return current.data;
      }
      count++;
      current = current.next;
    }
    return null;
  }

  // Returns data at head entry
  getFirst(): T | null {
    return this.getAt(0);
  }

  // Returns data at tail entry
  getLast(): T | null {
    return this.getAt(this._size - 1);
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

    let current = this.head!;
    let previous: Node<T>;

    // Remove first
    if (index === 0) {
      this.head = current.next;
    } else {
      let count = 0;
      while (count < index) {
        count++;
        previous = current;
        current = current.next!;
      }
      previous!.next = current.next;
    }

    this._size--;
    return current.data;
  }

  //  Removes the head node and returns it
  removeFirst(): T | null {
    return this.removeAt(0);
  }

  //  Removes the tail node and returns it
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

  //  Returns true if the list has the given value, returns false otherwise
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

  //  Returns the index of the first appearance of the given value, returns null otherwise
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

  // Prints list data to console
  toString(): string {
    let current = this.head;
    let str = "";

    while (current) {
      str += current.data + " -> ";
      current = current.next;
    }
    str += "null";

    return str;
  }

  // Create iterator for for...of loops
  *[Symbol.iterator](): Iterator<T> {
    let current = this.head;
    while (current) {
      yield current.data;
      current = current.next;
    }
  }

  // Reverse the linked list
  reverse(): void {
    let previous: Node<T> | null = null;
    let current = this.head;
    let next: Node<T> | null;

    while (current) {
      next = current.next;
      current.next = previous;
      previous = current;
      current = next;
    }

    this.head = previous;
  }

  // Create a copy of the linked list
  clone(): LinkedList<T> {
    const newList = new LinkedList<T>();
    let current = this.head;

    while (current) {
      newList.insertLast(current.data);
      current = current.next;
    }

    return newList;
  }
}

export { Node, LinkedList };
