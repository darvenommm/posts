import { v4 as createUUID } from 'uuid';

import type { CreateDTO, UpdateDTO } from '@/domains/posts';

export const createDTO: CreateDTO = {
  id: createUUID(),
  title: 'first post title',
  text: 'alksdjflkasdfj aklsfd jlkasdf jlkasdf jklasdfj klasdfjasdklf jfd  ds da fslkj',
} as const;

export const updateDTO: UpdateDTO = {
  title: 'first post title',
  text: 'alksdjflkasdfj aklsfd jlkasdf jlkasdf jklasdfj klasdfjasdklf jfd  ds da fslkj sdf',
} as const;
