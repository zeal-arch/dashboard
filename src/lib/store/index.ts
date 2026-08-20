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
  version: 3, // bump this to clear/migrate old schema
  whitelist: ["preferences", "favorites"],
  migrate: (state: any) => {
    if (state && state.favorites) {
      const fav = state.favorites;
      // Handle migrating from legacy array-based favorites
      if (Array.isArray(fav)) {
        return Promise.resolve({
          ...state,
          favorites: {
            items: fav,
            ids: fav.map((i: any) => i.id || ""),
          },
        });
      }
      // Handle corrupt favorites structure lacking `items` array
      if (!fav.items || !Array.isArray(fav.items)) {
        return Promise.resolve({
          ...state,
          favorites: {
            items: [],
            ids: [],
          },
        });
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
