/*
 *   A collection of setState helper functions for arrays and objects
 *
 *   Common params
 *   setState - takes the setState dispatch function as an argument and executes it
 *   item - an item in an array of any type
 *   index - the index of interest in the array
 *   updates - either just takes an object with updates || an object containing the index of an array and another object with updates
 * */

// Pushes an item onto an array
export function push<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  item: T
) {
  setState((prev) => [...prev, item]);
}

// Pops an item from an array and returns it
export function pop<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>
): T | undefined {
  let item: T | undefined;
  setState((prev) => {
    item = prev[prev.length - 1];
    return prev.slice(0, -1);
  });
  return item;
}

// Inserts an item into an array at a chosen index
// Will still insert the item at a valid index if its out of bounds
// Returns the index the item got inserted at
export function insertItem<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  item: T,
  index: number
): number {
  let safeIndex = 0;
  setState((prev) => {
    safeIndex = Math.max(0, Math.min(index, prev.length));
    return [...prev.slice(0, safeIndex), item, ...prev.slice(safeIndex)];
  });
  return safeIndex;
}

// Removes an item from an array at a chosen index and returns it
export function removeItem<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  index: number
): T | undefined {
  let item: T | undefined;
  setState((prev) => {
    // Checks if index is valid
    if (index < 0 || index >= prev.length) {
      return prev; // State will be unchanged
    }
    item = prev[index];
    return [...prev.slice(0, index), ...prev.slice(index + 1)];
  });
  return item;
}

// Moves an item in an array to another position
// Will still insert the item at a valid index if endIndex is out-of-bounds
// Returns the index the item got moved to if successful, -1 if unsuccesful
export function moveItem<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  startIndex: number,
  endIndex: number
): number {
  let safeIndex = -1;
  setState((prev) => {
    // Checks if index is valid
    if (startIndex < 0 || startIndex >= prev.length) {
      return prev; // State will be unchanged
    }
    const item = prev[startIndex];
    const arr = [...prev.slice(0, startIndex), ...prev.slice(startIndex + 1)];
    safeIndex = Math.max(0, Math.min(endIndex, arr.length));
    return [...arr.slice(0, safeIndex), item, ...arr.slice(safeIndex)];
  });
  return safeIndex;
}

// Swaps two items in an array if both index values are valid
// Returns true if successful
export function swapItems<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  lowIndex: number,
  highIndex: number
): boolean {
  let result = true;
  setState((prev) => {
    // Checks if indexes are valid
    if (
      lowIndex < 0 ||
      highIndex < 0 ||
      lowIndex >= prev.length ||
      highIndex >= prev.length
    ) {
      result = false;
      return prev; // State will be unchanged
    }
    const arr = { ...prev };
    arr[lowIndex] = prev[highIndex];
    arr[highIndex] = prev[lowIndex];
    return arr;
  });
  return result;
}

// Updates a single field in an object
export function updateField<T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  key: keyof T,
  value: any
) {
  setState((prev) => ({
    ...prev,
    [key]: value,
  }));
}

// Updates an object completely
export function updateObject<T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  updates: Partial<T>
) {
  setState((prev) => ({
    ...prev,
    ...updates,
  }));
}

// Updates an object in an array
export function updateObjectArr<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  index: number,
  updates: Partial<T>
) {
  setState((prev) => {
    return prev.map((object, i) => {
      if (i === index) {
        return {
          ...object,
          ...updates,
        };
      }
      return object;
    });
  });
}

// Updates multiple objects in an array
export function updateObjectsArr<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  changes: Array<{
    index: number;
    updates: Partial<T>;
  }>
) {
  setState((prev) => {
    return prev.map((object, i) => {
      const change = changes.find((change) => change.index === i);
      if (change) {
        return {
          ...object,
          ...change.updates,
        };
      }
      return object;
    });
  });
}

// Updates objects in an array if they meet a condition
// Returns the updated items
// ex.  updateByCondition(setWeather, weather => weather.temperature < 32, {status: snowing})
export function updateByCondition<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  condition: (item: T) => boolean,
  updates: Partial<T>
): T[] {
  const updatedItems: T[] = [];
  setState((prev) => {
    return prev.map((item) => {
      if (condition(item)) {
        const updatedItem = {
          ...item,
          ...updates,
        };
        updatedItems.push(updatedItem);
        return updatedItem;
      }
      return item;
    });
  });
  return updatedItems;
}

// Removes objects in an array if they meet a condition
// Returns the removed items
// ex.  removeByCondition(setCities, city => city.population < 50000 && city.state !== "New York")
export function removeByCondition<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  condition: (item: T) => boolean
): T[] {
  const removedItems: T[] = [];
  setState((prev) => {
    return prev.filter((item) => {
      if (condition(item)) {
        removedItems.push(item);
        return false;
      }
      return true;
    });
  });
  return removedItems;
}

// Toggles a boolean field for all objects in an array
export function toggleArray<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  field: keyof T
): void {
  setState((prev) => {
    return prev.map((item) => {
      if (typeof item[field] === "boolean") {
        return {
          ...item,
          [field]: !item[field],
        };
      }
      return item;
    });
  });
}

//Updates an object in a 2d array
export function updateObject2d<T>(
  setState: React.Dispatch<React.SetStateAction<T[][]>>,
  row: number,
  column: number,
  updates: Partial<T>
) {
  setState((prev) => {
    return prev.map((rowData, rowIndex) => {
      if (rowIndex === row) {
        return rowData.map((object, colIndex) => {
          if (colIndex === column) {
            return {
              ...object,
              ...updates,
            };
          }
          return object;
        });
      }
      return rowData;
    });
  });
}

// Updates multiple objects in a 2d array
export function updateObjects2d<T>(
  setState: React.Dispatch<React.SetStateAction<T[][]>>,
  changes: Array<{
    row: number;
    column: number;
    updates: Partial<T>;
  }>
) {
  setState((prev) => {
    return prev.map((rowData, rowIndex) => {
      return rowData.map((object, colIndex) => {
        const change = changes.find(
          (change) => change.row === rowIndex && change.column === colIndex
        );
        if (change) {
          return {
            ...object,
            ...change.updates,
          };
        }
        return object;
      });
    });
  });
}
