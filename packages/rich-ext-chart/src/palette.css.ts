import {
  assignVars,
  createGlobalTheme,
  createGlobalThemeContract,
  globalStyle,
} from '@vanilla-extract/css';

export const chartVars = createGlobalThemeContract({
  series1: 'rc-chart-1',
  series2: 'rc-chart-2',
  series3: 'rc-chart-3',
  series4: 'rc-chart-4',
  series5: 'rc-chart-5',
  series6: 'rc-chart-6',
  muted: 'rc-chart-muted',
  grid: 'rc-chart-grid',
  axis: 'rc-chart-axis',
  reference: 'rc-chart-reference',
  crosshair: 'rc-chart-crosshair',
  areaOpacity: 'rc-chart-area-opacity',
  hoverWash: 'rc-chart-hover-wash',
});

const light = {
  series1: '#2a78d6',
  series2: '#eb6834',
  series3: '#1baf7a',
  series4: '#eda100',
  series5: '#e87ba4',
  series6: '#008300',
  muted: '#d4d4d4',
  grid: '#f0f0f0',
  axis: '#d4d4d4',
  reference: '#a3a3a3',
  crosshair: '#a3a3a3',
  areaOpacity: '0.16',
  hoverWash: 'rgba(0, 0, 0, 0.04)',
};

const dark = {
  series1: '#3987e5',
  series2: '#d95926',
  series3: '#199e70',
  series4: '#c98500',
  series5: '#d55181',
  series6: '#008300',
  muted: '#3a3a3a',
  grid: '#1c1c1c',
  axis: '#404040',
  reference: '#737373',
  crosshair: '#525252',
  areaOpacity: '0.2',
  hoverWash: 'rgba(255, 255, 255, 0.05)',
};

createGlobalTheme(':root', chartVars, light);

globalStyle(':root.dark, [data-theme="dark"], .dark', { vars: assignVars(chartVars, dark) });
globalStyle('[data-theme="light"]', { vars: assignVars(chartVars, light) });

export const seriesColors = [
  chartVars.series1,
  chartVars.series2,
  chartVars.series3,
  chartVars.series4,
  chartVars.series5,
  chartVars.series6,
];
