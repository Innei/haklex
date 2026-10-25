import { articleLayout } from '@haklex/rich-style-token';
import { useLayoutEffect, useRef, useState } from 'react';

import { DocPage } from '../../components/doc/DocPage';
import { ThemeFrame } from '../../components/preview/ThemeFrame';
import { useTheme } from '../../context/ThemeContext';
import { reviewOf } from '../../site/reviews';
import type { FrameTheme } from '../../site/tokens';
import { concentricRadius } from '../../site/tokens';
import { StyleReview } from '../components/ReviewParts';
import { ColorTables } from './ColorTables';
import { TypeScale } from './TypeScale';

const shadows = ['xs', 'menu', 'modal'] as const;
const shadowVar = { xs: '--rc-shadow-xs', menu: '--rc-shadow-menu', modal: '--rc-shadow-modal' };

const hostSnippet = `:root {
  --rc-host-bg: var(--color-surface);
  --rc-host-text: var(--color-fg);
  --rc-host-border: var(--color-border);
  --rc-host-accent: var(--color-accent);
  --rc-host-font-family-sans: var(--app-font-sans);
}`;

function Section({
  children,
  note,
  title,
}: {
  children: React.ReactNode;
  note: string;
  title: string;
}) {
  return (
    <section className="doc-section">
      <h2 className="doc-h2">{title}</h2>
      <p className="doc-note">{note}</p>
      {children}
    </section>
  );
}

function ShadowFrame({ theme }: { theme: FrameTheme }) {
  const siteTheme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    const stage = ref.current?.closest('.tf-stage');
    if (!stage) return;
    const cs = getComputedStyle(stage);
    setValues(
      Object.fromEntries(shadows.map((s) => [s, cs.getPropertyValue(shadowVar[s]).trim()])),
    );
  }, [theme, siteTheme]);

  return (
    <ThemeFrame theme={theme}>
      <div className="tk-shadows" ref={ref}>
        {shadows.map((s) => (
          <div className="tk-shadow" key={s}>
            <div className="tk-shadow-box" style={{ boxShadow: `var(${shadowVar[s]})` }} />
            <code>{`shadow-${s}`}</code>
            <span className="tk-val">{values[s]}</span>
          </div>
        ))}
      </div>
    </ThemeFrame>
  );
}

function HostSnippet() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="codebox">
      <div className="codebox-head">
        css
        <button
          className="btn btn-sm"
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(hostSnippet).then(() => setCopied(true));
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>{hostSnippet}</pre>
    </div>
  );
}

export function TokensPage() {
  const { borderRadius, flow, spacing } = articleLayout;
  const concentric = concentricRadius(articleLayout);
  return (
    <DocPage
      wide
      breadcrumb={['Components', 'Design tokens']}
      lead="Every color, line, fill, radius, shadow and type size the editor and this site read. They are --rc-* custom properties with a light and a dark value each. Values on this page come from @haklex/rich-style-token at runtime."
      title="Design tokens"
      meta={
        <>
          <span className="badge">@haklex/rich-style-token</span>
          <span className="badge">Quiet Ink</span>
        </>
      }
    >
      <Section
        note="Each swatch shows the light value on white and the dark value on black."
        title="Color"
      >
        <ColorTables />
      </Section>
      <Section
        note="Measured from the article renderer. Headings are set in em, so comment and chat variants scale with them."
        title="Typography"
      >
        <TypeScale />
      </Section>
      <Section note="4px grid for chrome; flow tokens space prose blocks." title="Spacing">
        <div className="tk-spacing">
          <div className="tk-bars">
            {Object.entries(spacing).map(([name, value]) => (
              <div className="tk-bar-row" key={name}>
                <code>{`space-${name}`}</code>
                <span className="tk-bar" style={{ width: value }} />
                <span className="tk-val">{value}</span>
              </div>
            ))}
          </div>
          <table className="doc-table">
            <tbody>
              {Object.entries(flow).map(([name, value]) => (
                <tr key={name}>
                  <td>
                    <code>{`flow-${name}`}</code>
                  </td>
                  <td className="tk-val">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section
        note="Nested corners are concentric: inner radius = outer radius − padding."
        title="Radius"
      >
        <div className="tk-radii">
          {Object.entries(borderRadius).map(([name, value]) => (
            <div className="tk-radius" key={name}>
              <div className="tk-radius-box" style={{ borderRadius: value }} />
              <code>{`radius-${name} · ${Number.parseFloat(value)}`}</code>
            </div>
          ))}
          <div className="tk-radius">
            <div
              className="tk-concentric"
              style={{ borderRadius: concentric.outer, padding: concentric.padding }}
            >
              <div style={{ borderRadius: concentric.inner }} />
            </div>
            <code>{`${concentric.outer} − ${concentric.padding} = ${concentric.inner}`}</code>
          </div>
        </div>
      </Section>
      <Section
        note="Only floating surfaces get depth. Cards and panels use a 1px line. Values are read from each frame."
        title="Shadow"
      >
        <div className="tf-pair">
          <ShadowFrame theme="light" />
          <ShadowFrame theme="dark" />
        </div>
      </Section>
      <Section
        note="A host app remaps any color or font in one place by defining --rc-host-* on :root. It reaches content, the editor and every popover, in both themes."
        title="Host interface"
      >
        <HostSnippet />
      </Section>
      <Section note="Findings about the token layer itself." title="Style review">
        <StyleReview review={reviewOf('tokens')} />
      </Section>
    </DocPage>
  );
}
