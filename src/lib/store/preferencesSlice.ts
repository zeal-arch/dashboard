import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Category = "technology" | "sports" | "finance" | "entertainment" | "health" | "science";

export interface PreferencesState {
  categories: Category[];
  darkMode: boolean;
  searchQuery: string;
  contentOrder: string[]; // drag-and-drop order of content types
}

const initialState: PreferencesState = {
  categories: ["technology", "entertainment"],
  darkMode: false,
  searchQuery: "",
  contentOrder: ["news", "movies", "social"],
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    toggleCategory(state, action: PayloadAction<Category>) {
      const idx = state.categories.indexOf(action.payload);
      if (idx >= 0) {
        state.categories.splice(idx, 1);
      } else {
        state.categories.push(action.payload);
      }
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setContentOrder(state, action: PayloadAction<string[]>) {
      state.contentOrder = action.payload;
    },
  },
});

export const { toggleCategory, setCategories, setDarkMode, setSearchQuery, setContentOrder } = preferencesSlice.actions;
export default preferencesSlice.reducer;
