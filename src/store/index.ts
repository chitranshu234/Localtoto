import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';

// Persist configuration
const persistConfig = {
    key: 'root',
    version: 1,
    storage: AsyncStorage,
    whitelist: ['auth'], // Only persist auth state
};

// Root reducer
const rootReducer = combineReducers({
    auth: authReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

// Sync tokens to AsyncStorage after rehydration for API client to use
persistor.subscribe(() => {
    const { bootstrapped } = persistor.getState();
    if (bootstrapped) {
        const state = store.getState();
        const { accessToken, refreshToken } = state.auth;

        if (accessToken) {
            console.log('🔄 Syncing rehydrated token to AsyncStorage...');
            AsyncStorage.setItem('access_token', accessToken);
        }
        if (refreshToken) {
            AsyncStorage.setItem('refresh_token', refreshToken);
        }
    }
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
