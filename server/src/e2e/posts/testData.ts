import { v4 as getUUID } from 'uuid';

import type { AddDTO, UpdateDTO } from '@/domains/posts/dtos';

export const addDTO: AddDTO = {
  id: getUUID(),
  text: 'some title jdfk',
  title: 'some text slkdfjsdlkfj sdfklj',
};

export const updateDTO: UpdateDTO = {
  title: 'some title jdfk sdf',
  text: 'some text slkdfjsdlkfj sdfklj',
};
