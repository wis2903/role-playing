/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useCallback } from 'react';
import { combineReducers } from 'redux';
import { useDispatch } from 'react-redux';
import { configureStore, Action, AsyncThunkAction, ThunkDispatch, unwrapResult } from '@reduxjs/toolkit';

// slices

const reducer = combineReducers({});
const store = configureStore({ reducer });

export type AppDispatch = typeof store.dispatch;
export type Store = typeof store;
export type RootState = ReturnType<typeof reducer>

export const useAppDispatch = (): ThunkDispatch<RootState, Record<string, unknown>, Action<string>> => useDispatch<AppDispatch>();

export const useAppDispatchAsync = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    <R extends any>(asyncThunk: AsyncThunkAction<R, any, any>): Promise<R> => dispatch(asyncThunk).then(unwrapResult),
    [dispatch],
  );
};

export default store;