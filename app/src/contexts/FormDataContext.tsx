import React, { useMemo, useState } from 'react';

export const FormDataContext = React.createContext(null);

export const FormDataContextProvider: React.FC = (props) => {
  const [formContextValue, setFormContextValue] = useState(null);

  const formContextProviderValue = useMemo(
    () => ({
      formContextValue,
      setFormContextValue
    }),
    [formContextValue, setFormContextValue]
  );

  return <FormDataContext.Provider value={formContextProviderValue}>{props.children}</FormDataContext.Provider>;
};
