import {
  articleLayout,
  chatLayout,
  commentLayout,
  fonts,
  noteLayout,
} from '@haklex/rich-style-token';
import { useLayoutEffect, useRef, useState } from 'react';

import { ThemeFrame } from '../../components/preview/ThemeFrame';
import { useTheme } from '../../context/ThemeContext';
import { doc, heading, paragraph, text } from '../../fixtures/helpers';
import { LexicalRenderer } from '../../lexical';

const sample = doc(
  heading('h1', text('Quiet Ink')),
  heading('h2', text('Quiet Ink')),
  heading('h3', text('Quiet Ink')),
  heading('h4', text('Quiet Ink')),
  paragraph(text('Neutral grays, 1px lines and translucent fills. '), text('const tokens', 16)),
);

const levels = [
  { label: 'H1', selector: 'h1' },
  { label: 'H2', selector: 'h2' },
  { label: 'H3', selector: 'h3' },
  { label: 'H4', selector: 'h4' },
  { label: 'Body', selector: 'p' },
  { label: 'Inline code', selector: '.rich-text-code' },
];

interface Measured {
  label: string;
  letterSpacing: string;
  lineHeight: string;
  size: string;
  weight: string;
}

const px = (value: string) =>
  value.endsWith('px') ? String(Math.round(Number.parseFloat(value) * 10) / 10) : value;

function useMeasured(root: React.RefObject<HTMLDivElement | null>) {
  const [rows, setRows] = useState<Measured[]>([]);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const next = levels.flatMap(({ label, selector }) => {
        const node = el.querySelector(selector);
        if (!node) return [];
        const cs = getComputedStyle(node);
        return [
          {
            label,
            size: px(cs.fontSize),
            lineHeight: px(cs.lineHeight),
            weight: cs.fontWeight,
            letterSpacing: cs.letterSpacing === 'normal' ? '—' : cs.letterSpacing,
          },
        ];
      });
      if (next.length === levels.length) setRows(next);
    };
    measure();
    const observer = new MutationObserver(measure);
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [root]);
  return rows;
}

const familyName = (family: string) => {
  if (family === fonts.fontFamilySerif) return 'CJK serif';
  if (family === fonts.fontFamilySans) return 'Sans';
  return family;
};

const variants = [
  ['article', articleLayout],
  ['note', noteLayout],
  ['comment', commentLayout],
  ['chat', chatLayout],
] as const;

export function TypeScale() {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const rows = useMeasured(ref);

  return (
    <>
      <div className="tk-type">
        <div ref={ref}>
          <ThemeFrame label="Article renderer" theme={theme}>
            <LexicalRenderer theme={theme} value={sample} variant="article" />
          </ThemeFrame>
        </div>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Size / line height</th>
              <th>Weight</th>
              <th>Tracking</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td className="tk-val">{`${r.size} / ${r.lineHeight}`}</td>
                <td className="tk-val">{r.weight}</td>
                <td className="tk-val">{r.letterSpacing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="tk-h3">Variants</h3>
      <table className="doc-table">
        <thead>
          <tr>
            <th>Variant</th>
            <th>Family</th>
            <th>Size / line height</th>
            <th>Paragraph gap</th>
          </tr>
        </thead>
        <tbody>
          {variants.map(([name, layout]) => (
            <tr key={name}>
              <td>
                <code>{name}</code>
              </td>
              <td>{familyName(layout.typography.fontFamily)}</td>
              <td className="tk-val">{`${layout.typography.fontSizeBase} / ${layout.typography.lineHeight}`}</td>
              <td className="tk-val">{layout.flow.paragraph}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
