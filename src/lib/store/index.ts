import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import preferencesReducer from "./preferencesSlice";
import contentReducer from "./contentSlice";
import favoritesReducer from "./favoritesSlice";

const rootReducer = combineReducers({
  preferences: preferencesReducer,
  content: contentReducer,
  favorites: favoritesReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["preferences", "favorites"], // only persist these slices
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
