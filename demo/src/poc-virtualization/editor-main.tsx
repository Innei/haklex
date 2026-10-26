import 'modern-normalize/modern-normalize.css';
import '@haklex/rich-editor/style.css';
import '@haklex/rich-renderer-image/style.css';
import '@haklex/rich-ext-dynamic/style.css';
import '../styles/base.css';
import '../styles/workbench.css';
import './style.css';
import './recycler.css';

import { RichEditor } from '@haklex/rich-editor';
import { VirtualizationPlugin } from '@haklex/rich-editor/virtualization';
import { DynamicEditNode } from '@haklex/rich-ext-dynamic';
import { ImageRenderer } from '@haklex/rich-renderer-image/static';
import type { LexicalEditor } from 'lexical';
import { REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { EditorRecycler } from '../../../packages/rich-editor/src/virtualization/controller';
import { InspectorSection, OptionButton } from '../components/workbench/Inspector';
import { Workbench } from '../components/workbench/Workbench';
import { checkEditorLayout } from './editor-checks';
import { fixture } from './fixtures';
import type { Scenario } from './probe';

const nodes = [DynamicEditNode];
const renderers = { Image: ImageRenderer };
type Mode = 'default' | 'props' | 'plugin';

function App() {
  const [count, setCount] = useState(2000);
  const [scenario, setScenario] = useState<Scenario>('complex');
  const [mode, setMode] = useState<Mode>('props');
  const [width, setWidth] = useState(720);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [external, setExternal] = useState(true);
  const [preserveCapacity, setPreserveCapacity] = useState(32);
  const [stats, setStats] = useState('初始化编辑器…');
  const [status, setStatus] = useState('可直接输入，或滚到远处再返回检查内容。');
  const master = useRef<LexicalEditor | null>(null);
  const saved = useRef<unknown>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const value = useMemo(() => fixture(scenario, count, false), [scenario, count]);
  const options = useMemo(
    () => ({ scrollContainer: external ? scroll : undefined, preserveCapacity }),
    [external, preserveCapacity],
  );
  const controller = () =>
    (
      scroll.current?.querySelector('[data-virtual-editor]') as HTMLElement & {
        virtualEditor?: EditorRecycler;
      }
    )?.virtualEditor;
  useEffect(() => {
    const api = {
      master: () => master.current,
      controller,
      goTo: (index: number) => controller()?.scrollTo(index),
      focus: (index: number) => controller()?.focusBlock(index),
      snapshot: () => master.current?.getEditorState().toJSON(),
      saved: () => saved.current,
      checkLayout: () => checkEditorLayout(controller()!),
      stats: () => {
        const c = controller();
        return {
          blocks: c?.rows.length,
          slots: c?.pool.slots.length,
          active: c?.pool.slots.filter((s) => s.active).length,
          reused: c?.pool.reused,
          created: c?.pool.created,
          preserved: c?.preserve.size,
          preserveHits: c?.preserve.hits,
          evictions: c?.preserve.evictions,
          dom: scroll.current?.querySelectorAll('*').length,
          masterHasDOM: !!master.current?.getRootElement(),
        };
      },
    };
    Object.assign(window, { editorRecyclerPoc: api });
    const timer = setInterval(() => setStats(JSON.stringify(api.stats())), 250);
    return () => clearInterval(timer);
  }, []);
  return (
    <main className="app poc-app" data-theme={theme}>
      <Workbench
        panelLabel="Editor Recycler 控制"
        title="Editor · Recycler POC"
        actions={
          <button className="btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            切换明暗
          </button>
        }
        panel={
          <>
            <div className="wb-panel-head">编辑器实验</div>
            <InspectorSection title="接入方式">
              <div className="opt-list">
                {(
                  [
                    ['props', 'Props 开启'],
                    ['plugin', '插件注入'],
                    ['default', '默认关闭'],
                  ] as const
                ).map(([key, label]) => (
                  <OptionButton key={key} selected={mode === key} onClick={() => setMode(key)}>
                    {label}
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
            <InspectorSection title="文档规模">
              <div className="opt-list">
                {[360, 2000, 20000].map((n) => (
                  <OptionButton key={n} selected={count === n} onClick={() => setCount(n)}>
                    {n.toLocaleString()} 块
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
            <InspectorSection title="离屏保留预算">
              <div className="opt-list">
                {[0, 4, 32].map((n) => (
                  <OptionButton
                    key={n}
                    selected={preserveCapacity === n}
                    onClick={() => setPreserveCapacity(n)}
                  >
                    {n === 0 ? '0 · 始终保存与还原' : `${n} · 超限 LRU 回退`}
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
            <InspectorSection title="内容">
              <div className="opt-list">
                {(
                  [
                    ['complex', '复杂节点与状态'],
                    ['text', '长短文字'],
                    ['mixed', '图文混排'],
                  ] as const
                ).map(([key, label]) => (
                  <OptionButton
                    key={key}
                    selected={scenario === key}
                    onClick={() => setScenario(key)}
                  >
                    {label}
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
            <InspectorSection title="滚动与布局">
              <div className="opt-list">
                <OptionButton selected={external} onClick={() => setExternal(true)}>
                  指定外层 ScrollView
                </OptionButton>
                <OptionButton selected={!external} onClick={() => setExternal(false)}>
                  自动查找滚动容器
                </OptionButton>
                {[720, 420].map((n) => (
                  <OptionButton key={n} selected={width === n} onClick={() => setWidth(n)}>
                    {n}px 阅读宽度
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
            <InspectorSection title="操作">
              <div className="poc-actions">
                <button className="btn" onClick={() => controller()?.scrollTo(0)}>
                  回到顶部
                </button>
                <button
                  className="btn"
                  onClick={() => controller()?.scrollTo(Math.floor(count * 0.7))}
                >
                  跳到 70%
                </button>
                <button
                  className="btn"
                  onClick={() => master.current?.dispatchCommand(UNDO_COMMAND, undefined)}
                >
                  撤销全文编辑
                </button>
                <button
                  className="btn"
                  onClick={() => master.current?.dispatchCommand(REDO_COMMAND, undefined)}
                >
                  重做全文编辑
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    const c = controller();
                    if (c)
                      void checkEditorLayout(c)
                        .then((r) =>
                          setStatus(`布局通过：${r.checked} 个编辑实例 / ${r.blocks} 块`),
                        )
                        .catch((error) => setStatus(String(error)));
                  }}
                >
                  检查布局
                </button>
              </div>
              <p aria-live="polite" className="wb-section-text">
                {status}
              </p>
            </InspectorSection>
            <InspectorSection title="POC 边界">
              <p className="wb-section-text">
                视口内是真实 Lexical 编辑器，全文状态在主 editor。输入块及 IME 期间固定保留；Enter
                拆出的连续块临时共用一个编辑实例。跨实例的原生拖选、全选、协作及外部浮动工具栏尚未接通。切换文档、模式会重置实验。
              </p>
            </InspectorSection>
          </>
        }
      >
        <div
          aria-label="Editor ScrollView"
          className="poc-viewport"
          ref={scroll}
          role="region"
          tabIndex={0}
        >
          <div className="poc-column" style={{ width }}>
            <p className="recycler-summary">
              这是 ScrollView 内、编辑器外的前置内容，用于检查锚定偏移。
            </p>
            <RichEditor
              extraNodes={nodes}
              initialValue={value}
              key={`${count}:${scenario}:${mode}:${external}:${preserveCapacity}`}
              rendererConfig={renderers}
              theme={theme}
              virtualization={mode === 'props' ? options : undefined}
              onChange={(state) => {
                saved.current = state;
              }}
              onEditorReady={(editor) => {
                master.current = editor;
              }}
            >
              {mode === 'plugin' && <VirtualizationPlugin {...options} />}
            </RichEditor>
            <p className="recycler-summary">编辑器后的 ScrollView 内容。</p>
          </div>
        </div>
      </Workbench>
      <div aria-live="polite" className="recycler-summary">
        {stats}
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
