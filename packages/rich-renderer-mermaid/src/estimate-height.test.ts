import { describe, expect, it } from 'vitest';

import { estimateMermaidHeight } from './estimate-height';

describe('estimateMermaidHeight', () => {
  it('clamps empty content to minimum 200', () => {
    expect(estimateMermaidHeight('')).toBe(200);
  });

  it('returns 320 for pie', () => {
    expect(estimateMermaidHeight('pie\n  "A": 50\n  "B": 50')).toBe(320);
  });

  it('LR is shorter than TD for same line count', () => {
    const td = estimateMermaidHeight('flowchart TD\nA-->B\nB-->C\nC-->D');
    const lr = estimateMermaidHeight('flowchart LR\nA-->B\nB-->C\nC-->D');
    expect(lr).toBeLessThan(td);
  });

  it('clamps very long content to maximum 800', () => {
    const long =
      'flowchart TD\n' +
      Array.from({ length: 30 }, (_, i) => `A${i}-->A${i + 1}`).join('\n');
    expect(estimateMermaidHeight(long)).toBe(800);
  });

  it('ignores %% comment lines', () => {
    const a = estimateMermaidHeight('flowchart TD\nA-->B\nB-->C');
    const b = estimateMermaidHeight(
      'flowchart TD\n%% a comment\n%% another\nA-->B\nB-->C',
    );
    expect(a).toBe(b);
  });

  it('recognises sequenceDiagram', () => {
    const seq = estimateMermaidHeight(
      'sequenceDiagram\nA->>B: hi\nB->>A: hello\nA->>B: again',
    );
    expect(seq).toBeGreaterThanOrEqual(200);
    expect(seq).toBeLessThanOrEqual(400);
  });

  it('recognises gantt and grows with tasks', () => {
    const small = estimateMermaidHeight('gantt\ntitle X\nsection S\nTask: 1, 2');
    const big = estimateMermaidHeight(
      'gantt\ntitle X\nsection S\n' +
        Array.from({ length: 20 }, (_, i) => `T${i}: ${i}, ${i + 1}`).join('\n'),
    );
    expect(big).toBeGreaterThan(small);
  });

  it('falls back to flowchart TD coefficient for unknown types', () => {
    const unknown = estimateMermaidHeight('weirdNewDiagram\nA\nB\nC');
    const td = estimateMermaidHeight('flowchart TD\nA\nB\nC');
    expect(unknown).toBe(td);
  });
});
