import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { RootState } from 'state/reducers';

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
