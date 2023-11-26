import { configureStore, combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';

import CallerCallee from './CallerCalleeSlice';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createDebugger = require('redux-flipper').default;

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['authentication'],
};

const rootReducer = combineReducers({
  callerCallee: CallerCallee,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    __DEV__
      ? getDefaultMiddleware({
          serializableCheck: false,
          immutableCheck: false,
        }).concat(createDebugger())
      : getDefaultMiddleware({
          serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
