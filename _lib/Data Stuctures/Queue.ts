class Queue<T> {
  private elements: { [key: number]: T };
  private head: number;
  private tail: number;

  constructor() {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
  }

  // Add element to the back of the queue
  enqueue(element: T): void {
    this.elements[this.tail] = element;
    this.tail++;
  }

  // Remove and return element from the front of the queue
  dequeue(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }

    const item = this.elements[this.head];
    delete this.elements[this.head];
    this.head++;

    // Reset pointers when queue becomes empty to prevent memory drift
    if (this.head === this.tail) {
      this.head = 0;
      this.tail = 0;
    }

    return item;
  }

  // Look at the front element without removing it
  peek(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    return this.elements[this.head];
  }

  // Look at the back element without removing it
  peekBack(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    return this.elements[this.tail - 1];
  }

  // Get the number of elements in the queue
  get length(): number {
    return this.tail - this.head;
  }

  // Check if the queue is empty
  get isEmpty(): boolean {
    return this.length === 0;
  }

  // Get the size (alias for length)
  get size(): number {
    return this.length;
  }

  // Clear all elements from the queue
  clear(): void {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
  }

  // Convert queue to array (preserves order: front to back)
  toArray(): T[] {
    const result: T[] = [];
    for (let i = this.head; i < this.tail; i++) {
      result.push(this.elements[i]);
    }
    return result;
  }

  // Check if queue contains a specific element
  contains(element: T): boolean {
    for (let i = this.head; i < this.tail; i++) {
      if (this.elements[i] === element) {
        return true;
      }
    }
    return false;
  }

  // Create an iterator for for...of loops
  *[Symbol.iterator](): Iterator<T> {
    for (let i = this.head; i < this.tail; i++) {
      yield this.elements[i];
    }
  }

  // Create a copy of the queue
  clone(): Queue<T> {
    const newQueue = new Queue<T>();
    newQueue.elements = { ...this.elements };
    newQueue.head = this.head;
    newQueue.tail = this.tail;
    return newQueue;
  }

  // Convert to string representation
  toString(): string {
    const elements = this.toArray();
    return `Queue(${elements.length}): [${elements.join(", ")}]`;
  }

  // Create queue from array
  static fromArray<T>(array: T[]): Queue<T> {
    const queue = new Queue<T>();
    for (const item of array) {
      queue.enqueue(item);
    }
    return queue;
  }

  // Drain the queue (remove all elements and return them as array)
  drain(): T[] {
    const result = this.toArray();
    this.clear();
    return result;
  }
}

export default Queue;
