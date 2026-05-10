import { pollNodes } from '@haklex/rich-ext-poll/node';

import type { RichRendererModule } from '../../core/types';

/**
 * Poll module — registers PollNode (light) and lazy-loads PollRenderer.
 *
 * The default `PollRenderer` lives in `@haklex/rich-ext-poll/renderer` and
 * is loaded into a separate chunk via `lazyRenderers`. Consumers who want a
 * lighter override can write their own thin module — `nodes: pollNodes` from
 * `@haklex/rich-ext-poll/node` plus `renderers: { Poll: MyPoll }` — and the
 * heavy default `PollRenderer` chunk never enters their bundle.
 */
export const pollModule: RichRendererModule = {
  name: 'poll',
  nodes: pollNodes,
  lazyRenderers: {
    Poll: () => import('@haklex/rich-ext-poll/renderer'),
  },
};
