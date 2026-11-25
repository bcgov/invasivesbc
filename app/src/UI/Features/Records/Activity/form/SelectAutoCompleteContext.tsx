import React, { createContext, useReducer } from 'react';

type LastFieldChanged = {
  id?: string;
  option?: string;
};

type ISelectAutoCompleteContext = {
  lastFieldChanged: LastFieldChanged;
  setLastFieldChanged: (data: LastFieldChanged) => void;
};

export const initialValues: ISelectAutoCompleteContext = {
  lastFieldChanged: {},
  setLastFieldChanged: () => {}
};

export const SelectAutoCompleteContext = createContext<ISelectAutoCompleteContext>(initialValues);

type State = {
  lastFieldChanged: LastFieldChanged;
};

type Action = {
  type: 'setLastFieldChanged';
  data: LastFieldChanged;
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'setLastFieldChanged':
      return { lastFieldChanged: action.data };
    default:
      return state;
  }
}

export const SelectAutoCompleteContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialValues);

  return (
    <SelectAutoCompleteContext.Provider
      value={{
        lastFieldChanged: state.lastFieldChanged,
        setLastFieldChanged: (data) => {
          dispatch({ type: 'setLastFieldChanged', data: data });
        }
      }}
    >
      {children}
    </SelectAutoCompleteContext.Provider>
  );
};
