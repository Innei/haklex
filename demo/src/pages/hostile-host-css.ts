export const hostileHostCss = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

@layer base {
  *, ::after, ::before, ::backdrop, ::file-selector-button {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0 solid;
    border-color: #e5e5e5;
  }
  h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
  ol, ul, menu { list-style: none; }
  img, svg, video, canvas, audio, iframe, embed, object { display: block; vertical-align: middle; }
  img, video { max-width: 100%; height: auto; }
  button, input, select, optgroup, textarea, ::file-selector-button {
    font: inherit;
    font-feature-settings: inherit;
    font-variation-settings: inherit;
    letter-spacing: inherit;
    color: inherit;
    border-radius: 0;
    background-color: transparent;
    opacity: 1;
  }
  a { color: inherit; text-decoration: inherit; }
  b, strong { font-weight: bolder; }
  code, kbd, samp, pre { font-family: ui-monospace, monospace; font-size: 1em; }
  table { text-indent: 0; border-color: inherit; border-collapse: collapse; }
  body a { color: #2563eb; text-decoration: none; }
  button { border: none; background: transparent; padding: 0; margin: 0; font: inherit; color: inherit; }
}

html, body {
  font-family: 'Inter', -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', system-ui, sans-serif;
  background: #faf9f7;
}

body {
  font-size: 0.875rem;
  line-height: 1.5;
  letter-spacing: 0.01em;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: 'ss01', 'cv11';
}
`;

export const hostMappingCss = `
:root {
  --rc-host-text: #1c1917;
  --rc-host-text-secondary: #57534e;
  --rc-host-text-tertiary: #78716c;
  --rc-host-text-quaternary: #a8a29e;
  --rc-host-bg: #ffffff;
  --rc-host-bg-secondary: #faf9f7;
  --rc-host-bg-tertiary: #f5f4f1;
  --rc-host-border: rgb(0 0 0 / 0.12);
  --rc-host-border-subtle: rgb(0 0 0 / 0.06);
  --rc-host-code-bg: #f5f4f1;
  --rc-host-quote-bg: #f5f4f1;
  --rc-host-hr-border: rgb(0 0 0 / 0.12);
  --rc-host-quote-border: rgb(0 0 0 / 0.12);
}

:root[data-host-theme='dark'] {
  --rc-host-text: #fafaf9;
  --rc-host-text-secondary: #a8a29e;
  --rc-host-text-tertiary: #78716c;
  --rc-host-text-quaternary: #57534e;
  --rc-host-bg: #1c1c20;
  --rc-host-bg-secondary: #131316;
  --rc-host-bg-tertiary: #101013;
  --rc-host-border: rgb(255 255 255 / 0.12);
  --rc-host-border-subtle: rgb(255 255 255 / 0.06);
  --rc-host-code-bg: #101013;
  --rc-host-quote-bg: #101013;
  --rc-host-hr-border: rgb(255 255 255 / 0.12);
  --rc-host-quote-border: rgb(255 255 255 / 0.12);
}
`;
