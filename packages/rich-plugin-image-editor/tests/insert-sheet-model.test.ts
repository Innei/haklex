import { describe, expect, it, vi } from 'vitest';

import type { SheetRow } from '../src/insert-sheet-model';
import { finalizeRows, formatBytes, isEditableImage } from '../src/insert-sheet-model';

const gps = { latitude: 31.23, longitude: 121.47 };

function file(name: string, type = 'image/jpeg'): File {
  return new File(['x'], name, { type });
}

function row(id: string, overrides: Partial<SheetRow> = {}): SheetRow {
  const original = file(`${id}.jpg`);
  return { current: original, gps: null, id, original, summary: '', ...overrides };
}

describe('finalizeRows', () => {
  it('strips GPS only from unedited rows that carry it when removal is on', async () => {
    const stripped = file('a-clean.jpg');
    const stripGps = vi.fn().mockResolvedValue(stripped);
    const a = row('a', { gps });
    const b = row('b');

    const result = await finalizeRows([a, b], true, stripGps);

    expect(result).toEqual({ failedIds: [], files: [stripped, b.original] });
    expect(stripGps).toHaveBeenCalledTimes(1);
    expect(stripGps).toHaveBeenCalledWith(a.original);
  });

  it('uploads the edited file as is, since canvas export already dropped metadata', async () => {
    const edited = file('a-edited.jpg');
    const stripGps = vi.fn();
    const a = row('a', { current: edited, gps });

    await expect(finalizeRows([a], true, stripGps)).resolves.toEqual({
      failedIds: [],
      files: [edited],
    });
    expect(stripGps).not.toHaveBeenCalled();
  });

  it('keeps GPS when removal is off', async () => {
    const stripGps = vi.fn();
    const a = row('a', { gps });

    await expect(finalizeRows([a], false, stripGps)).resolves.toEqual({
      failedIds: [],
      files: [a.original],
    });
    expect(stripGps).not.toHaveBeenCalled();
  });

  it('reports rows whose GPS could not be stripped instead of uploading them', async () => {
    const stripGps = vi.fn().mockRejectedValue(new Error('wasm failed'));
    const a = row('a', { gps });
    const b = row('b');

    await expect(finalizeRows([a, b], true, stripGps)).resolves.toEqual({
      failedIds: ['a'],
      files: [b.original],
    });
  });

  it('reports GPS rows as failed when no stripper is available', async () => {
    const a = row('a', { gps });

    await expect(finalizeRows([a], true, undefined)).resolves.toEqual({
      failedIds: ['a'],
      files: [],
    });
  });
});

describe('isEditableImage', () => {
  it('rejects formats that canvas export would flatten', () => {
    expect(isEditableImage(file('a.gif', 'image/gif'))).toBe(false);
    expect(isEditableImage(file('a.svg', 'image/svg+xml'))).toBe(false);
    expect(isEditableImage(file('a.png', 'image/png'))).toBe(true);
  });
});

describe('formatBytes', () => {
  it('formats with one decimal above a kilobyte', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(820 * 1024)).toBe('820 KB');
    expect(formatBytes(3.1 * 1024 * 1024)).toBe('3.1 MB');
  });
});
