import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { RootState } from 'state/reducers/rootReducer';

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
