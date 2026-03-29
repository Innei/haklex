import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@haklex/rich-editor-ui';
import { ModelIcon } from '@lobehub/icons/es/features';
import { Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { ProviderConfig, SelectedModel } from '../types';
import { MODEL_DISPLAY_NAMES } from './model-display-names';
import * as css from './model-selector.css';

// --- Name formatting ---

const MODEL_NAME_RULES: Array<[RegExp, string]> = [
  [/^claude-?(opus|sonnet|haiku)-?(\d[\d.]*)/i, 'Claude $1 $2'],
  [/^claude-?(\d[\d.]*)-?(opus|sonnet|haiku)/i, 'Claude $2 $1'],
  [/^gpt-?(\d[\d.]*)-?codex-?mini/i, 'GPT-$1 Codex Mini'],
  [/^gpt-?(\d[\d.]*)-?codex/i, 'GPT-$1 Codex'],
  [/^gpt-?(\d[\d.]*)-?mini/i, 'GPT-$1 Mini'],
  [/^gpt-?(\d[\d.]*)-?turbo/i, 'GPT-$1 Turbo'],
  [/^gpt-?(\d[\d.]*)-?pro/i, 'GPT-$1 Pro'],
  [/^gpt-?(\d[\d.]*)/i, 'GPT-$1'],
  [/^o(\d+)-?pro/i, 'o$1 Pro'],
  [/^o(\d+)-?mini/i, 'o$1 Mini'],
  [/^o(\d+)/i, 'o$1'],
  [/^gemini-?(\d[\d.]*)-?flash-?lite/i, 'Gemini $1 Flash Lite'],
  [/^gemini-?(\d[\d.]*)-?flash/i, 'Gemini $1 Flash'],
  [/^gemini-?(\d[\d.]*)-?pro/i, 'Gemini $1 Pro'],
  [/^gemini-?(\d[\d.]*)/i, 'Gemini $1'],
  [/^deepseek-?(r1|v[\d.]+|chat|coder|reasoner)/i, 'DeepSeek $1'],
  [/^deepseek/i, 'DeepSeek'],
  [/^grok-?(\d[\d.]*)-?(fast|mini)/i, 'Grok $1 $2'],
  [/^grok-?(\d[\d.]*)/i, 'Grok $1'],
  [/^qwen-?(\d[\d.]*)-?coder/i, 'Qwen $1 Coder'],
  [/^qwen-?(\d[\d.]*)/i, 'Qwen $1'],
  [/^llama-?(\d[\d.]*)/i, 'Llama $1'],
  [/^mistral-?(large|medium|small|nemo)/i, 'Mistral $1'],
  [/^doubao-?seed-?([\d.]+)/i, 'Doubao Seed $1'],
  [/^doubao-?([\d.]+)/i, 'Doubao $1'],
];

function humanModelName(modelId: string): string {
  const bare = modelId.includes('/') ? modelId.slice(modelId.indexOf('/') + 1) : modelId;

  if (MODEL_DISPLAY_NAMES[bare]) return MODEL_DISPLAY_NAMES[bare];
  if (MODEL_DISPLAY_NAMES[modelId]) return MODEL_DISPLAY_NAMES[modelId];

  const stripped = bare.replaceAll(/-\d{8,}$/g, '').replaceAll(/-latest$/g, '');
  if (MODEL_DISPLAY_NAMES[stripped]) return MODEL_DISPLAY_NAMES[stripped];

  for (const [pattern, replacement] of MODEL_NAME_RULES) {
    if (pattern.test(stripped)) {
      return stripped.replace(pattern, replacement).trim().replaceAll(/\s+/g, ' ');
    }
  }

  return bare
    .replaceAll(/-\d{8,}$/g, '')
    .replaceAll(/[_-]/g, ' ')
    .replaceAll(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// --- Option type ---

interface ModelOption {
  displayName: string;
  modelId: string;
  providerId: string;
  providerName: string;
}

// --- Component ---

interface ModelSelectorProps {
  onOpenSettings: () => void;
  onSelectModel: (selected: SelectedModel) => void;
  providers: ProviderConfig[];
  selectedModel: SelectedModel | null;
}

export function ModelSelector({
  providers,
  selectedModel,
  onSelectModel,
  onOpenSettings,
}: ModelSelectorProps) {
  const options = useMemo(() => {
    const result: ModelOption[] = [];
    for (const provider of providers) {
      for (const modelId of provider.models) {
        result.push({
          displayName: humanModelName(modelId),
          modelId,
          providerId: provider.id,
          providerName: provider.name,
        });
      }
    }
    return result;
  }, [providers]);

  const selectedOption = selectedModel
    ? (options.find(
        (o) => o.providerId === selectedModel.providerId && o.modelId === selectedModel.modelId,
      ) ?? null)
    : null;

  const [inputValue, setInputValue] = useState('');

  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return options;
    const keyword = inputValue.trim().toLowerCase();
    return options.filter(
      (opt) =>
        opt.displayName.toLowerCase().includes(keyword) ||
        opt.modelId.toLowerCase().includes(keyword),
    );
  }, [options, inputValue]);

  const groupedOptions = useMemo(() => {
    const groups: Record<string, { name: string; options: ModelOption[] }> = {};
    for (const opt of filteredOptions) {
      if (!groups[opt.providerId]) {
        groups[opt.providerId] = { name: opt.providerName, options: [] };
      }
      groups[opt.providerId].options.push(opt);
    }
    return groups;
  }, [filteredOptions]);

  return (
    <div className={css.selectorWrapper}>
      <Combobox<ModelOption>
        isItemEqualToValue={(a, b) => a.providerId === b.providerId && a.modelId === b.modelId}
        itemToStringLabel={(opt) => opt.displayName}
        value={selectedOption}
        onInputValueChange={(val) => setInputValue(val)}
        onValueChange={(val) => {
          if (val) onSelectModel({ modelId: val.modelId, providerId: val.providerId });
        }}
      >
        <ComboboxTrigger className={css.triggerButton}>
          {selectedOption ? (
            <ModelIcon model={selectedOption.modelId} size={16} type="color" />
          ) : (
            <span className={css.fallbackIcon} />
          )}
          <span className={css.triggerLabel}>
            {selectedOption ? selectedOption.displayName : 'No model'}
          </span>
        </ComboboxTrigger>
        <ComboboxContent className={css.selectContent} side="top" sideOffset={8}>
          <div className={css.searchWrapper}>
            <ComboboxInput className={css.searchInput} placeholder="Search models..." />
          </div>
          <ComboboxList>
            {Object.entries(groupedOptions).map(([providerId, group]) => (
              <ComboboxGroup key={providerId}>
                <ComboboxGroupLabel className={css.groupLabel}>{group.name}</ComboboxGroupLabel>
                {group.options.map((opt) => (
                  <ComboboxItem key={`${opt.providerId}::${opt.modelId}`} value={opt}>
                    <span className={css.itemInner}>
                      <ModelIcon model={opt.modelId} size={16} type="color" />
                      <span className={css.itemText}>{opt.displayName}</span>
                    </span>
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            ))}
            <ComboboxEmpty>
              <div className={css.emptyState}>
                {options.length === 0 ? 'Configure a provider to get started' : 'No models found'}
              </div>
            </ComboboxEmpty>
          </ComboboxList>
          <div className={css.settingsFooter}>
            <button
              className={css.settingsLink}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
              }}
            >
              <Settings2 size={13} />
              Settings...
            </button>
          </div>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
