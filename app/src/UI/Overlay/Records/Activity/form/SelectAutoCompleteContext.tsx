import React, { createContext, useReducer } from 'react';

export const initialValues = {
  lastFieldChanged: {},
  setLastFieldChanged: (data) => {}
};

type ISelectAutoCompleteContext = {
  lastFieldChanged: {
    id?: string;
    option?: string;
  };
  setLastFieldChanged: (data) => void;
};
export const SelectAutoCompleteContext = createContext<ISelectAutoCompleteContext>(initialValues);

type State = {
  lastFieldChanged: {};
};

type Action = {
  type: 'setLastFieldChanged';
  data: {};
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
