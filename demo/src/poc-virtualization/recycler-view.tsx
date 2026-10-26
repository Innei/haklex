import { RichRenderer } from '@haklex/rich-compose';
import type { ImageRendererProps } from '@haklex/rich-editor/renderers';
import {
  ColorSchemeProvider,
  FootnoteDefinitionsProvider,
  getVariantClass,
  NestedContentRendererProvider,
  RendererConfigProvider,
} from '@haklex/rich-editor/static';
import type { DynamicHostRendererProps } from '@haklex/rich-ext-dynamic/static';
import { DynamicNode } from '@haklex/rich-ext-dynamic/static';
import { ImageRenderer } from '@haklex/rich-renderer-image/static';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import type { ReactElement, ReactNode } from 'react';
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { BuiltinNodeRenderer } from '../../../packages/rich-compose/src/static-renderer/types';
import type {
  DynamicMountHandle,
  DynamicMountInput,
} from '../../../packages/rich-dynamic-protocol/src';
import { isDynamicComponentModule } from '../../../packages/rich-dynamic-protocol/src';
import { isAllowedDynamicUrl } from '../fixtures/dynamic-catalog';
import type { RecyclerModel, Slot } from './recycler-model';

interface Binding {
  active: boolean;
  id: string;
  model: RecyclerModel;
}
const BindingContext = createContext<Binding | null>(null);
function useBinding() {
  return use(BindingContext)!;
}

function stableKeys(node: ReactNode, path = '0'): ReactNode {
  if (!isValidElement<{ children?: ReactNode }>(node)) return node;
  const children = node.props.children;
  return cloneElement(
    node,
    { key: path },
    children === undefined
      ? children
      : Children.map(children, (child, index) => stableKeys(child, `${path}.${index}`)),
  );
}

function PooledDetails({
  element,
  path,
  initialOpen,
}: {
  element: ReactNode;
  path: string;
  initialOpen: boolean;
}) {
  const { id, model, active } = useBinding();
  const [, redraw] = useState(0);
  const open = model.state(id).details[path] ?? initialOpen;
  const rendered = stableKeys(element) as ReactElement<Record<string, unknown>>;
  return cloneElement(rendered, {
    'data-details-path': path,
    'data-details-owner': id,
    open,
    'onToggle': (event: { currentTarget: HTMLDetailsElement }) => {
      if (!active || event.currentTarget.dataset.detailsOwner !== id) return;
      model.state(id).details[path] = event.currentTarget.open;
      redraw((value) => value + 1);
    },
  });
}

function PooledImage(props: ImageRendererProps) {
  const { id, model, active } = useBinding();
  const [, redraw] = useState(0);
  const delayed = props.altText.startsWith('delayed-');
  const ready = !delayed || model.state(id).imageReady;
  useEffect(() => {
    if (!active || ready) return;
    const timer = setTimeout(
      () => {
        model.state(id).imageReady = true;
        redraw((value) => value + 1);
      },
      500 + (Number(props.altText.split('-')[1]) % 7) * 170,
    );
    return () => clearTimeout(timer);
  }, [active, id, model, props.altText, ready]);
  return (
    <ImageRenderer
      {...props}
      src={
        ready
          ? props.src
          : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="16"/%3E'
      }
    />
  );
}

function PooledDynamic({ url, componentProps, initialHeight }: DynamicHostRendererProps) {
  const { id, model, active } = useBinding();
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<DynamicMountHandle | null>(null);
  const owner = useRef<string | undefined>(undefined);
  const theme = useTheme();
  const latest = useRef({
    id,
    input: { props: componentProps, host: { theme } } as DynamicMountInput,
  });
  latest.current = { id, input: { props: componentProps, host: { theme } } };
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const propsJson = JSON.stringify(componentProps);
  const capture = useCallback(() => {
    if (handle.current?.getState && owner.current)
      model.state(owner.current).dynamic = handle.current.getState();
  }, [model]);
  const bind = useCallback(() => {
    const widget = handle.current;
    if (!widget) return;
    capture();
    const next = latest.current;
    widget.update?.(next.input);
    widget.setState!(model.state(next.id).dynamic);
    owner.current = next.id;
    model.widgetBinds++;
  }, [capture, model]);

  useLayoutEffect(() => {
    if (active) bind();
    else capture();
    return capture;
  }, [active, bind, capture, id, propsJson, theme]);

  useEffect(() => {
    if (!isAllowedDynamicUrl(url)) {
      setError('组件 URL 不在本机测试目录内');
      return;
    }
    let cancelled = false;
    setLoaded(false);
    setError('');
    const shadow = host.current!.shadowRoot ?? host.current!.attachShadow({ mode: 'open' });
    shadow.replaceChildren();
    const container = document.createElement('div');
    container.style.minHeight = `${initialHeight}px`;
    shadow.append(container);
    import(/* @vite-ignore */ url)
      .then((module) => {
        if (cancelled) return;
        if (!isDynamicComponentModule(module.default)) throw new Error('组件没有实现 mount 协议');
        const widget = module.default.mount(container, latest.current.input);
        if (!widget.getState || !widget.setState) {
          widget.unmount();
          throw new Error('此组件没有实现运行状态保存与恢复');
        }
        handle.current = widget;
        widget.setState(model.state(latest.current.id).dynamic);
        owner.current = latest.current.id;
        model.widgetMounts++;
        setLoaded(true);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(String(reason));
      });
    return () => {
      cancelled = true;
      capture();
      handle.current?.unmount();
      if (handle.current) model.widgetUnmounts++;
      handle.current = null;
      owner.current = undefined;
    };
  }, [capture, model, url]);
  return (
    <div className="rich-dynamic-root" style={{ minHeight: initialHeight }}>
      <div className="rich-dynamic-host" ref={host} />
      {error ? (
        <p role="alert">{error}</p>
      ) : !loaded ? (
        <p className="recycler-loading">正在加载交互组件…</p>
      ) : null}
    </div>
  );
}

const ThemeContext = createContext<'light' | 'dark'>('light');
function useTheme() {
  return use(ThemeContext);
}
const rendererConfig = { Image: PooledImage, Dynamic: PooledDynamic };
const extraNodes = [DynamicNode];

function PoolSlot({ slot, model }: { slot: Slot; model: RecyclerModel }) {
  const row = model.plan.rows[slot.index];
  const binding = `${slot.generation}:${slot.active}`;
  const [settled, setSettled] = useState('');
  useLayoutEffect(() => {
    // Paint the restored state once before enabling user-triggered transitions.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setSettled(binding));
    });
    return () => cancelAnimationFrame(frame);
  }, [binding]);
  const content = useMemo(() => {
    model.renders++;
    const overrides: Record<string, BuiltinNodeRenderer> = {
      details: (node, key, _children, renderDefault) => (
        <PooledDetails
          element={renderDefault()}
          initialOpen={Boolean(node.open)}
          key={key}
          path={row.paths.get(key) ?? '0'}
        />
      ),
    };
    return stableKeys(model.plan.render(slot.index, overrides));
  }, [model, model.plan, row]);
  const value = useMemo(
    () => ({ id: row.id, model, active: slot.active }),
    [model, row.id, slot.active],
  );
  const ref = useCallback(
    (element: HTMLDivElement | null) => model.attach(slot, element),
    [model, slot],
  );
  useLayoutEffect(() => {
    slot.beforeRelease = () => {
      for (const details of slot.element?.querySelectorAll<HTMLDetailsElement>(
        'details[data-details-path]',
      ) ?? []) {
        if (details.dataset.detailsOwner === row.id)
          model.state(row.id).details[details.dataset.detailsPath!] = details.open;
      }
    };
    model.commit(slot);
    return () => {
      slot.beforeRelease = undefined;
    };
  }, [model, row, slot, slot.active, slot.generation]);
  return (
    <div
      className="recycler-slot"
      data-generation={slot.generation}
      data-pool={slot.pool}
      data-probe-block={slot.active ? row.id : undefined}
      data-recycler-restoring={settled !== binding ? '' : undefined}
      data-slot-id={slot.id}
      ref={ref}
      style={{
        display: slot.active ? undefined : 'none',
        transform: `translateY(${model.heights.offset(slot.index)}px)`,
      }}
    >
      <BindingContext value={value}>{content}</BindingContext>
    </div>
  );
}

export function RecyclerContents({
  model,
  theme,
}: {
  model: RecyclerModel;
  theme: 'light' | 'dark';
}) {
  const [, update] = useState(0);
  useLayoutEffect(() => model.subscribe(() => update((value) => value + 1)), [model]);
  const nested = useCallback(
    (value: Parameters<typeof RichRenderer>[0]['value']) => (
      <RichRenderer
        extraNodes={extraNodes}
        rendererConfig={rendererConfig}
        theme={theme}
        value={value}
      />
    ),
    [theme],
  );
  return (
    <ThemeContext value={theme}>
      <PortalThemeProvider className={getVariantClass('article')} theme={theme}>
        <ColorSchemeProvider colorScheme={theme}>
          <RendererConfigProvider config={rendererConfig} mode="renderer" variant="article">
            <FootnoteDefinitionsProvider
              definitions={model.plan.footnotes.definitions}
              displayNumberMap={model.plan.footnotes.displayNumberMap}
            >
              <NestedContentRendererProvider value={nested}>
                <div className={`rich-content ${getVariantClass('article')}`} data-theme={theme}>
                  {model.pool.slots.map((slot) => (
                    <PoolSlot key={slot.id} model={model} slot={slot} />
                  ))}
                </div>
              </NestedContentRendererProvider>
            </FootnoteDefinitionsProvider>
          </RendererConfigProvider>
        </ColorSchemeProvider>
      </PortalThemeProvider>
    </ThemeContext>
  );
}
