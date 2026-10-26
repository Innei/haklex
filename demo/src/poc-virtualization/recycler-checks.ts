import { anchorAt, anchorY, frame } from './probe';
import type { RecyclerModel } from './recycler-model';

export async function waitUntil<T>(read: () => T | undefined | null | false): Promise<T> {
  for (let i = 0; i < 240; i++) {
    const value = read();
    if (value) return value;
    await frame();
  }
  throw new Error('Recycler probe timed out');
}

export async function visit(model: RecyclerModel, index: number) {
  model.scrollTo(index);
  const element = await waitUntil(() =>
    model.root.querySelector<HTMLElement>(`[data-probe-block="${model.plan.rows[index].id}"]`),
  );
  for (let i = 0; i < 8; i++) {
    await frame();
    const transitions = element.getAnimations({ subtree: true }).filter((animation) => {
      const target = (animation.effect as KeyframeEffect | null)?.target;
      return (
        animation instanceof CSSTransition &&
        target instanceof Element &&
        target.closest('details') &&
        ['height', 'opacity', 'content-visibility', 'transform'].includes(
          animation.transitionProperty,
        )
      );
    });
    if (transitions.length)
      throw new Error(`Restoring ${model.plan.rows[index].id} replayed a details transition`);
    if (element.hasAttribute('data-recycler-restoring'))
      for (const panel of element.querySelectorAll('details'))
        if (
          getComputedStyle(panel, '::details-content')
            .transitionDuration.split(',')
            .some((duration) => Number.parseFloat(duration) > 0)
        )
          throw new Error('Panel height transitions are enabled during restoration');
  }
  return element;
}

function dynamicRoot(element: Element) {
  return element.querySelector('.rich-dynamic-host')?.shadowRoot;
}

export async function checkRecyclerState(model: RecyclerModel) {
  if (model.plan.rows[1]?.data.type !== 'details') throw new Error('请选择复杂节点场景');
  const outer = await visit(model, 1);
  const panels = outer.querySelectorAll('details');
  if (!panels[0].open) panels[0].querySelector('summary')!.click();
  if (!panels[1].open) panels[1].querySelector('summary')!.click();
  for (let i = 0; i < 30; i++) await frame();
  const defaultOpen = await visit(model, 7);
  if (defaultOpen.querySelector('details')!.open) defaultOpen.querySelector('summary')!.click();
  for (let i = 0; i < 30; i++) await frame();
  const counterBlock = await visit(model, 2);
  const increment = await waitUntil(() =>
    dynamicRoot(counterBlock)?.querySelector<HTMLButtonElement>('[data-op="inc"]'),
  );
  const initial = Number(dynamicRoot(counterBlock)!.querySelector('.count')!.textContent);
  for (let i = 0; i < 3; i++) increment.click();
  const expectedCount = String(initial + 3);
  const quizBlock = await visit(model, 3);
  await waitUntil(() => dynamicRoot(quizBlock)?.querySelector('.option'));
  const retry = dynamicRoot(quizBlock)!.querySelector<HTMLButtonElement>('.reset');
  retry?.click();
  dynamicRoot(quizBlock)!.querySelectorAll<HTMLButtonElement>('.option')[1].click();
  const before = model.stats();
  const far = Math.floor((model.plan.rows.length * 0.7) / 12) * 12;
  await visit(model, far + 2);
  const otherCounter = await waitUntil(() =>
    dynamicRoot(model.root.querySelector(`[data-probe-block="block-${far + 2}"]`)!)?.querySelector(
      '.count',
    ),
  );
  const otherCount = otherCounter.textContent;
  if (otherCount !== '0') throw new Error(`Counter state leaked into another block: ${otherCount}`);
  await visit(model, far + 3);
  const otherQuiz = await waitUntil(() =>
    dynamicRoot(model.root.querySelector(`[data-probe-block="block-${far + 3}"]`)!)?.querySelector(
      '.feedback',
    ),
  );
  if (otherQuiz.textContent) throw new Error('Quiz state leaked into another block');
  const offscreen = !model.root.querySelector('[data-probe-block="block-2"]');
  await visit(model, 2);
  const count = await waitUntil(() =>
    dynamicRoot(model.root.querySelector('[data-probe-block="block-2"]')!)?.querySelector('.count'),
  );
  const returnedCount = count.textContent;
  await visit(model, 3);
  const feedback = await waitUntil(() =>
    dynamicRoot(model.root.querySelector('[data-probe-block="block-3"]')!)?.querySelector(
      '.feedback',
    ),
  );
  const returnedAnswer = feedback.textContent;
  await visit(model, 7);
  const stayedClosed = !model.root
    .querySelector('[data-probe-block="block-7"] details')!
    .hasAttribute('open');
  const panel = await visit(model, 1);
  const restored = panel.querySelectorAll('details');
  const result = {
    offscreen,
    otherCount,
    returnedCount,
    returnedAnswer,
    outerOpen: restored[0].open,
    innerOpen: restored[1].open,
    stayedClosed,
    rebinds: model.pool.reused - before.reused,
    stats: model.stats(),
  };
  if (
    !offscreen ||
    returnedCount !== expectedCount ||
    !returnedAnswer?.startsWith('Correct!') ||
    !result.outerOpen ||
    !result.innerOpen ||
    !stayedClosed ||
    result.rebinds <= 0
  )
    throw new Error(`Recycler state check failed: ${JSON.stringify(result)}`);
  return result;
}

export async function runRecyclerScroll(model: RecyclerModel) {
  const samples = [];
  let previous = performance.now();
  for (let step = 0; step < 240; step++) {
    if (step < 120 && step % 30 === 0)
      model.scrollTo(Math.floor(model.plan.rows.length * [0, 0.35, 0.7, 0.1][step / 30]));
    else if (step < 120) {
      model.root.scrollTop += step % 60 < 30 ? 1100 : -1100;
      model.refresh();
    }
    const anchor = anchorAt(model.root);
    await frame();
    const now = performance.now();
    const stats = model.stats();
    const y = anchor && anchorY(anchor);
    samples.push({
      step,
      phase: step < 120 ? 'scroll' : 'settle',
      ms: now - previous,
      anchorId: anchor?.id,
      anchorY: anchor?.y,
      nextAnchorY: y,
      landingDrift: anchor && y !== undefined ? y - anchor.y : null,
      scrollTop: model.root.scrollTop,
      slots: stats.slots,
      active: stats.active,
      domNodes: stats.domNodes,
      reused: stats.reused,
    });
    previous = now;
    if (stats.slots >= 200) throw new Error(`Unexpected slot growth: ${stats.slots}`);
  }
  return {
    stats: model.stats(),
    maxSlots: Math.max(...samples.map((row) => row.slots)),
    maxDomNodes: Math.max(...samples.map((row) => row.domNodes)),
    maxFrameMs: Math.max(...samples.map((row) => row.ms)),
    maxLandingDrift: Math.max(...samples.map((row) => Math.abs(row.landingDrift ?? 0))),
    missedAnchors: samples.filter((row) => row.landingDrift === null).length,
    samples,
  };
}
