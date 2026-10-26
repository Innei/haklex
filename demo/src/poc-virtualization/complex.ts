import type { SerializedLexicalNode } from 'lexical';

import {
  details,
  dynamic,
  image,
  list,
  listItem,
  paragraph,
  quote,
  table,
  tableCell,
  tableRow,
  text,
} from '../fixtures/helpers';
import landscape from './assets/landscape.jpg';
import { frame, type RecyclingProbe } from './probe';

export function complexNode(index: number): SerializedLexicalNode {
  const photo = () =>
    image({ src: landscape, altText: `面板图片 ${index}`, width: 1200, height: 700 });
  switch (index % 12) {
    case 1: {
      return details(
        `面板 ${index} · 默认收起，展开后应保持`,
        false,
        paragraph(text('这里包含图片、嵌套面板和长段落。展开状态属于当前阅读会话。'.repeat(5))),
        photo(),
        details(
          `内层面板 ${index} · 独立展开状态`,
          false,
          quote(paragraph(text('内层状态也需要保留。'.repeat(12)))),
        ),
      );
    }
    case 2: {
      return dynamic({
        url: '/dynamic-widgets/counter.mjs',
        initialHeight: 180,
        props: { title: `交互计数器 ${index}`, step: 1 },
      });
    }
    case 3: {
      return dynamic({
        url: '/dynamic-widgets/quiz.mjs',
        initialHeight: 320,
        props: {
          question: `问题 ${index}：离屏之后应该保留什么？`,
          options: ['只保留高度', '展开状态和交互状态', '重新初始化所有组件'],
          answer: 1,
        },
      });
    }
    case 4: {
      return table(
        tableRow(
          ...['项目', '内容', '验证点'].map((label) => tableCell(1, paragraph(text(label)))),
        ),
        ...Array.from({ length: 4 }, (_, row) =>
          tableRow(
            tableCell(0, paragraph(text(`记录 ${row + 1}`))),
            tableCell(0, paragraph(text('表格单元格包含不同长度的内容。'.repeat(row + 1)))),
            tableCell(0, paragraph(text('滚动与恢复后的行高'))),
          ),
        ),
      );
    }
    case 5: {
      return quote(
        paragraph(text('引用中的长段落。'.repeat(35))),
        paragraph(text('第二段引文，测试嵌套结构的测量。'.repeat(8))),
      );
    }
    case 6: {
      return list(
        'number',
        listItem(text('第一项')),
        listItem(text('第二项：'.repeat(20))),
        listItem(
          list(
            'bullet',
            listItem(text('嵌套列表')),
            listItem(text('不同深度仍使用同一个顶层测量盒。')),
          ),
        ),
      );
    }
    case 7: {
      return details(
        `面板 ${index} · 默认展开，可手动收起`,
        true,
        paragraph(text('关闭后滚走再回来，应该继续保持关闭。'.repeat(12))),
        photo(),
      );
    }
    case 8: {
      return {
        type: 'code',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        language: 'typescript',
        children: [
          text(
            'const cachedHeight = measure(block);\n// 保留真实交互状态，再决定是否回收视图。\n'.repeat(
              5,
            ),
          ),
        ],
      } as SerializedLexicalNode;
    }
    default: {
      return paragraph(
        text(
          `第 ${index + 1} 块。复杂节点之间仍保留长短不同的文字。${'滚动、恢复和节点内部状态需要分别验证。'.repeat(2 + (index % 14))}`,
        ),
      );
    }
  }
}

export interface StateCheck {
  after: StateCheck['before'];
  before: {
    outerOpen: boolean;
    innerOpen: boolean;
    defaultOpenPanel: boolean;
    count: string;
    feedback: string;
  };
  detailsInstanceRetained: boolean;
  dynamicInstanceRetained: boolean;
  interactionMaxCorrection: number;
  interactionMaxRestoreError: number;
  preserved: boolean;
  wasDeactivated: boolean;
  wasOffscreen: boolean;
}

async function waitFor<T>(read: () => T | undefined | null | false): Promise<T> {
  for (let i = 0; i < 240; i++) {
    const value = read();
    if (value) return value;
    await frame();
  }
  throw new Error('Complex node did not become ready');
}

function block(probe: RecyclingProbe, index: number) {
  return probe.entries.get(`block-${index}`)!.element;
}

async function visit(probe: RecyclingProbe, index: number) {
  const target = block(probe, index);
  probe.root.scrollTop +=
    target.getBoundingClientRect().top - probe.root.getBoundingClientRect().top - 24;
  await waitFor(() => probe.entries.get(`block-${index}`)!.mounted);
  for (let i = 0; i < 3; i++) await frame();
  return target;
}

function shadow(probe: RecyclingProbe, index: number) {
  return block(probe, index).querySelector('.rich-dynamic-host')?.shadowRoot;
}

export async function checkComplexState(probe: RecyclingProbe): Promise<StateCheck> {
  probe.corrections.length = 0;
  probe.restoreErrors.length = 0;
  await visit(probe, 1);
  const panels = block(probe, 1).querySelectorAll('details');
  panels[0].querySelector('summary')!.click();
  panels[1].querySelector('summary')!.click();
  const outerOpen = panels[0].open;
  const innerOpen = panels[1].open;
  const detailsInstance = panels[0];
  await visit(probe, 7);
  block(probe, 7).querySelector('summary')!.click();
  const defaultOpenPanelBefore = block(probe, 7).querySelector('details')!.open;
  await visit(probe, 2);
  const counter = await waitFor(() =>
    shadow(probe, 2)?.querySelector<HTMLElement>('[data-op="inc"]'),
  );
  for (let i = 0; i < 3; i++) counter.click();
  const counterInstance = shadow(probe, 2)!.querySelector('.count')!;
  const countBefore = counterInstance.textContent ?? '';
  await visit(probe, 3);
  const answer = await waitFor(
    () => shadow(probe, 3)?.querySelectorAll<HTMLButtonElement>('.option')[1],
  );
  answer.click();
  const feedbackBefore = shadow(probe, 3)!.querySelector('.feedback')!.textContent ?? '';
  for (let i = 0; i < 30; i++) await frame();

  const before = {
    outerOpen,
    innerOpen,
    defaultOpenPanel: defaultOpenPanelBefore,
    count: countBefore,
    feedback: feedbackBefore,
  };
  if (
    !outerOpen ||
    !innerOpen ||
    defaultOpenPanelBefore ||
    countBefore !== '3' ||
    !feedbackBefore.startsWith('Correct!')
  )
    throw new Error('Complex interactions were not applied');
  probe.root.scrollTop = probe.root.scrollHeight * 0.7;
  for (let i = 0; i < 12; i++) await frame();
  const bounds = block(probe, 2).getBoundingClientRect();
  const viewport = probe.root.getBoundingClientRect();
  const wasOffscreen = bounds.bottom < viewport.top || bounds.top > viewport.bottom;
  const wasDeactivated = !probe.entries.get('block-2')!.mounted;
  const detailsInstanceRetained = Boolean(detailsInstance?.isConnected);
  const dynamicInstanceRetained = Boolean(counterInstance?.isConnected);
  await visit(probe, 7);
  const defaultOpenPanel = block(probe, 7).querySelector('details')!.open;
  await visit(probe, 3);
  await waitFor(() => shadow(probe, 3)?.querySelector('.option'));
  const feedback = shadow(probe, 3)!.querySelector('.feedback')!.textContent ?? '';
  await visit(probe, 2);
  await waitFor(() => shadow(probe, 2)?.querySelector('.count'));
  const count = shadow(probe, 2)!.querySelector('.count')!.textContent ?? '';
  await visit(probe, 1);
  const restoredPanels = block(probe, 1).querySelectorAll('details');
  const after = {
    outerOpen: restoredPanels[0].open,
    innerOpen: restoredPanels[1].open,
    defaultOpenPanel,
    count,
    feedback,
  };
  const preserved = JSON.stringify(before) === JSON.stringify(after);
  if (!wasOffscreen) throw new Error('State probe did not leave the viewport');
  if ((probe.mode === 'measured' || probe.mode === 'stale') && !wasDeactivated)
    throw new Error('State probe did not deactivate the widget');
  if (
    (probe.mode === 'baseline' || probe.mode === 'css' || probe.mode === 'measured') &&
    !preserved
  )
    throw new Error(`State lost in ${probe.mode}: ${JSON.stringify(after)}`);
  if (probe.mode === 'stale' && preserved)
    throw new Error('State-loss negative control did not fail');
  probe.root.scrollTop = 0;
  for (let i = 0; i < 8; i++) await frame();
  const interactionMaxCorrection = Math.max(0, ...probe.corrections.map(Math.abs));
  const interactionMaxRestoreError = Math.max(0, ...probe.restoreErrors.map(Math.abs));
  probe.corrections.length = 0;
  probe.restoreErrors.length = 0;
  return {
    before,
    after,
    wasOffscreen,
    wasDeactivated,
    detailsInstanceRetained,
    dynamicInstanceRetained,
    interactionMaxCorrection,
    interactionMaxRestoreError,
    preserved,
  };
}
