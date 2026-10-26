import {
  LexicalComposerContext,
  useLexicalComposerContext,
} from '@lexical/react/LexicalComposerContext';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  type LexicalEditor,
} from 'lexical';
import type { ComponentType, ReactNode } from 'react';
import {
  createContext,
  Fragment,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface EditorSurfaceProps {
  autoFocus?: boolean;
  className?: string;
  hasHeader?: boolean;
  onActiveEditorChange: (editor: LexicalEditor | null) => void;
  placeholder?: string;
  plugins?: ReactNode;
  /** Keep the current surface alive until a UI operation or async edit has finished. */
  retainSurface: () => () => void;
}
type Surface = ComponentType<EditorSurfaceProps>;
interface Registration {
  priority: number;
  surface: Surface | null;
}
interface SurfaceContext {
  activeEditor: LexicalEditor | null;
  plugins: ReactNode;
  registerPlugins: (key: string, plugins: ReactNode) => () => void;
  registerSurface: (key: string, surface: Surface | null, priority: number) => () => void;
  retainSurface: () => () => void;
  setActiveEditor: (editor: LexicalEditor | null) => void;
  surface: Surface | null;
}
const Context = createContext<SurfaceContext | null>(null);

export function EditorSurfaceProvider({ children }: { children: ReactNode }) {
  const [documentEditor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState<LexicalEditor | null>(documentEditor);
  const active = useRef(activeEditor);
  active.current = activeEditor;
  const history = useRef({ undo: false, redo: false });
  useEffect(() => {
    const register = (command: typeof CAN_UNDO_COMMAND, key: 'undo' | 'redo') =>
      documentEditor.registerCommand(
        command,
        (value, fromEditor) => {
          if (fromEditor !== documentEditor) return false;
          history.current[key] = value;
          const target = active.current;
          if (target && target !== documentEditor) target.dispatchCommand(command, value);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      );
    const unregister = [register(CAN_UNDO_COMMAND, 'undo'), register(CAN_REDO_COMMAND, 'redo')];
    return () => unregister.forEach((dispose) => dispose());
  }, [documentEditor]);
  useEffect(() => {
    if (activeEditor && activeEditor !== documentEditor) {
      activeEditor.dispatchCommand(CAN_UNDO_COMMAND, history.current.undo);
      activeEditor.dispatchCommand(CAN_REDO_COMMAND, history.current.redo);
    }
  }, [activeEditor, documentEditor]);
  const [surfaces, setSurfaces] = useState(() => new Map<string, Registration>());
  const [injections, setInjections] = useState(() => new Map<string, ReactNode>());
  const registerSurface = useCallback((key: string, surface: Surface | null, priority: number) => {
    setSurfaces((previous) => new Map(previous).set(key, { surface, priority }));
    return () =>
      setSurfaces((previous) => {
        const next = new Map(previous);
        next.delete(key);
        return next;
      });
  }, []);
  const registerPlugins = useCallback((key: string, plugins: ReactNode) => {
    setInjections((previous) => new Map(previous).set(key, plugins));
    return () =>
      setInjections((previous) => {
        const next = new Map(previous);
        next.delete(key);
        return next;
      });
  }, []);
  const requested = useMemo(() => {
    let selected: Registration | undefined;
    for (const entry of surfaces.values())
      if (!selected || entry.priority >= selected.priority) selected = entry;
    return selected?.surface ?? null;
  }, [surfaces]);
  const [leases, setLeases] = useState(0);
  const leaseCount = useRef(0);
  const heldSurface = useRef<Surface | null>(null);
  const surface = leases > 0 ? heldSurface.current : requested;
  const currentSurface = useRef(surface);
  currentSurface.current = surface;
  const retainSurface = useCallback(() => {
    if (leaseCount.current++ === 0) heldSurface.current = currentSurface.current;
    setLeases(leaseCount.current);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setLeases(--leaseCount.current);
    };
  }, []);
  const plugins = useMemo(
    () => [...injections].map(([key, node]) => <Fragment key={key}>{node}</Fragment>),
    [injections],
  );
  useLayoutEffect(
    () => setActiveEditor(surface ? null : documentEditor),
    [documentEditor, surface],
  );
  const value = useMemo(
    () => ({
      surface,
      activeEditor,
      setActiveEditor,
      plugins,
      registerSurface,
      registerPlugins,
      retainSurface,
    }),
    [surface, activeEditor, plugins, registerSurface, registerPlugins, retainSurface],
  );
  return <Context value={value}>{children}</Context>;
}
export function useEditorSurface() {
  const context = use(Context);
  if (!context) throw new Error('Editor surface extensions must be mounted inside RichEditor');
  return context;
}
/** Register an editing surface; null explicitly selects the standard surface. */
export function EditorSurfacePlugin({
  surface,
  priority = 0,
}: {
  surface: Surface | null;
  priority?: number;
}) {
  const key = useId();
  const { registerSurface } = useEditorSurface();
  useLayoutEffect(
    () => registerSurface(key, surface, priority),
    [key, priority, registerSurface, surface],
  );
  return null;
}
/** Mount DOM/selection plugins inside whichever editing surface is installed. */
export function EditorSurfacePlugins({ children }: { children: ReactNode }) {
  const key = useId();
  const { registerPlugins } = useEditorSurface();
  useLayoutEffect(() => registerPlugins(key, children), [children, key, registerPlugins]);
  return null;
}
export function useActiveEditor() {
  return useEditorSurface().activeEditor;
}
/** Keep document-level history/save outside this scope; toolbar actions belong inside it. */
export function ActiveEditorScope({ children }: { children: ReactNode }) {
  const [documentEditor, context] = useLexicalComposerContext();
  const activeEditor = useActiveEditor();
  const value = useMemo<[LexicalEditor, typeof context]>(
    () => [activeEditor ?? documentEditor, context],
    [activeEditor, context, documentEditor],
  );
  return <LexicalComposerContext value={value}>{children}</LexicalComposerContext>;
}
