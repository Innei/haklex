// @vitest-environment happy-dom
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, createEditor, type LexicalEditor } from 'lexical';
import { act, useEffect, useLayoutEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

import { EditorSurfaceHost } from '../src/components/EditorSurfaceHost';
import {
  ActiveEditorScope,
  EditorSurfacePlugin,
  EditorSurfacePlugins,
  type EditorSurfaceProps,
  EditorSurfaceProvider,
} from '../src/context/EditorSurfaceContext';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

describe('editor surface extension boundary', () => {
  it('installs a plugin surface before any full-document editable DOM is mounted', async () => {
    const attached: HTMLElement[] = [];
    let master: LexicalEditor | undefined;
    let retain: EditorSurfaceProps['retainSurface'];
    function Probe() {
      const [editor] = useLexicalComposerContext();
      useLayoutEffect(() => {
        master = editor;
        return editor.registerRootListener((element) => {
          if (element) attached.push(element);
        });
      }, [editor]);
      return null;
    }
    function Surface({ plugins, retainSurface }: EditorSurfaceProps) {
      retain = retainSurface;
      return <section data-custom="">{plugins}</section>;
    }
    function Fixture({ enabled }: { enabled: boolean }) {
      return (
        <LexicalComposer
          initialConfig={{
            namespace: 'surface-test',
            onError: (error) => {
              throw error;
            },
          }}
        >
          <EditorSurfaceProvider>
            <Probe />
            <EditorSurfacePlugins>
              <span data-plugin="">Injected</span>
            </EditorSurfacePlugins>
            <EditorSurfaceHost placeholder="Write" />
            {enabled && <EditorSurfacePlugin surface={Surface} />}
          </EditorSurfaceProvider>
        </LexicalComposer>
      );
    }
    const container = document.createElement('div');
    root = createRoot(container);
    await act(async () => root!.render(<Fixture enabled />));
    expect(container.querySelector('[data-custom] [data-plugin]')?.textContent).toBe('Injected');
    expect(master?.getRootElement()).toBeNull();
    expect(attached).toHaveLength(0);

    const state = master!.getEditorState();
    let release = () => {};
    await act(async () => {
      release = retain!();
    });
    await act(async () => root!.render(<Fixture enabled={false} />));
    expect(container.querySelector('[data-custom]')).not.toBeNull();
    expect(attached).toHaveLength(0);
    await act(async () => release());
    expect(container.querySelector('[contenteditable="true"]')).not.toBeNull();
    expect(container.querySelector('[data-plugin]')?.textContent).toBe('Injected');
    expect(attached).toHaveLength(1);
    expect(master!.getEditorState()).toBe(state);
  });

  it('lets an explicit default-surface override win over a plugin without mounting its view', async () => {
    let mounts = 0;
    function Surface() {
      useLayoutEffect(() => {
        mounts++;
      }, []);
      return <section />;
    }
    const container = document.createElement('div');
    root = createRoot(container);
    await act(async () =>
      root!.render(
        <LexicalComposer
          initialConfig={{
            namespace: 'surface-priority',
            onError: (error) => {
              throw error;
            },
          }}
        >
          <EditorSurfaceProvider>
            <EditorSurfaceHost />
            <EditorSurfacePlugin surface={Surface} />
            <EditorSurfacePlugin priority={1} surface={null} />
          </EditorSurfaceProvider>
        </LexicalComposer>,
      ),
    );
    expect(mounts).toBe(0);
    expect(container.querySelector('[contenteditable="true"]')).not.toBeNull();
  });

  it('routes editor UI to the active surface editor while preserving the document editor', async () => {
    let activate: EditorSurfaceProps['onActiveEditorChange'];
    let documentEditor: LexicalEditor | undefined;
    let uiEditor: LexicalEditor | undefined;
    function Probe() {
      const [editor] = useLexicalComposerContext();
      uiEditor = editor;
      const [canUndo, setCanUndo] = useState(false);
      useEffect(
        () =>
          editor.registerCommand(
            CAN_UNDO_COMMAND,
            (value) => {
              setCanUndo(value);
              return false;
            },
            COMMAND_PRIORITY_LOW,
          ),
        [editor],
      );
      return <button disabled={!canUndo}>Undo</button>;
    }
    function Surface({ onActiveEditorChange }: EditorSurfaceProps) {
      [documentEditor] = useLexicalComposerContext();
      activate = onActiveEditorChange;
      return null;
    }
    const container = document.createElement('div');
    root = createRoot(container);
    await act(async () =>
      root!.render(
        <LexicalComposer
          initialConfig={{
            namespace: 'surface-active',
            onError: (error) => {
              throw error;
            },
          }}
        >
          <EditorSurfaceProvider>
            <EditorSurfaceHost />
            <EditorSurfacePlugin surface={Surface} />
            <ActiveEditorScope>
              <Probe />
            </ActiveEditorScope>
          </EditorSurfaceProvider>
        </LexicalComposer>,
      ),
    );
    const nested = documentEditor!.read(() => {
      // A real editor instance, independent from the full-document model.
      return createEditor();
    });
    await act(async () => activate!(nested));
    expect(uiEditor).toBe(nested);
    expect(documentEditor!.getRootElement()).toBeNull();
    await act(async () => {
      documentEditor!.dispatchCommand(CAN_UNDO_COMMAND, true);
    });
    expect(container.querySelector('button')!.disabled).toBe(false);
  });
});
