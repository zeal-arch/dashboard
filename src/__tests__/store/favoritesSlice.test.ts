import reducer, { toggleFavorite, clearFavorites } from '@/lib/store/favoritesSlice';
import { ContentItem } from '@/lib/store/contentSlice';

describe('favoritesSlice', () => {
  const mockItem: ContentItem = {
    id: '123',
    title: 'Test Movie',
    description: 'A test description',
    url: 'https://example.com',
    imageUrl: '',
    type: 'movie',
    source: 'tmdb',
    publishedAt: new Date().toISOString(),
    metrics: { likes: 0, views: 0 },
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      items: [],
      ids: [],
    });
  });

  it('should handle toggleFavorite (add)', () => {
    const state = reducer(undefined, toggleFavorite(mockItem));
    expect(state.ids).toContain('123');
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(mockItem);
  });

  it('should handle toggleFavorite (remove)', () => {
    const initialState = {
      items: [mockItem],
      ids: ['123'],
    };
    const state = reducer(initialState, toggleFavorite(mockItem));
    expect(state.ids).toHaveLength(0);
    expect(state.items).toHaveLength(0);
  });

  it('should handle clearFavorites', () => {
    const initialState = {
      items: [mockItem],
      ids: ['123'],
    };
    const state = reducer(initialState, clearFavorites());
    expect(state.ids).toHaveLength(0);
    expect(state.items).toHaveLength(0);
  });
});
