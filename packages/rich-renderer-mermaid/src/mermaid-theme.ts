/**
 * Mermaid theme system inspired by beautiful-mermaid (lukilabs/beautiful-mermaid).
 *
 * Architecture:
 *   - Two base colors: bg (background) + fg (foreground)
 *   - All derived colors computed via color-mix ratios from bg + fg
 *   - Produces a coherent mono hierarchy on any bg/fg combination
 *
 * @see https://github.com/lukilabs/beautiful-mermaid/blob/main/src/theme.ts
 */

interface MermaidThemeConfig {
  theme: 'base';
  themeVariables: Record<string, string>;
}

// beautiful-mermaid MIX ratios (percentage of fg mixed into bg)
const MIX = {
  text: 100,
  textSec: 60,
  textMuted: 40,
  textFaint: 25,
  line: 50,
  arrow: 85,
  nodeFill: 3,
  nodeStroke: 20,
  groupHeader: 5,
  innerStroke: 12,
} as const;

function parseHex(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.round(Math.max(0, Math.min(255, v)));
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
}

function mix(fg: string, bg: string, percent: number): string {
  const [fR, fG, fB] = parseHex(fg);
  const [bR, bG, bB] = parseHex(bg);
  const p = percent / 100;
  return toHex(fR * p + bR * (1 - p), fG * p + bG * (1 - p), fB * p + bB * (1 - p));
}

export interface ThemeTokens {
  arrow: string;
  bg: string;
  fg: string;
  groupHeader: string;
  innerStroke: string;
  line: string;
  nodeFill: string;
  nodeStroke: string;
  textFaint: string;
  textMuted: string;
  textSec: string;
}

export function deriveTokens(bg: string, fg: string): ThemeTokens {
  return {
    bg,
    fg,
    line: mix(fg, bg, MIX.line),
    arrow: mix(fg, bg, MIX.arrow),
    nodeFill: mix(fg, bg, MIX.nodeFill),
    nodeStroke: mix(fg, bg, MIX.nodeStroke),
    groupHeader: mix(fg, bg, MIX.groupHeader),
    innerStroke: mix(fg, bg, MIX.innerStroke),
    textSec: mix(fg, bg, MIX.textSec),
    textMuted: mix(fg, bg, MIX.textMuted),
    textFaint: mix(fg, bg, MIX.textFaint),
  };
}

function buildTheme(bg: string, fg: string): MermaidThemeConfig {
  const t = deriveTokens(bg, fg);

  return {
    theme: 'base',
    themeVariables: {
      background: t.bg,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',

      primaryColor: t.nodeFill,
      primaryTextColor: t.fg,
      primaryBorderColor: t.nodeStroke,

      secondaryColor: t.nodeFill,
      secondaryTextColor: t.fg,
      secondaryBorderColor: t.innerStroke,

      tertiaryColor: t.groupHeader,
      tertiaryTextColor: t.fg,
      tertiaryBorderColor: t.innerStroke,

      noteBkgColor: t.nodeFill,
      noteTextColor: t.fg,
      noteBorderColor: t.innerStroke,

      lineColor: t.line,
      textColor: t.fg,
      mainBkg: t.nodeFill,

      nodeBorder: t.nodeStroke,
      nodeTextColor: t.fg,

      clusterBkg: t.bg,
      clusterBorder: t.nodeStroke,
      titleColor: t.fg,

      labelColor: t.fg,
      altBackground: t.nodeFill,

      fillType0: t.nodeFill,
      fillType1: t.groupHeader,
      fillType2: mix(fg, bg, 7),
      fillType3: t.innerStroke,
      fillType4: t.nodeStroke,
      fillType5: t.groupHeader,
      fillType6: t.nodeFill,
      fillType7: mix(fg, bg, 7),

      // Sequence diagram
      actorBkg: t.nodeFill,
      actorBorder: t.nodeStroke,
      actorTextColor: t.fg,
      actorLineColor: t.line,
      signalColor: t.fg,
      signalTextColor: t.fg,
      labelBoxBkgColor: t.nodeFill,
      labelBoxBorderColor: t.nodeStroke,
      labelTextColor: t.fg,
      loopTextColor: t.fg,
      activationBorderColor: t.line,
      activationBkgColor: t.innerStroke,
      sequenceNumberColor: t.bg,

      // Git graph
      git0: t.fg,
      git1: t.line,
      git2: t.textMuted,
      git3: t.textFaint,
      git4: t.nodeStroke,
      git5: t.innerStroke,
      git6: t.groupHeader,
      git7: t.nodeFill,
      gitBranchLabel0: t.bg,
      gitBranchLabel1: t.bg,
      gitBranchLabel2: t.bg,
      gitBranchLabel3: t.fg,
      gitInv0: t.bg,

      // Pie chart
      pie1: t.fg,
      pie2: mix(fg, bg, 80),
      pie3: t.line,
      pie4: t.textMuted,
      pie5: t.nodeStroke,
      pie6: t.innerStroke,
      pie7: mix(fg, bg, 7),
      pie8: t.groupHeader,
      pie9: t.nodeFill,
      pie10: t.bg,
      pie11: t.textSec,
      pie12: t.arrow,
      pieTitleTextColor: t.fg,
      pieSectionTextColor: t.bg,
      pieLegendTextColor: t.fg,
      pieLegendTextSize: '14px',
      pieStrokeColor: t.bg,
      pieStrokeWidth: '2px',

      classText: t.fg,

      // Gantt / timeline
      sectionBkgColor: t.nodeFill,
      altSectionBkgColor: t.groupHeader,
      sectionBkgColor2: mix(fg, bg, 7),
      taskBkgColor: t.innerStroke,
      taskTextColor: t.fg,
      taskTextLightColor: t.fg,
      taskTextOutsideColor: t.fg,
      activeTaskBkgColor: t.nodeStroke,
      activeTaskBorderColor: t.line,
      gridColor: t.innerStroke,
      doneTaskBkgColor: t.nodeStroke,
      doneTaskBorderColor: t.line,
      critBkgColor: t.fg,
      critBorderColor: t.fg,
      todayLineColor: t.fg,

      // Requirement diagram
      requirementBackground: t.nodeFill,
      requirementBorderColor: t.nodeStroke,
      requirementBorderSize: '1px',
      requirementTextColor: t.fg,
      relationColor: t.line,
      relationLabelBackground: t.bg,
      relationLabelColor: t.fg,

      edgeLabelBackground: t.bg,

      // Color scales
      cScale0: t.nodeFill,
      cScale1: t.innerStroke,
      cScale2: t.nodeStroke,
      cScale3: t.textMuted,
      cScale4: t.line,
      cScale5: t.textSec,
      cScale6: mix(fg, bg, 70),
      cScale7: mix(fg, bg, 80),
      cScale8: t.arrow,
      cScale9: t.fg,
      cScaleLabel0: t.fg,
      cScaleLabel2: t.fg,
    },
  };
}

// Neutral light: white bg, neutral-800 fg
export const lightTheme = buildTheme('#ffffff', '#262626');

// Neutral dark: neutral-900 bg, near-white fg
export const darkTheme = buildTheme('#171717', '#fafafa');

export const lightTokens = deriveTokens('#ffffff', '#262626');
export const darkTokens = deriveTokens('#171717', '#fafafa');
