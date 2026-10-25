import type { ComponentDemo } from '../../components/types';
import {
  actionButtonDemo,
  animatedTabsDemo,
  checkboxDemo,
  colorPickerDemo,
  segmentedControlDemo,
  textareaDemo,
} from './controls';
import {
  alertDemo,
  badgeDemo,
  codeBlockDemo,
  collapsibleDemo,
  scrollAreaDemo,
  spinnerDemo,
  statusDotDemo,
} from './display';
import { dropdownMenuDemo, selectDemo } from './menus';
import { comboboxDemo, dialogDemo, popoverDemo, tooltipDemo } from './overlays';

export const uiDemos: Record<string, ComponentDemo> = {
  'dialog': dialogDemo,
  'popover': popoverDemo,
  'dropdown-menu': dropdownMenuDemo,
  'select': selectDemo,
  'combobox': comboboxDemo,
  'tooltip': tooltipDemo,
  'action-button': actionButtonDemo,
  'segmented-control': segmentedControlDemo,
  'animated-tabs': animatedTabsDemo,
  'checkbox': checkboxDemo,
  'color-picker': colorPickerDemo,
  'auto-resize-textarea': textareaDemo,
  'alert': alertDemo,
  'badge': badgeDemo,
  'status-dot': statusDotDemo,
  'spinner': spinnerDemo,
  'collapsible': collapsibleDemo,
  'scroll-area': scrollAreaDemo,
  'code-block': codeBlockDemo,
};
