import { createContext, useContext } from 'react';
export const LayersControlContext = createContext({});
export const LayersControlProvider = LayersControlContext.Provider;
export function useLayerControlContext() {
  const context = useContext(LayersControlContext);

  if (context == null) {
    throw new Error('No context provided: useLayerControlContext() can only be used in a descendant of <LayerControl>');
  }

  return context;
}
