import { default as slug } from 'slug';

export const createSlug = (receivedString: string, wordsCount: number): string => {
  wordsCount = Math.max(wordsCount, 1);

  return slug(receivedString.split(' ').slice(0, wordsCount).join(' '));
};
