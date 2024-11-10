import { describe, test, expect } from 'bun:test';

import { createSlug } from './createSlug';

const text = 'some string with some words';

describe('Test createSlug', (): void => {
  test('Slug without cutting', (): void => {
    expect(createSlug(text, 15)).toBe('some-string-with-some-words');
  });

  test('Slug with cutting', (): void => {
    expect(createSlug(text, 3)).toBe('some-string-with');
  });

  test('Incorrect wordsCount', (): void => {
    expect(createSlug(text, 0)).toBe('some');
    expect(createSlug(text, -10)).toBe('some');
  });

  test('Russian text', (): void => {
    expect(createSlug('Тест слова', 5)).toBe('test-slova');
  });
});
