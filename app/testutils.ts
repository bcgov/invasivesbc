/**
 * Helpers and Shorthand functions for Writing Tests and Mocks
 */
import { configureStore } from '@reduxjs/toolkit';

/**
 * @param stateProperties Mocked state properties
 * @returns reducer
 */
const mockState =
  // eslint-disable-next-line
  (stateProps: Record<PropertyKey, any>) =>
    (
      state = {
        ...stateProps
      }
    ) =>
      state;

/**
 * @desc Shorthand Mock Store creator
 * @param reducers Supplied reducers for creation. e.g. {Configuration: createConfigurationReducer()}
 */
// eslint-disable-next-line
const createMockStore = (reducers: Record<PropertyKey, any>) =>
  configureStore({
    reducer: {
      ...reducers
    }
  });

export { createMockStore, mockState };
