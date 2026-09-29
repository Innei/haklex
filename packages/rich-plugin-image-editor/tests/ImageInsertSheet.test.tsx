// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ImageInsertSheet, type ImageInsertSheetProps } from '../src/ImageInsertSheet';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

function file(name: string): File {
  return new File(['x'], name, { type: 'image/jpeg' });
}

async function render(props: Partial<ImageInsertSheetProps> & { files: File[] }) {
  const handlers = {
    onCancel: vi.fn(),
    onEdit: vi.fn().mockResolvedValue(null),
    onInsert: vi.fn(),
  };
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(<ImageInsertSheet {...handlers} {...props} />);
  });
  return handlers;
}

function button(label: string | RegExp): HTMLButtonElement {
  const match = [...container!.querySelectorAll('button')].find((el) =>
    typeof label === 'string'
      ? el.textContent === label || el.getAttribute('aria-label') === label
      : label.test(el.textContent ?? ''),
  );
  if (!match) throw new Error(`No button ${label}`);
  return match;
}

async function click(el: HTMLElement) {
  await act(async () => {
    el.click();
  });
}

describe('ImageInsertSheet', () => {
  it('inserts the rows left after removal, in order', async () => {
    const a = file('a.jpg');
    const b = file('b.jpg');
    const c = file('c.jpg');
    const { onInsert } = await render({ files: [a, b, c] });

    await click(button('Remove b.jpg'));
    await click(button('Insert 2 images'));

    expect(onInsert).toHaveBeenCalledWith([a, c]);
  });

  it('cancels when the last row is removed', async () => {
    const { onCancel, onInsert } = await render({ files: [file('a.jpg')] });

    await click(button('Remove a.jpg'));

    expect(onCancel).toHaveBeenCalled();
    expect(onInsert).not.toHaveBeenCalled();
  });

  it('strips GPS from unedited rows by default', async () => {
    const a = file('a.jpg');
    const clean = file('a-clean.jpg');
    const privacy = {
      detectGps: vi.fn().mockResolvedValue({ latitude: 1, longitude: 2 }),
      stripGps: vi.fn().mockResolvedValue(clean),
    };
    const { onInsert } = await render({ files: [a], privacy });

    expect(container!.textContent).toContain('This photo records where it was taken');
    await click(button('Insert'));

    expect(privacy.stripGps).toHaveBeenCalledWith(a);
    expect(onInsert).toHaveBeenCalledWith([clean]);
  });

  it('inserts the edited file without stripping it again', async () => {
    const a = file('a.jpg');
    const edited = file('a-edited.jpg');
    const privacy = {
      detectGps: vi.fn().mockResolvedValue({ latitude: 1, longitude: 2 }),
      stripGps: vi.fn(),
    };
    const onEdit = vi.fn().mockResolvedValue({ file: edited, summary: 'Cropped' });
    const { onInsert } = await render({ files: [a], onEdit, privacy });

    await click(button(/Edit/));
    expect(container!.textContent).toContain('Edited');
    await click(button('Insert'));

    expect(privacy.stripGps).not.toHaveBeenCalled();
    expect(onInsert).toHaveBeenCalledWith([edited]);
  });

  it('blocks insert when GPS cannot be stripped until location is kept', async () => {
    const a = file('a.jpg');
    const privacy = {
      detectGps: vi.fn().mockResolvedValue({ latitude: 1, longitude: 2 }),
      stripGps: vi.fn().mockRejectedValue(new Error('wasm')),
    };
    const { onInsert } = await render({ files: [a], privacy });

    await click(button('Insert'));
    expect(onInsert).not.toHaveBeenCalled();
    expect(button('Insert').disabled).toBe(true);

    await click(container!.querySelector<HTMLInputElement>('input[type="checkbox"]')!);
    await click(button('Insert'));

    expect(onInsert).toHaveBeenCalledWith([a]);
  });

  it('waits for GPS detection before inserting so a fast Enter still strips location', async () => {
    const a = file('a.jpg');
    const clean = file('a-clean.jpg');
    let resolveGps!: (value: { latitude: number; longitude: number }) => void;
    const privacy = {
      detectGps: vi.fn(
        () =>
          new Promise<{ latitude: number; longitude: number }>((resolve) => {
            resolveGps = resolve;
          }),
      ),
      stripGps: vi.fn().mockResolvedValue(clean),
    };
    const { onInsert } = await render({ files: [a], privacy });

    const insert = button('Insert');
    await act(async () => {
      insert.click();
      resolveGps({ latitude: 1, longitude: 2 });
    });

    expect(privacy.stripGps).toHaveBeenCalledWith(a);
    expect(onInsert).toHaveBeenCalledWith([clean]);
  });

  it('labels the action Replace when replacing an existing image', async () => {
    const a = file('a.jpg');
    const { onInsert } = await render({ files: [a], source: 'replace' });

    await click(button('Replace'));

    expect(onInsert).toHaveBeenCalledWith([a]);
  });
});
