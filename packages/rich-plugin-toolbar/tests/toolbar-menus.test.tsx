// @vitest-environment happy-dom
import { getCommandMeta } from '@haklex/rich-editor/command-registry';
import { DropdownMenu, DropdownMenuContent } from '@haklex/rich-editor-ui';
import { getBuiltinItems, SlashMenuItem } from '@haklex/rich-plugin-slash-menu';
import { ListItemNode, ListNode } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { createEditor, DecoratorNode } from 'lexical';
import { act, isValidElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { blockTypeItems } from '../src/block-types';
import { formattingButtons } from '../src/entries';
import { InsertMenu } from '../src/InsertMenu';
import { ToolbarButton } from '../src/ToolbarButton';
import { ToolbarDropdown } from '../src/ToolbarDropdown';
import { ToolbarMenuItems } from '../src/ToolbarOverflowMenu';
import { ToolbarPlugin } from '../src/ToolbarPlugin';
import { INITIAL_TOOLBAR_STATE } from '../src/use-toolbar-state';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = '';
});

async function render(node: React.ReactNode) {
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node));
}

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

class FakeCodeBlockNode extends DecoratorNode<null> {
  static getType() {
    return 'code-block';
  }

  static clone(node: FakeCodeBlockNode) {
    return new FakeCodeBlockNode(node.__key);
  }

  static importJSON() {
    return new FakeCodeBlockNode();
  }

  createDOM() {
    return document.createElement('div');
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return null;
  }
}

const editor = createEditor({
  nodes: [FakeCodeBlockNode],
  onError: (error) => {
    throw error;
  },
});

describe('toolbar block type menu', () => {
  it('offers every Turn into type with registry names, including Quote and Code block', () => {
    const items = blockTypeItems(editor, 'h2');
    expect(items.map((item) => item.label)).toEqual([
      'Text',
      'Heading 1',
      'Heading 2',
      'Heading 3',
      'Bulleted list',
      'Numbered list',
      'To-do list',
      'Quote',
      'Code block',
    ]);
    expect(items.filter((item) => item.active).map((item) => item.label)).toEqual(['Heading 2']);
  });

  it('uses the same title and icon for a type as the slash menu', () => {
    const slashHeading = getBuiltinItems().find((item) => item.title === 'Heading 2');
    const toolbarHeading = blockTypeItems(editor, 'paragraph').find(
      (item) => item.label === 'Heading 2',
    );
    const icon = getCommandMeta('h2')!.icon;
    expect(isValidElement(slashHeading?.icon) && slashHeading.icon.type).toBe(icon);
    expect(isValidElement(toolbarHeading?.icon) && toolbarHeading.icon.type).toBe(icon);
  });

  it('marks the active item with a check', async () => {
    await render(
      <ToolbarDropdown
        label="Heading 2"
        title="Block type"
        items={[
          { label: 'Text', onSelect: () => {} },
          { label: 'Heading 2', active: true, onSelect: () => {} },
        ]}
      />,
    );
    const trigger = document.querySelector('button')!;
    await act(async () => trigger.click());
    await flush();

    const checked = document.querySelector('[role="menuitemradio"][aria-checked="true"]');
    expect(checked?.textContent).toContain('Heading 2');
    expect(checked?.querySelector('svg')).not.toBeNull();
  });
});

describe('toolbar buttons', () => {
  it('activates on click so Enter and Space work', async () => {
    const onClick = vi.fn();
    await render(<ToolbarButton icon={null} title="Bold" onClick={onClick} />);
    const button = document.querySelector('button')!;

    await act(async () => {
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(onClick).not.toHaveBeenCalled();

    await act(async () => button.click());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('labels the to-do list button in sentence case', () => {
    const labels = formattingButtons(editor, INITIAL_TOOLBAR_STATE)
      .flat()
      .map((spec) => spec.label);
    expect(labels).toContain('To-do list');
    expect(labels).not.toContain('Checklist');
  });

  it('shows toggled marks in the overflow menu with a check', async () => {
    await render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <ToolbarMenuItems
            items={[
              { label: 'Bold', active: true, onSelect: () => {} },
              { label: 'Italic', active: false, onSelect: () => {} },
              { label: 'Undo', onSelect: () => {} },
            ]}
          />
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await flush();

    const bold = [...document.querySelectorAll('[role="menuitemcheckbox"]')].find((node) =>
      node.textContent?.includes('Bold'),
    );
    expect(bold?.getAttribute('aria-checked')).toBe('true');
    const italic = [...document.querySelectorAll('[role="menuitemcheckbox"]')].find((node) =>
      node.textContent?.includes('Italic'),
    );
    expect(italic?.getAttribute('aria-checked')).toBe('false');
  });
});

describe('toolbar insert menu', () => {
  const items = [
    new SlashMenuItem('Image', { section: 'Media', description: 'Upload', onSelect: () => {} }),
    new SlashMenuItem('Video', { section: 'Media', onSelect: () => {} }),
    new SlashMenuItem('Code block', { section: 'Rich blocks', onSelect: () => {} }),
  ];

  async function open() {
    await render(<InsertMenu items={items} onSelect={() => {}} />);
    const trigger = document.querySelector('button[aria-label="Insert"]') as HTMLButtonElement;
    await act(async () => trigger.click());
    await flush();
    return document.querySelector('input[type="search"]') as HTMLInputElement;
  }

  async function type(input: HTMLInputElement, value: string) {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  it('shows the slash list with sections and a search field', async () => {
    const input = await open();
    expect(input).not.toBeNull();
    const sections = [...document.querySelectorAll('[data-slot="slash-menu-section"]')].map(
      (node) => node.textContent,
    );
    expect(sections).toEqual(['Media', 'Rich blocks']);
    expect(document.body.textContent).toContain('Upload');
  });

  it('filters by the search query', async () => {
    const input = await open();
    await type(input, 'vid');
    const options = [...document.querySelectorAll('[role="option"]')].map(
      (node) => node.textContent,
    );
    expect(options).toEqual(['Video']);

    await type(input, 'xyz');
    expect(document.querySelector('[data-slot="slash-menu-empty"]')?.textContent).toContain(
      'No blocks match “xyz”',
    );
  });

  it('runs the highlighted item on Enter', async () => {
    const onSelect = vi.fn();
    await render(<InsertMenu items={items} onSelect={onSelect} />);
    const trigger = document.querySelector('button[aria-label="Insert"]') as HTMLButtonElement;
    await act(async () => trigger.click());
    await flush();
    const input = document.querySelector('input[type="search"]') as HTMLInputElement;
    await type(input, 'code');
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(onSelect).toHaveBeenCalledWith(items[2]);
  });
});

describe('ToolbarPlugin', () => {
  it('opens the slash list from the + button', async () => {
    await render(
      <LexicalComposer
        initialConfig={{
          namespace: 'ToolbarPluginTest',
          nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
          onError: (error) => {
            throw error;
          },
        }}
      >
        <ToolbarPlugin />
      </LexicalComposer>,
    );
    const trigger = document.querySelector('button[aria-label="Insert"]') as HTMLButtonElement;
    await act(async () => trigger.click());
    await flush();

    const sections = [...document.querySelectorAll('[data-slot="slash-menu-section"]')].map(
      (node) => node.textContent,
    );
    expect(sections).toEqual(['Basic blocks', 'Lists', 'Layout']);
    expect(document.querySelector('input[type="search"]')).not.toBeNull();
  });
});
