import { describe, expect, it } from 'vitest';

import { isDynamicComponentModule } from '../src/index';

describe('isDynamicComponentModule', () => {
  it('accepts an object with a mount function', () => {
    expect(isDynamicComponentModule({ mount: () => ({ unmount() {} }) })).toBe(true);
  });

  it('rejects non-modules', () => {
    expect(isDynamicComponentModule(undefined)).toBe(false);
    expect(isDynamicComponentModule(null)).toBe(false);
    expect(isDynamicComponentModule('mount')).toBe(false);
    expect(isDynamicComponentModule({})).toBe(false);
    expect(isDynamicComponentModule({ mount: 'not-a-function' })).toBe(false);
    expect(isDynamicComponentModule(() => {})).toBe(false);
  });
});
