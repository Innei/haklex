// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  dialogWidthStyle,
  getSnapshot as getDialogStack,
  presentDialog,
  removeDialog,
  requestDismissDialog,
} from '../src/components/dialog/store';
import { Field } from '../src/components/field';
import { ModalShell, ModalShellFooter, ModalShellHeader } from '../src/components/modal-shell';
import { PopoverBody, PopoverFooter, PopoverHeader } from '../src/components/popover';
import { TextInput } from '../src/components/text-input';
import {
  dismissToast,
  getToasts,
  toast,
  ToastViewport,
  updateToast,
} from '../src/components/toast';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  for (const item of getDialogStack()) removeDialog(item.id);
  for (const item of getToasts()) dismissToast(item.id);
  vi.useRealTimers();
});

describe('Field', () => {
  it('ties a visible label to its control', () => {
    const html = renderToStaticMarkup(
      <Field id="alt" label="Alt text">
        <TextInput id="alt" />
      </Field>,
    );
    expect(html).toMatch(/<label[^>]*for="alt"[^>]*>Alt text<\/label>/);
    expect(html).toContain('id="alt"');
  });

  it('announces an error and marks the control invalid', () => {
    const html = renderToStaticMarkup(
      <Field error="Enter a valid URL" id="url" label="URL">
        <TextInput invalid id="url" />
      </Field>,
    );
    expect(html).toMatch(/role="alert"[^>]*>Enter a valid URL/);
    expect(html).toContain('aria-invalid="true"');
  });

  it('shows a hint when there is no error', () => {
    const html = renderToStaticMarkup(
      <Field hint="Optional" id="cap" label="Caption">
        <TextInput id="cap" />
      </Field>,
    );
    expect(html).toContain('Optional');
    expect(html).not.toContain('role="alert"');
  });
});

describe('popover anatomy', () => {
  it('renders header title, body and footer hint', () => {
    const html = renderToStaticMarkup(
      <div>
        <PopoverHeader actions={<button type="button">More</button>} title="Image" />
        <PopoverBody>fields</PopoverBody>
        <PopoverFooter hint="Changes apply as you type" />
      </div>,
    );
    expect(html).toContain('Image');
    expect(html).toContain('More');
    expect(html).toContain('fields');
    expect(html).toContain('Changes apply as you type');
  });
});

describe('ModalShell', () => {
  it('labels the close button and shows footer status', () => {
    const html = renderToStaticMarkup(
      <ModalShell>
        <ModalShellHeader title="Mermaid diagram" onClose={() => {}} />
        <ModalShellFooter status="Unsaved changes" onCancel={() => {}} onSave={() => {}} />
      </ModalShell>,
    );
    expect(html).toContain('Mermaid diagram');
    expect(html).toContain('aria-label="Close"');
    expect(html).toContain('Unsaved changes');
    expect(html).toContain('>Save<');
    expect(html).toContain('>Cancel<');
  });
});

describe('ModalShell keys', () => {
  function mountShell(onSave: () => void, preventInside: boolean) {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    act(() =>
      root.render(
        <ModalShell onSave={onSave}>
          <textarea
            onKeyDown={(event) => {
              if (preventInside) event.preventDefault();
            }}
          />
        </ModalShell>,
      ),
    );
    const textarea = container.querySelector('textarea')!;
    return {
      press: (key: string) =>
        act(() => {
          textarea.dispatchEvent(
            new KeyboardEvent('keydown', { key, metaKey: true, bubbles: true, cancelable: true }),
          );
        }),
      unmount: () => {
        act(() => root.unmount());
        container.remove();
      },
    };
  }

  it('saves on ⌘S and ⌘↵', () => {
    const onSave = vi.fn();
    const shell = mountShell(onSave, false);
    shell.press('s');
    shell.press('Enter');
    expect(onSave).toHaveBeenCalledTimes(2);
    shell.unmount();
  });

  it('leaves a key an inner editor already handled', () => {
    const onSave = vi.fn();
    const shell = mountShell(onSave, true);
    shell.press('Enter');
    expect(onSave).not.toHaveBeenCalled();
    shell.unmount();
  });
});

describe('toast', () => {
  it('renders queued toasts inside a polite status region', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    act(() => root.render(<ToastViewport />));
    act(() => {
      toast({ title: 'Image uploaded' });
    });
    const region = document.body.querySelector('[role="status"]');
    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.textContent).toContain('Image uploaded');
    act(() => root.unmount());
    container.remove();
  });

  it('auto-dismisses after its duration', () => {
    vi.useFakeTimers();
    toast({ title: 'Link copied', duration: 1000 });
    expect(getToasts()).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    expect(getToasts()).toHaveLength(0);
  });

  it('keeps a loading toast until it is updated', () => {
    vi.useFakeTimers();
    const id = toast({ title: 'Uploading 2 images…', tone: 'loading' });
    vi.advanceTimersByTime(10_000);
    expect(getToasts()).toHaveLength(1);
    updateToast(id, { title: 'Images uploaded', tone: 'success', duration: 500 });
    expect(getToasts()[0].title).toBe('Images uploaded');
    vi.advanceTimersByTime(500);
    expect(getToasts()).toHaveLength(0);
  });
});

describe('dialog stack', () => {
  it('maps a width to the dialog width variable', () => {
    expect(dialogWidthStyle(560)).toEqual({ '--rc-dialog-width': '560px' });
    expect(dialogWidthStyle('lg')).toEqual({ '--rc-dialog-width': '400px' });
    expect(dialogWidthStyle(undefined)).toEqual({});
  });

  it('stays open when confirmDismiss declines', async () => {
    presentDialog({ content: () => null, confirmDismiss: () => false });
    const [item] = getDialogStack();
    await requestDismissDialog(item.id);
    expect(getDialogStack()[0].open).toBe(true);
  });

  it('closes when confirmDismiss accepts', async () => {
    const onClose = vi.fn();
    presentDialog({ content: () => null, confirmDismiss: async () => true, onClose });
    const [item] = getDialogStack();
    await requestDismissDialog(item.id);
    expect(getDialogStack()[0].open).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
