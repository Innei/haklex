const forced = ['hover', 'focus-visible', 'focus'] as const;
const forcedPattern = new RegExp(`:(${forced.join('|')})(?![\\w-])`, 'g');
const negatedPattern = new RegExp(`:not\\([^)]*:(?:${forced.join('|')})`);

export function splitSelectorList(selector: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(selector.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(selector.slice(start).trim());
  return parts;
}

export function forcedPseudoSelector(selector: string): string | null {
  const rewritten = splitSelectorList(selector)
    .filter((part) => !negatedPattern.test(part))
    .filter((part) => part.match(forcedPattern))
    .map((part) => part.replaceAll(forcedPattern, (_, name: string) => `[data-pseudo~="${name}"]`));
  return rewritten.length > 0 ? rewritten.join(', ') : null;
}

const processed = new WeakSet<CSSStyleSheet>();
const marker = 'data-pseudo-mirror';

function mirrorRules(rules: CSSRuleList, target: CSSGroupingRule | CSSStyleSheet) {
  const additions: string[] = [];
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      const selector = forcedPseudoSelector(rule.selectorText);
      if (selector) additions.push(`${selector}{${rule.style.cssText}}`);
    } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
      mirrorRules(rule.cssRules, rule);
    }
  }
  for (const css of additions) {
    try {
      target.insertRule(css, target.cssRules.length);
    } catch {
      continue;
    }
  }
}

function mirrorAll() {
  for (const sheet of Array.from(document.styleSheets)) {
    if (processed.has(sheet)) continue;
    const owner = sheet.ownerNode;
    if (owner instanceof Element && owner.hasAttribute(marker)) continue;
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    processed.add(sheet);
    mirrorRules(rules, sheet);
  }
}

let observer: MutationObserver | undefined;

export function installPseudoStates() {
  mirrorAll();
  if (observer) return;
  observer = new MutationObserver(() => mirrorAll());
  observer.observe(document.head, { childList: true, subtree: true, characterData: true });
}
