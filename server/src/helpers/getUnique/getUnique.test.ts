import { describe, test, expect } from 'bun:test';

import { getUniqueId } from './getUnique';

describe('Test getUnique', (): void => {
  test('Testing unique', (): void => {
    const ids: string[] = [];

    for (let i = 0; i < 100; ++i) {
      ids.push(getUniqueId());
    }

    expect(new Set(ids).size).toBe(ids.length);
  });
});
