/**
 *
 * @param inputArray
 * @returns
 */
export const sortArray = (inputArray: any[]) => {
  const returnVal = [...inputArray].sort((a, b) => {
    if ((a as any).order > (b as any).order) {
      return 1;
    }
    if ((a as any).order < (b as any).order) {
      return -1;
    }
    return 0;
  });
  return returnVal;
};

/**
 *
 * @param id
 * @param inputArray
 * @returns
 */
const getIndexById = (id: string, inputArray: any[]) => {
  const sortedArray = sortArray(inputArray);
  return sortedArray.findIndex((x) => (x as any).id === id);
};

/**
 * Get objects in json before an index of the json array
 * @param inputArray
 * @param index
 * @returns
 */
export function getObjectsBeforeIndex(inputArray: any[], index: number) {
  const sorted = sortArray(inputArray);
  return [...sorted.slice(0, index)];
}

/**
 * Get objects in json after an index of the json array
 * @param inputArray
 * @param index
 * @returns
 */
export function getObjectsAfterIndex(inputArray: any[], index: number) {
  const sorted = sortArray(inputArray);
  return [...sorted.slice(index + 1)];
}

/**
 * Get childs before index of children array from parent pIndex
 * @param inputArray
 * @param pIndex
 * @param cIndex
 * @returns
 */
export function getChildObjBeforeIndex(
  inputArray: any[],
  pIndex: number,
  cIndex: number
) {
  const sorted = sortArray(inputArray);
  return [...(sorted[pIndex] as any).children.slice(0, cIndex)];
}

/**
 * Get childs after index of children array from parent pIndex
 * @param inputArray
 * @param pIndex
 * @param cIndex
 * @returns
 */
export function getChildObjAfterIndex(
  inputArray: any[],
  pIndex: number,
  cIndex: number
) {
  const sorted = sortArray(inputArray);
  return [...(sorted[pIndex] as any).children.slice(cIndex + 1)];
}

/**
 *
 * @param inputArray
 * @param id
 * @returns
 */
export function getParentIndex(inputArray: any[], id: string) {
  const sorted = sortArray(inputArray);
  return getIndexById(id, sorted);
}

/**
 *
 * @param inputArray
 * @param parentId
 * @param childId
 * @returns
 */
export function getChildIndex(
  inputArray: any[],
  parentId: string,
  childId: string
) {
  const sorted = sortArray(inputArray);
  let pIndex = getParentIndex(sorted, parentId);
  let childArray = sorted[pIndex].children;
  let childArraySorted = sortArray(childArray);
  return getIndexById(childId, childArraySorted);
}

/**
 *
 * @param inputArray
 * @param parentId
 * @returns
 */
export function getParent(inputArray: any[], parentId: string) {
  const sorted = sortArray(inputArray);
  return sorted[getParentIndex(sorted, parentId)];
}

/**
 *
 * @param inputArray
 * @param parentId
 * @param childId
 * @returns
 */
export function getChild(inputArray: any[], parentId: string, childId: string) {
  let pIndex = getParentIndex(inputArray, parentId);
  let cIndex = getChildIndex(inputArray, parentId, childId);
  const sorted = sortArray(inputArray);
  let parentObj = sorted[pIndex];
  const sortedChildren = sortArray(parentObj.children);
  return sortedChildren[cIndex];
}

/**
 *
 * @param inputArray
 * @param order
 * @returns
 */
export function getParentByOrder(inputArray: any[], order: number) {
  const sorted = sortArray(inputArray);
  const parent = sorted.filter((x) => (x as any).order === order)[0];
  return { ...parent };
}

export const sortObject = (
  objectState: any[],
  oldIndex: number,
  newIndex: number
) => {
  let returnVal = [];
  if (newIndex > oldIndex) {
    // 3 to 5
    //      [{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }, { e: 5 }, { f: 6 }];
    //      [{ a: 1 }, { b: 2 }, { d: 3 }, { e: 4 }, { c: 5 },{ f: 6 }];

    //update objects before old index left alone
    let parentsBefore = getObjectsBeforeIndex(objectState, oldIndex);

    // update objects between old index and new index decrease
    //todo get inbetween
    let loopIndex = oldIndex + 1;
    let inBetween: any[] = [];
    while (loopIndex < newIndex) {
      let obj: any = getParentByOrder(objectState, loopIndex);
      obj.order = obj.order - 1;
      inBetween.push({ ...obj });
      loopIndex += 1;
    }

    let objWeMoved: any = getParentByOrder(objectState, oldIndex);
    objWeMoved.order = newIndex;

    let objWeSwapped: any = getParentByOrder(objectState, newIndex);
    objWeSwapped.order = newIndex - 1;

    //leave objects after alone
    let parentsAfter = getObjectsAfterIndex(objectState, newIndex);

    const newState = [
      ...parentsBefore,
      ...inBetween,
      objWeSwapped,
      objWeMoved,
      ...parentsAfter,
    ];

    //setObjectState(newState);
    returnVal = newState;
  } else if (newIndex < oldIndex) {
    // 5 to 3
    //      [{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }, { e: 5 }, { f: 6 }];
    //      [{ a: 1 }, { b: 2 }, { e: 3 }, { c: 4 }, { d: 5 }, ,{ f: 6 }];
    let parentsBefore = getObjectsBeforeIndex(objectState, newIndex);
    // update objects between old index and new index decrease
    let loopIndex = newIndex + 1;
    let inBetween: any[] = [];
    while (loopIndex < oldIndex) {
      let obj: any = getParentByOrder(objectState, loopIndex);
      obj.order = obj.order + 1;
      inBetween.push({ ...obj });
      loopIndex += 1;
    }

    let objWeMoved: any = getParentByOrder(objectState, oldIndex);
    objWeMoved.order = newIndex;

    let objWeSwapped: any = getParentByOrder(objectState, newIndex);
    objWeSwapped.order = newIndex + 1;

    //leave objects after alone
    let parentsAfter = getObjectsAfterIndex(objectState, oldIndex);

    const newState = [
      ...parentsBefore,
      ...inBetween,
      objWeMoved,
      objWeSwapped,
      ...parentsAfter,
    ];

    returnVal = newState;
  } else {
      return objectState;
  }
  return returnVal;
};
