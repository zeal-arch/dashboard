import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ContentItem } from "./contentSlice";

export interface FavoritesState {
  items: ContentItem[];
  ids: string[];
}

const initialState: FavoritesState = {
  items: [],
  ids: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<ContentItem>) {
      const idx = state.ids.indexOf(action.payload.id);
      if (idx >= 0) {
        state.ids.splice(idx, 1);
        state.items = state.items.filter((i) => i.id !== action.payload.id);
      } else {
        state.ids.push(action.payload.id);
        state.items.push(action.payload);
      }
    },
    clearFavorites(state) {
      state.ids = [];
      state.items = [];
    },
  },
});

export const { toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
