/* eslint-disable object-curly-newline */
import { createSlice, createSelector } from '@reduxjs/toolkit';

import { IUsersProps } from '@/types/Types';
import { RootState } from './store';
import { USER_DATA_FAKE } from '@/api/API';

type TAuthenticationState = {
  user: IUsersProps;
};

const initialState: TAuthenticationState = {
  user: {
    ...USER_DATA_FAKE,
  } as IUsersProps,
};

export const AuthenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {},
  extraReducers: () => {},
});

export const AuthenticationSelector = createSelector(
  (state: RootState) => state.authentication.user,
  (user) => ({
    user,
  }),
);

// export const { setCallType } = AuthenticationSlice.actions;

export default AuthenticationSlice.reducer;
