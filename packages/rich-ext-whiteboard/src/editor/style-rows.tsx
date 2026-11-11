import { ActionButton, SegmentedControl } from '@haklex/rich-editor-ui';
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Copy,
  Group,
  Trash2,
  Ungroup,
} from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { Children } from 'react';

import { newElement, newLinearElement, newTextElement } from '../model/create';
import type { ElementStyle } from '../model/defaults';
import type { ExcalidrawElement } from '../scene/types';
import {
  bringForward,
  bringToFront,
  deleteSelection,
  duplicateSelection,
  groupSelection,
  sendBackward,
  sendToBack,
  ungroupSelection,
} from './actions';
import * as css from './chrome.css';
import { getSelectedElements } from './selection-utils';
import type { WhiteboardStore } from './store';
import { useStore } from './store';
import type { Choice } from './style-options';
import {
  ARROW_TYPES,
  ARROWHEADS,
  BACKGROUND_COLORS,
  FILL_STYLES,
  FONT_FAMILIES,
  FONT_SIZES,
  ROUGHNESS,
  ROUNDNESS,
  STROKE_COLORS,
  STROKE_STYLES,
  STROKE_WIDTHS,
  TEXT_ALIGNS,
} from './style-options';
import { applyStyle, getApplicableProps, getCommonValue } from './style-props';
import type { EditorState } from './types';

function previewElements(state: EditorState): ExcalidrawElement[] {
  const selected = getSelectedElements(state).filter(
    (el) => !(el.type === 'text' && el.containerId),
  );
  if (selected.length > 0) return selected;
  switch (state.tool) {
    case 'rectangle':
    case 'diamond':
    case 'ellipse': {
      return [newElement(state.tool, {}, state.currentStyle)];
    }
    case 'arrow':
    case 'line':
    case 'freedraw': {
      return state.tool === 'freedraw'
        ? [{ ...newElement('rectangle', {}), type: 'freedraw' } as unknown as ExcalidrawElement]
        : [newLinearElement(state.tool, {}, state.currentStyle)];
    }
    case 'text': {
      return [newTextElement({ text: '' }, state.currentStyle)];
    }
    default: {
      return [];
    }
  }
}

const Row: FC<{ children: ReactNode; label: string }> = ({ children, label }) => (
  <div data-style-row className={css.row}>
    <span className={css.rowLabel}>{label}</span>
    {children}
  </div>
);

function Segment<K extends keyof ElementStyle>({
  choices,
  current,
  onPick,
}: {
  choices: Choice<K>[];
  current: unknown;
  onPick: (value: ElementStyle[K]) => void;
}) {
  const items = choices.map((c) => ({
    value: String(c.value),
    label: c.icon ? <c.icon aria-label={c.label} size={15} /> : c.label,
  }));
  return (
    <SegmentedControl
      fullWidth
      items={items}
      size="sm"
      value={String(current)}
      onChange={(v) => {
        const choice = choices.find((c) => String(c.value) === v);
        if (choice) onPick(choice.value);
      }}
    />
  );
}

export function useStyleRows(store: WhiteboardStore): ReactNode[] | null {
  const state = useStore(store, (s) => s);
  if (state.editingTextId || state.selectionBox) return null;
  const elements = previewElements(state);
  if (elements.length === 0) return null;
  const props = getApplicableProps(elements);
  const hasSelection = state.selectedIds.size > 0;
  const value = (key: keyof ElementStyle | 'strokeColor') => getCommonValue(elements, key);
  const set = (patch: Partial<ElementStyle>) => applyStyle(store, patch);
  const swatches = (key: 'strokeColor' | 'backgroundColor', colors: string[]) => (
    <div className={css.options}>
      {colors.map((color) => (
        <button
          aria-label={color}
          aria-pressed={value(key) === color}
          className={`${css.swatch}${color === 'transparent' ? ` ${css.transparentSwatch}` : ''}`}
          data-swatch={`${key}:${color}`}
          key={color}
          style={color === 'transparent' ? undefined : { background: color }}
          type="button"
          onClick={() => set({ [key]: color })}
        />
      ))}
    </div>
  );
  const action = (label: string, icon: ReactNode, run: (s: WhiteboardStore) => void) => (
    <ActionButton
      icon
      aria-label={label}
      key={label}
      size="sm"
      title={label}
      variant="ghost"
      onClick={() => run(store)}
    >
      {icon}
    </ActionButton>
  );
  const grouped = elements.some((el) => (el.groupIds ?? []).length > 0);

  const rows = (
    <>
      {props.has('stroke') && <Row label="Stroke">{swatches('strokeColor', STROKE_COLORS)}</Row>}
      {props.has('background') && (
        <Row label="Background">{swatches('backgroundColor', BACKGROUND_COLORS)}</Row>
      )}
      {props.has('fillStyle') && (
        <Row label="Fill">
          <Segment
            choices={FILL_STYLES}
            current={value('fillStyle')}
            onPick={(v) => set({ fillStyle: v })}
          />
        </Row>
      )}
      {props.has('strokeWidth') && (
        <Row label="Stroke width">
          <Segment
            choices={STROKE_WIDTHS}
            current={value('strokeWidth')}
            onPick={(v) => set({ strokeWidth: v })}
          />
        </Row>
      )}
      {props.has('strokeStyle') && (
        <Row label="Stroke style">
          <Segment
            choices={STROKE_STYLES}
            current={value('strokeStyle')}
            onPick={(v) => set({ strokeStyle: v })}
          />
        </Row>
      )}
      {props.has('roughness') && (
        <Row label="Sloppiness">
          <Segment
            choices={ROUGHNESS}
            current={value('roughness')}
            onPick={(v) => set({ roughness: v })}
          />
        </Row>
      )}
      {props.has('roundness') && (
        <Row label="Edges">
          <Segment
            choices={ROUNDNESS}
            current={value('roundness')}
            onPick={(v) => set({ roundness: v })}
          />
        </Row>
      )}
      {props.has('arrowType') && (
        <Row label="Arrow type">
          <Segment
            choices={ARROW_TYPES}
            current={value('arrowType')}
            onPick={(v) => set({ arrowType: v })}
          />
        </Row>
      )}
      {props.has('arrowheads') && (
        <Row label="Arrowheads">
          <Segment
            choices={ARROWHEADS}
            current={value('startArrowhead')}
            onPick={(v) => set({ startArrowhead: v })}
          />
          <Segment
            choices={ARROWHEADS}
            current={value('endArrowhead')}
            onPick={(v) => set({ endArrowhead: v })}
          />
        </Row>
      )}
      {props.has('fontSize') && (
        <Row label="Font size">
          <Segment
            choices={FONT_SIZES}
            current={value('fontSize')}
            onPick={(v) => set({ fontSize: v })}
          />
        </Row>
      )}
      {props.has('fontFamily') && (
        <Row label="Font">
          <Segment
            choices={FONT_FAMILIES}
            current={value('fontFamily')}
            onPick={(v) => set({ fontFamily: v })}
          />
        </Row>
      )}
      {props.has('textAlign') && (
        <Row label="Align">
          <Segment
            choices={TEXT_ALIGNS}
            current={value('textAlign')}
            onPick={(v) => set({ textAlign: v })}
          />
        </Row>
      )}
      <Row label="Opacity">
        <input
          aria-label="Opacity"
          className={css.range}
          max={100}
          min={0}
          step={10}
          type="range"
          value={typeof value('opacity') === 'number' ? (value('opacity') as number) : 100}
          onChange={(e) => set({ opacity: Number(e.target.value) })}
        />
      </Row>
      {hasSelection && (
        <Row label="Layers">
          <div className={css.options}>
            {action('Send to back', <ArrowDownToLine />, sendToBack)}
            {action('Send backward', <ArrowDown />, sendBackward)}
            {action('Bring forward', <ArrowUp />, bringForward)}
            {action('Bring to front', <ArrowUpToLine />, bringToFront)}
          </div>
        </Row>
      )}
      {hasSelection && (
        <Row label="Actions">
          <div className={css.options}>
            {action('Duplicate', <Copy />, duplicateSelection)}
            {elements.length > 1 && action('Group', <Group />, groupSelection)}
            {grouped && action('Ungroup', <Ungroup />, ungroupSelection)}
            {action('Delete', <Trash2 />, deleteSelection)}
          </div>
        </Row>
      )}
    </>
  );
  return Children.toArray((rows.props as { children: ReactNode }).children);
}
