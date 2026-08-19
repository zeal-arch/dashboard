import reducer, {
  toggleCategory,
  setCategories,
  setDarkMode,
  setSearchQuery,
  setContentOrder,
} from '@/lib/store/preferencesSlice';

describe('preferencesSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      categories: ['technology', 'entertainment'],
      darkMode: false,
      searchQuery: '',
      contentOrder: ['news', 'movies', 'social'],
      interestScores: {},
    });
  });

  it('should handle toggleCategory', () => {
    const initialState: import('@/lib/store/preferencesSlice').PreferencesState = {
      categories: ['technology'],
      darkMode: false,
      searchQuery: '',
      contentOrder: [],
      interestScores: {},
    };

    // Adding category
    let state = reducer(initialState, toggleCategory('sports'));
    expect(state.categories).toEqual(['technology', 'sports']);

    // Removing category
    state = reducer(state, toggleCategory('technology'));
    expect(state.categories).toEqual(['sports']);
  });

  it('should handle setCategories', () => {
    const state = reducer(undefined, setCategories(['science', 'health']));
    expect(state.categories).toEqual(['science', 'health']);
  });

  it('should handle setDarkMode', () => {
    const state = reducer(undefined, setDarkMode(true));
    expect(state.darkMode).toBe(true);
  });

  it('should handle setSearchQuery', () => {
    const state = reducer(undefined, setSearchQuery('bitcoin'));
    expect(state.searchQuery).toBe('bitcoin');
  });

  it('should handle setContentOrder', () => {
    const state = reducer(undefined, setContentOrder(['social', 'movies', 'news']));
    expect(state.contentOrder).toEqual(['social', 'movies', 'news']);
  });
});
