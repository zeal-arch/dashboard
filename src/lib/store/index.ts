import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
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

const persistConfig = {
  key: "root",
  storage,
  version: 2, // bump this whenever the state shape changes to auto-clear old localStorage
  // Persist user preference choices and favorites lists, but keep content feed in memory only
  // so browser refresh naturally busts cache.
  whitelist: ["preferences", "favorites"],
  migrate: (state: unknown) => Promise.resolve(state as import("redux-persist/lib/types").PersistedState),
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
