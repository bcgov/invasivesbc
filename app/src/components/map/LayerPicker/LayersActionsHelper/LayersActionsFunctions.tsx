import { Button } from '@mui/material';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import React, { useContext } from 'react';

export const getParentAction = (inputArray: any[], id: string) => {
  return inputArray.filter((x) => x.id === id)[0];
};

export const getChildAction = (inputArray: any[], parentId: string, childId: string) => {
  let pIndex = getIndexById(inputArray, parentId);
  let cIndex = getChildIndex(inputArray, parentId, childId);
  let children = inputArray[pIndex].children;
  return children[cIndex];
};

const getIndexById = (inputArray: any[], id: string) => {
  return inputArray.findIndex((x) => x.id === id);
};

const getChildIndex = (inputArray: any[], parentId: string, childId: string) => {
  let pIndex = getIndexById(inputArray, parentId);
  let children = inputArray[pIndex].children;
  return getIndexById(children, childId);
};

const getObjectsBeforeIndex = (inputArray: any[], index: number) => {
  return inputArray.slice(0, index);
};

const getObjectsAfterIndex = (inputArray: any[], index: number) => {
  return inputArray.slice(index + 1);
};

export const updateParentAction = (inputArray: any[], setInputArray: any, parentID: string, fieldsToUpdate: Object) => {
  let pIndex = getIndexById(inputArray, parentID);
  let parentsBefore = getObjectsBeforeIndex(inputArray, pIndex);
  let parentsAfter = getObjectsAfterIndex(inputArray, pIndex);
  const oldParent = getParentAction(inputArray, parentID);
  const updatedParent = { ...oldParent, ...fieldsToUpdate };
  setInputArray([...parentsBefore, updatedParent, ...parentsAfter]);
};

export const updateChildAction = (
  inputArray: any[],
  setInputArray: any,
  parentId: string,
  childId: string,
  fieldsToUpdate: Object
) => {
  let pIndex = getIndexById(inputArray, parentId);
  let cIndex = getChildIndex(inputArray, parentId, childId);

  const oldChild = getChildAction(inputArray, parentId, childId);
  const updatedChild = { ...oldChild, ...fieldsToUpdate };

  let parentsBefore = getObjectsBeforeIndex(inputArray, pIndex);
  let parentsAfter = getObjectsAfterIndex(inputArray, pIndex);

  const oldParent = getParentAction(inputArray, parentId);

  let childrenBefore = oldParent.children.slice(0, cIndex);
  let childrenAfter = oldParent.children.slice(cIndex + 1);

  const newParent = {
    ...oldParent,
    children: [...childrenBefore, updatedChild, ...childrenAfter]
  };

  setInputArray([...parentsBefore, newParent, ...parentsAfter]);
};

export const toggleDialog = (
  inputArray: any[],
  setInputArray: any,
  parent: any,
  child: any,
  fieldsToUpdate: Object
) => {
  updateChildAction(inputArray, setInputArray, parent.id, child.id, fieldsToUpdate);
};

export const DialogCloseBtn = (props) => {
  const mapLayersContext = useContext(MapRequestContext);
  const { layersActions, setLayersActions } = mapLayersContext;
  return (
    <Button
      id="close-btn"
      onClick={() => toggleDialog(layersActions, setLayersActions, props.parent, props.child, props.fieldsToUpdate)}>
      Close
    </Button>
  );
};
