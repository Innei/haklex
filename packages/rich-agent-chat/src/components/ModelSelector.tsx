import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';

interface ModelSelectorProps {
  model: string;
  onModelChange: (model: string) => void;
}

const models = [
  {
    group: 'Claude',
    items: [
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
    ],
  },
  {
    group: 'OpenAI',
    items: [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'o3', label: 'o3' },
    ],
  },
];

export function getProviderFromModel(model: string): 'claude' | 'openai' {
  return model.startsWith('claude') ? 'claude' : 'openai';
}

export function ModelSelector({ model, onModelChange }: ModelSelectorProps): ReactElement {
  return (
    <Select value={model} onValueChange={onModelChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" side="bottom">
        {models.map((group) => (
          <SelectGroup key={group.group}>
            <SelectGroupLabel>{group.group}</SelectGroupLabel>
            {group.items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
