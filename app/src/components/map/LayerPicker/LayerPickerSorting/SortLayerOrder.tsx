import { ListItemIcon } from '@material-ui/core';
import React from 'react';
import { SortableHandle } from 'react-sortable-hoc';
import DragHandleIcon from '@material-ui/icons/DragHandle';

/**
 *
 * @param inputArray
 * @returns
 */
export const sortArray = (inputArray: any[]) => {
  return [...inputArray].sort((a, b) => {
    if (a.order > b.order) {
      return 1;
    }
    if (a.order < b.order) {
      return -1;
    }
    return 0;
  });
};

/**
 *
 * @param id
 * @param inputArray
 * @returns
 */
const getIndexById = (id: string, inputArray: any[]) => {
  const sortedArray = sortArray(inputArray);
  return sortedArray.findIndex((x) => x.id === id);
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
export function getChildIndex(inputArray: any[], parentId: string, childId: string) {
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
export function getObjectByOrder(inputArray: any[], order: number) {
  const sorted = sortArray(inputArray);
  const parent = sorted.filter((x) => x.order === order)[0];
  return { ...parent };
}

export const sortObject = (objectState: any[], oldIndex: number, newIndex: number) => {
  let returnVal = [];
  if (newIndex > oldIndex) {
    // 3 to 5
    //      [{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }, { e: 5 }, { f: 6 }];
    //      [{ a: 1 }, { b: 2 }, { d: 3 }, { e: 4 }, { c: 5 },{ f: 6 }];

    //update objects before old index left alone
    let parentsBefore = getObjectsBeforeIndex(objectState, oldIndex);

    let newZindex = getObjectByOrder(objectState, newIndex).zIndex;
    let swapZindex = newZindex + 1000;

    // update objects between old index and new index decrease
    let loopIndex = oldIndex + 1;
    let inBetween: any[] = [];
    while (loopIndex < newIndex) {
      let obj: any = getObjectByOrder(objectState, loopIndex);
      obj.order = obj.order - 1;
      obj.zIndex = obj.zIndex + 1000;
      inBetween.push({ ...obj });
      loopIndex += 1;
    }

    let objWeMoved: any = getObjectByOrder(objectState, oldIndex);
    objWeMoved.order = newIndex;
    objWeMoved.zIndex = newZindex;

    let objWeSwapped: any = getObjectByOrder(objectState, newIndex);
    objWeSwapped.order = newIndex - 1;
    objWeSwapped.zIndex = swapZindex;

    //leave objects after alone
    let parentsAfter = getObjectsAfterIndex(objectState, newIndex);

    const newState = [...parentsBefore, ...inBetween, objWeSwapped, objWeMoved, ...parentsAfter];

    returnVal = newState;
  } else if (newIndex < oldIndex) {
    // 5 to 3
    //      [{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }, { e: 5 }, { f: 6 }];
    //      [{ a: 1 }, { b: 2 }, { e: 3 }, { c: 4 }, { d: 5 }, ,{ f: 6 }];
    let parentsBefore = getObjectsBeforeIndex(objectState, newIndex);

    let newZindex = getObjectByOrder(objectState, newIndex).zIndex;
    let swapZindex = newZindex - 1000;

    // update objects between old index and new index decrease
    let loopIndex = newIndex + 1;
    let inBetween: any[] = [];
    while (loopIndex < oldIndex) {
      let obj: any = getObjectByOrder(objectState, loopIndex);
      obj.order = obj.order + 1;
      obj.zIndex = obj.zIndex - 1000;
      inBetween.push({ ...obj });
      loopIndex += 1;
    }

    let objWeMoved: any = getObjectByOrder(objectState, oldIndex);
    objWeMoved.order = newIndex;
    objWeMoved.zIndex = newZindex;

    let objWeSwapped: any = getObjectByOrder(objectState, newIndex);
    objWeSwapped.order = newIndex + 1;
    objWeSwapped.zIndex = swapZindex;

    //leave objects after alone
    let parentsAfter = getObjectsAfterIndex(objectState, oldIndex);

    const newState = [...parentsBefore, ...inBetween, objWeMoved, objWeSwapped, ...parentsAfter];

    returnVal = newState;
  } else {
    return objectState;
  }
  return returnVal;
};

/**
 * Function used to update parent object in the objectState
 * @param parentId specified string of a parent object
 * @param fieldsToUpdate specified field to update e.g. { id: "newId" }
 */
export const updateParentLayer = (inputArray: any[], setInputArray: any, parentId: string, fieldsToUpdate: Object) => {
  let pIndex = getParentIndex(inputArray, parentId);
  let parentsBefore: Object[] = getObjectsBeforeIndex(inputArray, pIndex);
  let parentsAfter: Object[] = getObjectsAfterIndex(inputArray, pIndex);
  const oldParent = getParent(inputArray, parentId);
  const updatedParent = { ...oldParent, ...fieldsToUpdate };
  setInputArray([...parentsBefore, updatedParent, ...parentsAfter] as any);
};

export const updateChild = (objectState: any[], setObjectState: any, parentId, childId, fieldsToUpdate) => {
  let pIndex = getParentIndex(objectState, parentId);
  let cIndex = getChildIndex(objectState, parentId, childId);
  const oldChild = getChild(objectState, parentId, childId);
  const updatedChild = { ...oldChild, ...fieldsToUpdate };
  let parentsBefore = getObjectsBeforeIndex(objectState, pIndex);
  let parentsAfter = getObjectsAfterIndex(objectState, pIndex);
  const oldParent = getParent(objectState, parentId);

  const childrenBefore = getObjectsBeforeIndex(oldParent.children, cIndex);
  const childrenAfter = getObjectsAfterIndex(oldParent.children, cIndex);

  const newParent = {
    ...oldParent,
    children: [...childrenBefore, updatedChild, ...childrenAfter]
  };

  setObjectState([...parentsBefore, newParent, ...parentsAfter] as any);
};

export const DragHandle = SortableHandle(() => (
  <ListItemIcon>
    <DragHandleIcon />
  </ListItemIcon>
));
