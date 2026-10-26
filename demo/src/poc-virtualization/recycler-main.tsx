import 'modern-normalize/modern-normalize.css';
import '@haklex/rich-editor/style.css';
import '@haklex/rich-renderer-image/style.css';
import '@haklex/rich-ext-dynamic/style.css';
import '../styles/base.css';
import '../styles/workbench.css';
import './style.css';
import './recycler.css';

import type { SerializedEditorState } from 'lexical';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { InspectorSection, OptionButton } from '../components/workbench/Inspector';
import { Workbench } from '../components/workbench/Workbench';
import portrait from './assets/portrait.jpg';
import { fixture } from './fixtures';
import type { Scenario } from './probe';
import { checkRecyclerState, runRecyclerScroll } from './recycler-checks';
import { RecyclerModel } from './recycler-model';
import { createRenderPlan } from './recycler-plan';
import { RecyclerContents } from './recycler-view';

const scenarios: Record<Scenario, string> = {
  complex: '复杂节点与状态',
  text: '长短文字',
  mixed: '图文混排',
  late: '延迟无尺寸图片',
  resize: '改宽重排',
  revision: '更新离屏图片',
};
type Stats = ReturnType<RecyclerModel['stats']>;

const Surface = memo(function Surface({
  count,
  scenario,
  width,
  theme,
  onReady,
}: {
  count: number;
  scenario: Scenario;
  width: number;
  theme: 'light' | 'dark';
  onReady: (model: RecyclerModel | null, error?: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<RecyclerModel | null>(null);
  useEffect(() => {
    let disposed = false;
    let instance: RecyclerModel | undefined;
    onReady(null);
    setModel(null);
    root.current!.scrollTop = 0;
    const timer = setTimeout(() => {
      if (disposed) return;
      try {
        instance = new RecyclerModel(
          root.current!,
          canvas.current!,
          createRenderPlan(fixture(scenario, count, false)),
        );
        setModel(instance);
        onReady(instance);
      } catch (error) {
        onReady(null, String(error));
      }
    }, 30);
    return () => {
      disposed = true;
      clearTimeout(timer);
      instance?.dispose();
    };
  }, [count, onReady, scenario]);
  return (
    <div
      aria-label="Recycler 文档滚动区"
      className="poc-viewport"
      ref={root}
      role="region"
      tabIndex={0}
    >
      <div className="recycler-canvas" ref={canvas} style={{ width }}>
        {model && <RecyclerContents model={model} theme={theme} />}
      </div>
    </div>
  );
});

function App() {
  const [count, setCount] = useState(2000);
  const [scenario, setScenario] = useState<Scenario>('complex');
  const [width, setWidth] = useState(720);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState('正在建立文档索引…');
  const [busy, setBusy] = useState(false);
  const model = useRef<RecyclerModel | null>(null);
  const lastResult = useRef<unknown>(null);
  const onReady = useCallback((instance: RecyclerModel | null, error?: string) => {
    model.current = instance;
    setStats(instance?.stats() ?? null);
    setStatus(
      error ??
        (instance ? '已就绪。可手动快速滚动，观察槽位数量与复用次数。' : '正在建立文档索引…'),
    );
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      if (model.current) setStats(model.current.stats());
    }, 250);
    return () => clearInterval(timer);
  }, []);
  const run = useCallback(async (state: boolean) => {
    if (!model.current) throw new Error('Recycler is not ready');
    setBusy(true);
    setStatus(state ? '正在验证状态与跨块隔离…' : '正在运行滚动探针…');
    try {
      const result = state
        ? await checkRecyclerState(model.current)
        : await runRecyclerScroll(model.current);
      lastResult.current = result;
      setStatus(
        'maxSlots' in result
          ? `探针完成：最多 ${result.maxSlots} 槽位，落点漂移 ${result.maxLandingDrift.toFixed(2)}px，锚点缺失 ${result.missedAnchors}/240。可导出记录。`
          : '通过：展开、计数、答题状态恢复，其他块没有串状态。',
      );
      return result;
    } catch (error) {
      setStatus(String(error));
      throw error;
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    Object.assign(window, {
      recyclerPoc: {
        model: () => model.current,
        stats: () => model.current?.stats(),
        goTo: (index: number) => model.current?.scrollTo(index),
        checkState: () => run(true),
        scrollProbe: () => run(false),
        result: () => lastResult.current,
      },
    });
  }, [run]);
  const revise = () => {
    const current = model.current;
    if (!current || current.plan.rows[2]?.data.type !== 'image') return;
    const value = current.plan.value;
    const children = value.root.children.map((node, index) =>
      index === 2 ? { ...node, src: portrait, width: 700, height: 1100 } : node,
    );
    current.replace(
      createRenderPlan({ ...value, root: { ...value.root, children } } as SerializedEditorState),
    );
    setStatus('第 3 块图片已更新；只重新测量活跃槽位。');
  };
  const download = () => {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              userAgent: navigator.userAgent,
              stats: model.current?.stats(),
              result: lastResult.current,
            },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      ),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'haklex-recycler.json';
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <main className="app poc-app" data-theme={theme}>
      <Workbench
        panelLabel="Recycler 控制"
        title="按类型复用 · Recycler POC"
        actions={
          <button
            className="btn"
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            切换明暗
          </button>
        }
        meta={
          <span className="badge">
            {stats ? `${stats.slots} 槽位 / ${stats.blocks} 块` : '建立索引中'}
          </span>
        }
        panel={
          <>
            <div aria-level={2} className="wb-panel-head" role="heading">
              实验设置
            </div>
            <InspectorSection title="文档规模">
              <div className="opt-list">
                {[360, 2000, 20000].map((value) => (
                  <OptionButton
                    key={value}
                    selected={value === count}
                    onClick={() => {
                      if (!busy) setCount(value);
                    }}
                  >
                    {value.toLocaleString()} 块
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
            <InspectorSection title="内容">
              <div className="opt-list">
                {Object.entries(scenarios).map(([value, label]) => (
                  <OptionButton
                    key={value}
                    selected={value === scenario}
                    onClick={() => {
                      if (!busy) setScenario(value as Scenario);
                    }}
                  >
                    {label}
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
            <InspectorSection title="布局">
              <div className="opt-list">
                {[720, 420].map((value) => (
                  <OptionButton
                    key={value}
                    selected={width === value}
                    onClick={() => setWidth(value)}
                  >
                    {value}px 阅读宽度
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
            <InspectorSection title="操作">
              <div className="poc-actions">
                <button
                  className="btn"
                  disabled={!stats || busy}
                  type="button"
                  onClick={() => model.current?.scrollTo(0)}
                >
                  回到顶部
                </button>
                <button
                  className="btn"
                  disabled={!stats || busy}
                  type="button"
                  onClick={() => model.current?.scrollTo(Math.floor(count * 0.7))}
                >
                  跳到 70%
                </button>
                <button
                  className="btn"
                  disabled={!stats || busy || scenario !== 'complex'}
                  type="button"
                  onClick={() => {
                    void run(true).catch(() => {});
                  }}
                >
                  验证状态往返
                </button>
                <button
                  className="btn"
                  disabled={!stats || busy}
                  type="button"
                  onClick={() => {
                    void run(false).catch(() => {});
                  }}
                >
                  运行滚动探针
                </button>
                <button
                  className="btn"
                  disabled={!stats || busy || scenario === 'complex' || scenario === 'text'}
                  type="button"
                  onClick={revise}
                >
                  替换第 3 块图片
                </button>
                <button className="btn" disabled={!stats || busy} type="button" onClick={download}>
                  导出记录
                </button>
              </div>
              <p aria-live="polite" className="wb-section-text">
                {status}
              </p>
            </InspectorSection>
            <InspectorSection title="验证边界">
              <p className="wb-section-text">
                一个总高度容器，少量按类型复用的槽位。状态按 blockId 保存；离屏块没有独立占位
                DOM。冷跳转与改宽仍可能发生高度校正。此页验证阅读态，不包含编辑、全文原生搜索与跨屏选择。
              </p>
              <a className="btn" href="./virtualization-poc.html">
                打开旧 POC 对照
              </a>
            </InspectorSection>
          </>
        }
      >
        <Surface count={count} scenario={scenario} theme={theme} width={width} onReady={onReady} />
      </Workbench>
      <section aria-label="复用池统计" className="poc-results" tabIndex={0}>
        <div className="recycler-summary">
          {stats
            ? `活跃 ${stats.active} · 驻留槽位 ${stats.slots} · 累计创建 ${stats.created} · 换绑复用 ${stats.reused} · 淘汰 ${stats.disposed} · DOM ${stats.domNodes} + Shadow ${stats.shadowNodes} · 已测 ${stats.measured}/${stats.blocks} · 组件挂载 ${stats.widgetMounts} / 换绑 ${stats.widgetBinds}`
            : '加载中…'}
        </div>
        <table>
          <caption>类型池 · 实例不足才扩容，空闲槽位有统一上限</caption>
          <thead>
            <tr>
              <th>渲染类型</th>
              <th>活跃</th>
              <th>空闲</th>
            </tr>
          </thead>
          <tbody>
            {stats?.pools.map((pool) => (
              <tr key={pool.type}>
                <td className="mono">{pool.type}</td>
                <td>{pool.active}</td>
                <td>{pool.idle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
