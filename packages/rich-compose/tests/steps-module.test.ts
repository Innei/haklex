import { describe, expect, it } from 'vitest';

describe('steps modules', () => {
  it('renderer module registers the steps node and a lazy Steps renderer', async () => {
    const { allRendererModules, stepsModule } = await import('../src/renderer');
    const { StepsNode } = await import('@haklex/rich-ext-steps/node');
    expect(stepsModule.name).toBe('steps');
    expect(stepsModule.nodes).toContain(StepsNode);
    expect(stepsModule.lazyRenderers?.Steps).toBeTypeOf('function');
    expect(allRendererModules).toContain(stepsModule);
  });

  it('editor module adds the steps edit node', async () => {
    const { allEditorModules, stepsEditModule } = await import('../src/editor');
    const { StepsEditNode } = await import('@haklex/rich-ext-steps/edit');
    expect(stepsEditModule.editNodes).toContain(StepsEditNode);
    expect(allEditorModules).toContain(stepsEditModule);
  });
});
