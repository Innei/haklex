export function estimateMermaidHeight(content: string): number {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('%%'));

  const first = (lines[0] ?? '').toLowerCase();

  let h: number;
  if (first.startsWith('sequencediagram')) {
    h = lines.length * 50 + 60;
  } else if (first.startsWith('gantt')) {
    h = lines.length * 36 + 80;
  } else if (first.startsWith('pie')) {
    h = 320;
  } else if (
    first.startsWith('flowchart lr') ||
    first.startsWith('graph lr') ||
    first.startsWith('flowchart rl') ||
    first.startsWith('graph rl')
  ) {
    h = lines.length * 30 + 100;
  } else if (first.startsWith('classdiagram')) {
    h = lines.length * 40 + 100;
  } else if (first.startsWith('statediagram')) {
    h = lines.length * 50 + 80;
  } else if (first.startsWith('erdiagram')) {
    h = lines.length * 60 + 80;
  } else if (first.startsWith('journey')) {
    h = lines.length * 40 + 80;
  } else if (first.startsWith('mindmap')) {
    h = lines.length * 50 + 100;
  } else {
    h = lines.length * 60 + 80;
  }

  return Math.min(Math.max(Math.round(h), 200), 800);
}
