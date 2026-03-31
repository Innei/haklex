import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

export interface DeltaStats {
  chars: { added: number; removed: number };
  lines: { added: number; removed: number };
  words: { added: number; removed: number };
}

type NodeRecord = Record<string, unknown>;

function extractText(node: SerializedLexicalNode): string {
  const n = node as NodeRecord;
  if (n.type === 'text' && typeof n.text === 'string') {
    return n.text;
  }
  if (Array.isArray(n.children)) {
    return (n.children as SerializedLexicalNode[]).map(extractText).join('');
  }
  return '';
}

function extractTextFromState(state: SerializedEditorState): string {
  return state.root.children.map(extractText).join('\n');
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  // Match word characters including CJK characters
  // CJK characters are counted individually as words
  const cjkPattern = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/g;
  const cjkMatches = text.match(cjkPattern);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  // Remove CJK characters and count remaining words
  const nonCjkText = text.replaceAll(cjkPattern, ' ');
  const wordPattern = /[\p{L}\p{N}]+/gu;
  const wordMatches = nonCjkText.match(wordPattern);
  const wordCount = wordMatches ? wordMatches.length : 0;

  return cjkCount + wordCount;
}

function countLines(state: SerializedEditorState): number {
  return state.root.children.length;
}

// Prefix-suffix optimized diff to find exact additions and deletions
// This approach gives more intuitive results by preserving common prefix/suffix
function computeCharDiff(oldText: string, newText: string): { added: string; removed: string } {
  const oldChars = Array.from(oldText);
  const newChars = Array.from(newText);
  const m = oldChars.length;
  const n = newChars.length;

  // Find common prefix
  let prefix = 0;
  while (prefix < m && prefix < n && oldChars[prefix] === newChars[prefix]) {
    prefix++;
  }

  // Find common suffix (not overlapping with prefix)
  let oldSuffix = m - 1;
  let newSuffix = n - 1;
  while (
    oldSuffix >= prefix &&
    newSuffix >= prefix &&
    oldChars[oldSuffix] === newChars[newSuffix]
  ) {
    oldSuffix--;
    newSuffix--;
  }

  const oldMiddle = oldChars.slice(prefix, oldSuffix + 1);
  const newMiddle = newChars.slice(prefix, newSuffix + 1);

  // For small middle portions, use LCS; otherwise use simple diff
  const MAX_MATRIX_CELLS = 100_000;
  if (oldMiddle.length * newMiddle.length > MAX_MATRIX_CELLS) {
    return {
      removed: oldMiddle.join(''),
      added: newMiddle.join(''),
    };
  }

  if (oldMiddle.length === 0) {
    return { added: newMiddle.join(''), removed: '' };
  }
  if (newMiddle.length === 0) {
    return { added: '', removed: oldMiddle.join('') };
  }

  // LCS-based diff for the middle portion
  const om = oldMiddle.length;
  const nm = newMiddle.length;
  const dp: number[][] = Array.from({ length: om + 1 }, () =>
    Array.from<number>({ length: nm + 1 }).fill(0),
  );

  for (let i = 1; i <= om; i++) {
    for (let j = 1; j <= nm; j++) {
      if (oldMiddle[i - 1] === newMiddle[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find removed and added chars
  const removedChars: string[] = [];
  const addedChars: string[] = [];
  let i = om;
  let j = nm;

  while (i > 0 && j > 0) {
    if (oldMiddle[i - 1] === newMiddle[j - 1]) {
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      removedChars.push(oldMiddle[i - 1]);
      i--;
    } else {
      addedChars.push(newMiddle[j - 1]);
      j--;
    }
  }

  while (i > 0) {
    removedChars.push(oldMiddle[--i]);
  }
  while (j > 0) {
    addedChars.push(newMiddle[--j]);
  }

  return {
    added: addedChars.reverse().join(''),
    removed: removedChars.reverse().join(''),
  };
}

/**
 * Computes delta statistics between two Lexical editor states.
 *
 * Returns counts of added/removed characters, words, and lines.
 *
 * @example
 * ```ts
 * const stats = computeDeltaStats(oldState, newState);
 * console.log(`+${stats.chars.added} / -${stats.chars.removed} chars`);
 * console.log(`+${stats.words.added} / -${stats.words.removed} words`);
 * console.log(`+${stats.lines.added} / -${stats.lines.removed} lines`);
 * ```
 */
export function computeDeltaStats(
  oldState: SerializedEditorState,
  newState: SerializedEditorState,
): DeltaStats {
  const oldText = extractTextFromState(oldState);
  const newText = extractTextFromState(newState);
  const oldLines = countLines(oldState);
  const newLines = countLines(newState);

  const { added: addedText, removed: removedText } = computeCharDiff(oldText, newText);

  return {
    chars: {
      added: Array.from(addedText).length,
      removed: Array.from(removedText).length,
    },
    words: {
      added: countWords(addedText),
      removed: countWords(removedText),
    },
    lines: {
      added: Math.max(0, newLines - oldLines),
      removed: Math.max(0, oldLines - newLines),
    },
  };
}

/**
 * Formats delta stats as a human-readable string.
 *
 * @example
 * ```ts
 * const stats = computeDeltaStats(oldState, newState);
 * console.log(formatDeltaStats(stats));
 * // "+91 lines, +2,122 words, +12,345 chars"
 * ```
 */
export function formatDeltaStats(stats: DeltaStats): string {
  const parts: string[] = [];

  const formatNumber = (n: number): string => n.toLocaleString();

  const formatDelta = (added: number, removed: number, unit: string): string => {
    if (added > 0 && removed > 0) {
      return `+${formatNumber(added)}/-${formatNumber(removed)} ${unit}`;
    }
    if (added > 0) {
      return `+${formatNumber(added)} ${unit}`;
    }
    if (removed > 0) {
      return `-${formatNumber(removed)} ${unit}`;
    }
    return '';
  };

  const linesStr = formatDelta(stats.lines.added, stats.lines.removed, 'lines');
  const wordsStr = formatDelta(stats.words.added, stats.words.removed, 'words');
  const charsStr = formatDelta(stats.chars.added, stats.chars.removed, 'chars');

  if (linesStr) parts.push(linesStr);
  if (wordsStr) parts.push(wordsStr);
  if (charsStr) parts.push(charsStr);

  return parts.join(', ') || 'No changes';
}
