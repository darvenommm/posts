import { default as slug } from 'slug';

export const createSlug = (receivedString: string, wordsCount: number): string => {
  return slug(receivedString.split(' ').slice(0, wordsCount).join(' '));
};
