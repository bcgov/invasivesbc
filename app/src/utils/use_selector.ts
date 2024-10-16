import { TypedUseSelectorHook, useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import { Action, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from 'state/reducers/rootReducer';

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export type AppDispatch = ThunkDispatch<RootState, any, Action>;

export const useDispatch = () => useReduxDispatch<AppDispatch>();
