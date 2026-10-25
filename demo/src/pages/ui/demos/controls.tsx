import {
  ActionBar,
  ActionButton,
  AnimatedCheckbox,
  AnimatedTabs,
  AutoResizeTextArea,
  ColorPicker,
  SegmentedControl,
} from '@haklex/rich-editor-ui';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
  focus,
  focusVisible,
  Force,
  hover,
  StateCell,
  StateGrid,
} from '../../../components/preview/States';
import type { ComponentDemo } from '../../components/types';

const variants = ['ghost', 'solid', 'outline', 'accent'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

export const actionButtonDemo: ComponentDemo = {
  statesNote:
    'Hover and focus are forced by mirroring the component’s own :hover and :focus-visible rules onto a data attribute.',
  Preview: () => (
    <div className="demo-center">
      <ActionBar>
        {variants.map((v) => (
          <ActionButton key={v} variant={v}>
            {v[0].toUpperCase() + v.slice(1)}
          </ActionButton>
        ))}
        <ActionButton icon aria-label="Add" variant="ghost">
          <Plus size={16} />
        </ActionButton>
        <ActionButton danger variant="outline">
          <Trash2 size={14} />
          Delete
        </ActionButton>
      </ActionBar>
    </div>
  ),
  States: () => (
    <div className="demo-stack">
      <table className="state-table">
        <thead>
          <tr>
            <th />
            <th>Idle</th>
            <th>Hover</th>
            <th>Focus</th>
            <th>Disabled</th>
            <th>Danger</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v}>
              <th>{v}</th>
              <td>
                <ActionButton variant={v}>Button</ActionButton>
              </td>
              <td>
                <Force attrs={hover}>
                  <ActionButton variant={v}>Button</ActionButton>
                </Force>
              </td>
              <td>
                <Force attrs={focusVisible}>
                  <ActionButton variant={v}>Button</ActionButton>
                </Force>
              </td>
              <td>
                <ActionButton disabled variant={v}>
                  Button
                </ActionButton>
              </td>
              <td>
                <ActionButton danger variant={v}>
                  Delete
                </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <StateGrid>
        {sizes.map((s) => (
          <StateCell key={s} label={`Size ${s}`}>
            <ActionButton size={s} variant="outline">
              Button
            </ActionButton>
            <ActionButton icon aria-label="Add" size={s} variant="outline">
              <Plus size={14} />
            </ActionButton>
          </StateCell>
        ))}
        <StateCell label="Rounded">
          <ActionButton rounded variant="solid">
            Rounded
          </ActionButton>
        </StateCell>
      </StateGrid>
    </div>
  ),
};

const viewItems = [
  { value: 'preview', label: 'Preview' },
  { value: 'code', label: 'Code' },
  { value: 'split', label: 'Split' },
];

function Segmented({ fullWidth, size }: { fullWidth?: boolean; size?: 'sm' | 'md' }) {
  const [value, setValue] = useState('preview');
  return (
    <SegmentedControl
      fullWidth={fullWidth}
      items={viewItems}
      size={size}
      value={value}
      onChange={setValue}
    />
  );
}

export const segmentedControlDemo: ComponentDemo = {
  Preview: () => (
    <div className="demo-center demo-stack">
      <Segmented size="md" />
      <Segmented size="sm" />
    </div>
  ),
  States: () => (
    <StateGrid>
      <StateCell label="Size md">
        <Segmented size="md" />
      </StateCell>
      <StateCell label="Size sm">
        <Segmented size="sm" />
      </StateCell>
      <StateCell label="Item hover">
        <Force attrs={hover} target="button:nth-of-type(2)">
          <Segmented />
        </Force>
      </StateCell>
      <StateCell label="Disabled item">
        <SegmentedControl
          items={[...viewItems.slice(0, 2), { ...viewItems[2], disabled: true }]}
          value="preview"
          onChange={() => {}}
        />
      </StateCell>
      <StateCell label="Full width">
        <div className="demo-fill">
          <Segmented fullWidth />
        </div>
      </StateCell>
    </StateGrid>
  ),
};

export const animatedTabsDemo: ComponentDemo = {
  statesNote: 'Active and idle tabs show in the preview. Click a tab to see the indicator slide.',
  Preview: () => (
    <div className="demo-center">
      <AnimatedTabs
        tabs={[
          { id: 'preview', label: 'Preview' },
          { id: 'code', label: 'Code' },
          { id: 'json', label: 'JSON' },
        ]}
      />
    </div>
  ),
};

export const checkboxDemo: ComponentDemo = {
  Preview: () => (
    <div className="demo-center demo-stack">
      <AnimatedCheckbox defaultChecked label="Show outline" />
      <AnimatedCheckbox description="Hide the sidebar while writing." label="Focus mode" />
    </div>
  ),
  States: () => (
    <StateGrid>
      <StateCell label="Unchecked">
        <AnimatedCheckbox label="Label" />
      </StateCell>
      <StateCell label="Checked">
        <AnimatedCheckbox checked label="Label" />
      </StateCell>
      <StateCell label="Hover">
        <Force attrs={hover}>
          <AnimatedCheckbox label="Label" />
        </Force>
      </StateCell>
      <StateCell label="Focus">
        <Force attrs={focusVisible}>
          <AnimatedCheckbox label="Label" />
        </Force>
      </StateCell>
      <StateCell label="Disabled">
        <AnimatedCheckbox disabled label="Label" />
      </StateCell>
      <StateCell label="Disabled checked">
        <AnimatedCheckbox checked disabled label="Label" />
      </StateCell>
    </StateGrid>
  ),
};

function ColorPickerPreview() {
  const [color, setColor] = useState('#2563eb');
  return (
    <div className="demo-center">
      <ColorPicker currentColor={color} onSelect={setColor} />
    </div>
  );
}

export const colorPickerDemo: ComponentDemo = {
  statesNote: 'The selected swatch shows in the preview. Choose “Custom” to open the picker view.',
  Preview: ColorPickerPreview,
};

export const textareaDemo: ComponentDemo = {
  Preview: () => (
    <div className="demo-center demo-fill">
      <AutoResizeTextArea maxRows={6} minRows={2} placeholder="Write a caption…" />
    </div>
  ),
  States: () => (
    <StateGrid>
      <StateCell label="Placeholder">
        <AutoResizeTextArea minRows={2} placeholder="Placeholder" />
      </StateCell>
      <StateCell label="Filled">
        <AutoResizeTextArea defaultValue="A caption that wraps onto a second line." minRows={2} />
      </StateCell>
      <StateCell label="Focus">
        <Force attrs={focus}>
          <AutoResizeTextArea minRows={2} placeholder="Focused" />
        </Force>
      </StateCell>
      <StateCell label="Disabled">
        <AutoResizeTextArea disabled minRows={2} placeholder="Disabled" />
      </StateCell>
    </StateGrid>
  ),
};
