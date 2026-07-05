const MERMAID_CDN_URL = 'https://esm.sh/mermaid@11.15.0?bundle';

interface MermaidRenderResult {
  svg: string;
}

interface MermaidApiLike {
  getDiagramFromText: (content: string) => Promise<unknown>;
}

interface MermaidLike {
  initialize: (options: Record<string, unknown>) => void;
  mermaidAPI?: MermaidApiLike;
  render: (id: string, content: string, container?: Element) => Promise<MermaidRenderResult>;
}

interface MermaidModuleLike {
  default?: MermaidLike;
  initialize?: MermaidLike['initialize'];
  mermaidAPI?: MermaidApiLike;
  render?: MermaidLike['render'];
}

let mermaidPromise: Promise<MermaidLike> | null = null;
let pendingConfig: Record<string, unknown> | null = null;

const resolveMermaid = async (): Promise<MermaidLike> => {
  mermaidPromise ??= import(/* @vite-ignore */ MERMAID_CDN_URL).then((mod: MermaidModuleLike) => {
    const mermaid = mod.default ?? mod;
    if (!mermaid.initialize || !mermaid.render) {
      throw new Error('Mermaid CDN module does not export initialize/render.');
    }
    if (pendingConfig) mermaid.initialize(pendingConfig);
    return mermaid as MermaidLike;
  });

  return mermaidPromise;
};

export function initialize(options: Record<string, unknown>): void {
  pendingConfig = options;

  if (mermaidPromise) {
    void mermaidPromise.then((mermaid) => {
      mermaid.initialize(options);
    });
  }
}

export async function render(
  id: string,
  content: string,
  container?: Element,
): Promise<MermaidRenderResult> {
  const mermaid = await resolveMermaid();
  return mermaid.render(id, content, container);
}

export const mermaidAPI: MermaidApiLike = {
  async getDiagramFromText(content: string): Promise<unknown> {
    const mermaid = await resolveMermaid();
    if (!mermaid.mermaidAPI?.getDiagramFromText) {
      throw new Error('Mermaid CDN module does not export mermaidAPI.getDiagramFromText.');
    }
    return mermaid.mermaidAPI.getDiagramFromText(content);
  },
};

const mermaid = {
  initialize,
  mermaidAPI,
  render,
};

export { mermaid as default };
