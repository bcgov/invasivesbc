import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { RootState } from '../reducers';

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
