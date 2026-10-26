import 'modern-normalize/modern-normalize.css';
import '@haklex/rich-editor/style.css';
import '@haklex/rich-renderer-image/style.css';
import '@haklex/rich-ext-dynamic/style.css';
import '../styles/base.css';
import '../styles/workbench.css';
import './style.css';

import { type BlockAnchorRenderer, RichRenderer } from '@haklex/rich-compose';
import type { ImageRendererProps } from '@haklex/rich-editor/renderers';
import { DynamicNode } from '@haklex/rich-ext-dynamic/static';
import { ImageRenderer } from '@haklex/rich-renderer-image/static';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { InspectorSection, OptionButton } from '../components/workbench/Inspector';
import { Workbench } from '../components/workbench/Workbench';
import { checkComplexState } from './complex';
import { fixture } from './fixtures';
import { exercise, frame, type Mode, RecyclingProbe, type Result, type Scenario } from './probe';

const modes: Record<Mode, string> = {
  baseline: '完整渲染',
  css: 'CSS 估高',
  measured: '实测回收 + 失效处理',
  stale: '过期缓存（负对照）',
};
const scenarios: Record<Scenario, string> = {
  text: '不同长度文字',
  mixed: '横图 / 竖图混排',
  late: '未知尺寸图片延迟加载',
  resize: '滚动中改变栏宽',
  revision: '离屏图片改为竖图',
  complex: '复杂节点与交互状态',
};
const tiny =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="16"/%3E';
const imageReady = new Set<string>();

function ProbeImage(props: ImageRendererProps) {
  const delayed = props.altText.startsWith('delayed-');
  const [ready, setReady] = useState(!delayed || imageReady.has(props.altText));
  const [loaded, setLoaded] = useState(!delayed || imageReady.has(props.altText));
  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(
      () => {
        setReady(true);
      },
      500 + (Number(props.altText.split('-')[1]) % 7) * 170,
    );
    return () => clearTimeout(timer);
  }, [props.altText, ready]);
  return (
    <div
      data-image-ready={loaded}
      onLoadCapture={(event) => {
        if ((event.target as HTMLImageElement).getAttribute('src') === props.src) {
          imageReady.add(props.altText);
          setLoaded(true);
        }
      }}
    >
      <ImageRenderer {...props} src={ready ? props.src : tiny} />
    </div>
  );
}
const rendererConfig = { Image: ProbeImage };
const extraNodes = [DynamicNode];

function Block({
  children,
  id,
  keepAlive,
  probe,
}: {
  children: ReactNode;
  id: string;
  keepAlive: boolean;
  probe: RecyclingProbe;
}) {
  const host = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(true);
  const retained = keepAlive && probe.mode === 'measured';
  useLayoutEffect(
    () => probe.register(id, host.current!, setMounted, retained),
    [id, probe, retained],
  );
  useLayoutEffect(() => {
    if (body.current) return probe.observeBody(id, body.current);
  }, [id, mounted, probe]);
  return (
    <div
      className="poc-block"
      data-mounted={mounted}
      data-probe-block={id}
      data-retained={retained}
      ref={host}
      style={mounted ? undefined : { height: probe.entries.get(id)?.height }}
    >
      {(mounted || retained) && (
        <div
          className="poc-block-body"
          ref={body}
          style={mounted ? undefined : { display: 'none' }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface Config {
  count: number;
  mode: Mode;
  scenario: Scenario;
  serial: number;
}
interface HarnessApi {
  mutate: () => void;
  probe: RecyclingProbe;
}

function Harness({
  config,
  onReady,
  theme,
}: {
  config: Config;
  onReady: (api: HarnessApi) => void;
  theme: 'light' | 'dark';
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);
  const [probe, setProbe] = useState<RecyclingProbe>();
  const [revised, setRevised] = useState(false);
  const value = useMemo(
    () => fixture(config.scenario, config.count, revised),
    [config.count, config.scenario, revised],
  );
  const statefulIds = useMemo(
    () =>
      new Set(
        value.root.children.flatMap((node, index) =>
          node.type === 'details' || node.type === 'dynamic' ? [`block-${index}`] : [],
        ),
      ),
    [value],
  );
  useLayoutEffect(() => {
    const instance = new RecyclingProbe(viewport.current!, config.mode);
    setProbe(instance);
    return () => instance.dispose();
  }, [config.mode]);
  const blockAnchor = useCallback<BlockAnchorRenderer>(
    (element, id) =>
      probe ? (
        <Block id={id} keepAlive={statefulIds.has(id)} key={id} probe={probe}>
          {element}
        </Block>
      ) : (
        element
      ),
    [probe, statefulIds],
  );
  useLayoutEffect(() => {
    if (probe)
      onReady({
        probe,
        mutate: () =>
          config.scenario === 'resize'
            ? column.current!.style.setProperty('width', '420px')
            : setRevised(true),
      });
  }, [config.scenario, onReady, probe]);
  return (
    <div
      aria-label="长文滚动测试区域"
      className="poc-viewport"
      ref={viewport}
      role="region"
      tabIndex={0}
    >
      <div className="poc-column" data-mode={config.mode} ref={column}>
        {probe && (
          <RichRenderer
            blockAnchor={blockAnchor}
            extraNodes={extraNodes}
            rendererConfig={rendererConfig}
            theme={theme}
            value={value}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  const [config, setConfig] = useState<Config>({
    mode: 'measured',
    scenario: 'complex',
    count: 360,
    serial: 0,
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState('可手动快速滚动，也可运行自动探针。');
  const [running, setRunning] = useState(false);
  const harness = useRef<HarnessApi>(null);
  const busy = useRef(false);
  const collected = useRef<Result[]>([]);
  const onReady = useCallback((api: HarnessApi) => {
    harness.current = api;
  }, []);

  const runCase = useCallback(async (mode: Mode, scenario: Scenario, count = 360) => {
    imageReady.clear();
    flushSync(() =>
      setConfig((previous) => ({ mode, scenario, count, serial: previous.serial + 1 })),
    );
    for (let i = 0; i < 8; i++) await frame();
    const api = harness.current!;
    if (api.probe.entries.size !== count)
      throw new Error(`Expected ${count} blocks, found ${api.probe.entries.size}`);
    const stateCheck = scenario === 'complex' ? await checkComplexState(api.probe) : undefined;
    const result = await exercise(api.probe, scenario, api.mutate);
    result.stateCheck = stateCheck;
    if (result.missedAnchors > 0 || result.samples !== 134)
      throw new Error(
        `Probe coverage too low: ${result.samples} samples / ${result.missedAnchors} missing anchors`,
      );
    collected.current.push(result);
    setResults([...collected.current]);
    return result;
  }, []);

  const run = useCallback(
    async (matrix: boolean) => {
      if (busy.current) return;
      busy.current = true;
      setRunning(true);
      collected.current = [];
      setResults([]);
      try {
        for (const scenario of matrix
          ? (Object.keys(scenarios) as Scenario[])
          : [config.scenario]) {
          for (const mode of matrix ? (Object.keys(modes) as Mode[]) : [config.mode]) {
            setStatus(`运行中：${scenarios[scenario]} / ${modes[mode]}`);
            await runCase(mode, scenario, config.count);
          }
        }
        if (matrix) {
          const baseline = collected.current.find(
            (result) => result.mode === 'baseline' && result.scenario === 'text',
          )!;
          const negative = collected.current.find(
            (result) => result.mode === 'stale' && result.scenario === 'resize',
          )!;
          if (baseline.maxDrift > 1 || negative.maxRestoreError < 100 || negative.maxDrift < 100) {
            throw new Error(
              'Calibration failed: expected stable baseline and detectable stale-height jumps',
            );
          }
        }
        setStatus(
          `已完成 ${collected.current.length} 组；包含复杂节点状态往返验证，尚未接入编辑器。`,
        );
        return collected.current;
      } catch (error) {
        setStatus(`探针失败：${String(error)}`);
        throw error;
      } finally {
        busy.current = false;
        setRunning(false);
      }
    },
    [config.count, config.mode, config.scenario, runCase],
  );

  useEffect(() => {
    Object.assign(window, {
      virtualizationPoc: {
        runMatrix: () => run(true),
        runCase,
        results: () => collected.current,
        running: () => busy.current,
      },
    });
  }, [run, runCase]);

  const update = (values: Partial<Config>) => {
    if (busy.current) return;
    imageReady.clear();
    setConfig((previous) => ({ ...previous, ...values, serial: previous.serial + 1 }));
  };
  const exportResults = () => {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { userAgent: navigator.userAgent, viewport: [innerWidth, innerHeight], results },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      ),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'haklex-virtualization-probe.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="app poc-app" data-theme={theme}>
      <Workbench
        meta={<span className="badge">独立 POC · RichRenderer</span>}
        panelLabel="探针控制"
        title="长文虚拟化探针"
        actions={
          <button
            className="btn"
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            切换明暗
          </button>
        }
        panel={
          <>
            <div aria-level={2} className="wb-panel-head" role="heading">
              实验设置
            </div>
            <InspectorSection title="回收策略">
              <div className="opt-list">
                {Object.entries(modes).map(([mode, label]) => (
                  <OptionButton
                    key={mode}
                    selected={mode === config.mode}
                    onClick={() => update({ mode: mode as Mode })}
                  >
                    {label}
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
            <InspectorSection title="内容场景">
              <div className="opt-list">
                {Object.entries(scenarios).map(([scenario, label]) => (
                  <OptionButton
                    key={scenario}
                    selected={scenario === config.scenario}
                    onClick={() => update({ scenario: scenario as Scenario })}
                  >
                    {label}
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
            <InspectorSection title="文档规模">
              <div className="opt-list">
                {[360, 1000, 2000].map((count) => (
                  <OptionButton
                    key={count}
                    selected={count === config.count}
                    onClick={() => update({ count })}
                  >
                    {count} 块
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
            <InspectorSection title="自动滚动">
              <div className="poc-actions">
                <button
                  className="btn"
                  disabled={running}
                  type="button"
                  onClick={() => {
                    void run(false);
                  }}
                >
                  运行当前组合
                </button>
                <button
                  className="btn btn-primary"
                  disabled={running}
                  type="button"
                  onClick={() => {
                    void run(true);
                  }}
                >
                  运行 {Object.keys(scenarios).length * Object.keys(modes).length} 组矩阵
                </button>
                <button
                  className="btn"
                  disabled={!results.length || running}
                  type="button"
                  onClick={exportResults}
                >
                  导出逐帧 JSON
                </button>
              </div>
              <p aria-live="polite" className="wb-section-text">
                {status}
              </p>
            </InspectorSection>
            <InspectorSection title="如何阅读结果">
              <p className="wb-section-text">
                轨迹漂移 = 同一文字锚点的实际移动 +
                本次主动滚动距离；落点漂移只跟踪主动滚动后视口中的锚点。超过 1px
                计一次异常帧。所有模式关闭原生 scroll
                anchoring；实测模式自行补偿。跨帧采样不能证明合成线程内没有闪动。
              </p>
              <p className="wb-section-text">
                实测模式保留折叠面板与动态组件的实例，离屏只隐藏，不销毁内部状态；普通块继续卸载。保留的后台副作用不会暂停。整块回收会影响原生查找及复制。图片取自
                Picsum，已保存本地。
              </p>
            </InspectorSection>
          </>
        }
      >
        <Harness config={config} key={config.serial} theme={theme} onReady={onReady} />
      </Workbench>
      <section aria-label="测量结果" className="poc-results" tabIndex={0}>
        <table>
          <caption>自动探针结果 · 每步约 900px，含停留、反向与远距离跳转</caption>
          <thead>
            <tr>
              <th>场景 / 策略</th>
              <th>轨迹漂移</th>
              <th>落点漂移</th>
              <th>P95</th>
              <th>异常帧</th>
              <th>恢复高度差</th>
              <th>最少活跃</th>
              <th>离屏实例</th>
              <th>交互状态</th>
              <th>占位采样</th>
              <th>最长帧</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, i) => (
              <tr key={i}>
                <td>
                  {scenarios[result.scenario]} / {modes[result.mode]}
                </td>
                <td>{result.maxDrift.toFixed(2)}px</td>
                <td>{result.maxLandingDrift.toFixed(2)}px</td>
                <td>{result.p95Drift.toFixed(2)}px</td>
                <td>
                  {result.driftFrames}/{result.samples}
                </td>
                <td>{result.maxRestoreError.toFixed(2)}px</td>
                <td>
                  {result.minMounted}/{result.blocks}
                </td>
                <td>{result.retainedBodies}</td>
                <td>
                  {result.stateCheck
                    ? result.stateCheck.preserved
                      ? '保持'
                      : '丢失（负对照）'
                    : '—'}
                </td>
                <td>{result.placeholderSamples}</td>
                <td>{result.maxFrameMs.toFixed(1)}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
