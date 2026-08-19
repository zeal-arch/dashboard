import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Category = "technology" | "sports" | "finance" | "entertainment" | "health" | "science" | "business" | "general" | "music" | "food" | "gaming" | "anime" | "social";

export interface PreferencesState {
  categories: Category[];
  darkMode: boolean;
  searchQuery: string;
  contentOrder: string[]; // drag-and-drop order of content types
  interestScores: Record<string, number>;
}

const initialState: PreferencesState = {
  categories: ["technology", "entertainment"],
  darkMode: false,
  searchQuery: "",
  contentOrder: ["news", "movies", "social"],
  interestScores: {},
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
    recordInteraction(state, action: PayloadAction<{ tag: string; weight: number }>) {
      const { tag, weight } = action.payload;
      if (!tag) return;
      state.interestScores[tag] = (state.interestScores[tag] || 0) + weight;
    }
  },
});

export const { toggleCategory, setCategories, setDarkMode, setSearchQuery, setContentOrder, recordInteraction } = preferencesSlice.actions;
export default preferencesSlice.reducer;
