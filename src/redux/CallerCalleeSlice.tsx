/* eslint-disable object-curly-newline */
import { createSlice, createSelector } from '@reduxjs/toolkit';

import { ECallTypeProps } from '@/types/Types';
import { RootState } from './store';

type TCallerCalleeState = {
  callType: ECallTypeProps | null;
};

const initialState: TCallerCalleeState = {
  callType: null,
};

export const CallerCalleeSlice = createSlice({
  name: 'callerCallee',
  initialState,
  reducers: {
    setCallType: (
      state,
      {
        payload,
      }: {
        payload: TCallerCalleeState['callType'];
      },
    ) => {
      state.callType = payload;
    },
  },
  extraReducers: () => {},
});

export const CallerCalleeSelector = createSelector(
  (state: RootState) => state.callerCallee.callType,
  (callType) => ({
    callType,
  }),
);

export const { setCallType } = CallerCalleeSlice.actions;

export default CallerCalleeSlice.reducer;
