import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import type { PersistedState } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import preferencesReducer from "./preferencesSlice";
import contentReducer from "./contentSlice";
import favoritesReducer from "./favoritesSlice";

// SSR-safe storage: use a no-op on the server, real localStorage on the client
const createNoopStorage = () => ({
  getItem() { return Promise.resolve(null); },
  setItem(_key: string, value: unknown) { return Promise.resolve(value); },
  removeItem() { return Promise.resolve(); },
});

const storage =
  typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

const rootReducer = combineReducers({
  preferences: preferencesReducer,
  content: contentReducer,
  favorites: favoritesReducer,
});

export const persistConfig = {
  key: "root",
  storage,
  version: 3, // bump this to clear/migrate old schema
  whitelist: ["preferences", "favorites"],
  migrate: (state: PersistedState): Promise<PersistedState> => {
    if (state && (state as Record<string, unknown>).favorites) {
      const fav = (state as Record<string, unknown>).favorites as { items?: unknown[] } | unknown[];
      // Handle migrating from legacy array-based favorites
      if (Array.isArray(fav)) {
        return Promise.resolve({
          ...state,
          favorites: {
            items: fav,
            ids: (fav as { id?: string }[]).map((i) => i.id ?? ""),
          },
        } as PersistedState);
      }
      // Handle corrupt favorites structure lacking `items` array
      if (!Array.isArray((fav as { items?: unknown[] }).items)) {
        return Promise.resolve({
          ...state,
          favorites: { items: [], ids: [] },
        } as PersistedState);
      }
    }
    return Promise.resolve(state);
  },
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

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

// Derive RootState from rootReducer (not store.getState) to avoid PersistPartial in the public type
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
