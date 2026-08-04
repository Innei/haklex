import { describe, expect, it } from 'vitest';

import { getBuiltinItems } from '../src/builtinItems';

describe('getBuiltinItems', () => {
  it('marks Table as excluded from nested editors', () => {
    const items = getBuiltinItems();
    const table = items.find((item) => item.title === 'Table');

    expect(table?.nested).toBe(false);
  });

  it('leaves other builtin items allowed in nested editors', () => {
    const items = getBuiltinItems();
    const text = items.find((item) => item.title === 'Text');
    const bulletedList = items.find((item) => item.title === 'Bulleted List');

    expect(text?.nested).toBe(true);
    expect(bulletedList?.nested).toBe(true);
  });
});
