import { persistConfig } from '@/lib/store/index';

interface MigratedState {
  favorites?: {
    items: unknown[];
    ids: string[];
  };
  preferences?: unknown;
}

describe('Redux Persist Store Migration & Fallbacks', () => {
  it('should return undefined if state is undefined', async () => {
    const result = await persistConfig.migrate(undefined);
    expect(result).toBeUndefined();
  });

  it('should return state as is if favorites state is not present', async () => {
    const state = { preferences: { categories: [] } };
    const result = await persistConfig.migrate(state);
    expect(result).toEqual(state);
  });

  it('should migrate legacy array-based favorites to the new structure', async () => {
    const legacyItem = { id: 'item-1', title: 'Legacy Item' };
    const state = {
      favorites: [legacyItem],
    };

    const result = (await persistConfig.migrate(state)) as MigratedState;
    expect(result.favorites).toEqual({
      items: [legacyItem],
      ids: ['item-1'],
    });
  });

  it('should fallback and reset favorites to empty state if favorites has corrupt items structure', async () => {
    const corruptState = {
      favorites: {
        items: 'not-an-array', // corrupt
        ids: ['item-1'],
      },
    };

    const result = (await persistConfig.migrate(corruptState)) as MigratedState;
    expect(result.favorites).toEqual({
      items: [],
      ids: [],
    });
  });

  it('should not alter state if favorites is already in correct structure', async () => {
    const validState = {
      favorites: {
        items: [{ id: 'item-1', title: 'Valid Item' }],
        ids: ['item-1'],
      },
    };

    const result = (await persistConfig.migrate(validState)) as MigratedState;
    expect(result).toEqual(validState);
  });
});
