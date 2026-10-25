import { darkColors, lightArticleColors } from '@haklex/rich-style-token';
import type { CSSProperties } from 'react';

import { colorGroups, cssVarName } from '../../site/tokens';

function shortValue(value: string) {
  const mix = /^color-mix\(.*var\(--rc-accent\)\s+(\d+%)/.exec(value);
  return mix ? `accent ${mix[1]}` : value;
}

function Swatch({ dark, light }: { dark: string; light: string }) {
  return (
    <span className="tk-pair">
      <span className="tk-pair-l" style={{ background: lightArticleColors.bg }}>
        <i
          style={{ '--rc-accent': lightArticleColors.accent, 'background': light } as CSSProperties}
        />
      </span>
      <span className="tk-pair-d" style={{ background: darkColors.bg }}>
        <i style={{ '--rc-accent': darkColors.accent, 'background': dark } as CSSProperties} />
      </span>
    </span>
  );
}

export function ColorTables() {
  return (
    <>
      {colorGroups.map((group) => (
        <div className="tk-group" key={group.title}>
          <h3 className="tk-h3">{group.title}</h3>
          <table className="doc-table tk-colors">
            <thead>
              <tr>
                <th aria-label="Swatch" />
                <th>Token</th>
                <th>Light</th>
                <th>Dark</th>
                <th>Use</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row) => (
                <tr key={row.key}>
                  <td>
                    <Swatch dark={row.dark} light={row.light} />
                  </td>
                  <td>
                    <code>{cssVarName(row.key)}</code>
                  </td>
                  <td className="tk-val">{shortValue(row.light)}</td>
                  <td className="tk-val">{shortValue(row.dark)}</td>
                  <td>{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
