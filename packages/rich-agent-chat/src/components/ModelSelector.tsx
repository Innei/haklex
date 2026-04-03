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
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { ProviderGroup, SelectedModel } from '../types';
import * as css from './model-selector.css';

interface FlatOption {
  displayName: string;
  icon?: React.ReactNode;
  modelId: string;
  providerId: string;
  providerName: string;
}

interface ModelSelectorProps {
  onSelectModel: (selected: SelectedModel) => void;
  providerGroups: ProviderGroup[];
  selectedModel: SelectedModel | null;
}

export function ModelSelector({
  providerGroups,
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) {
  const options = useMemo(() => {
    const result: FlatOption[] = [];
    for (const group of providerGroups) {
      for (const model of group.models) {
        result.push({
          displayName: model.displayName,
          icon: model.icon,
          modelId: model.id,
          providerId: group.id,
          providerName: group.name,
        });
      }
    }
    return result;
  }, [providerGroups]);

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
    const groups: Record<string, { name: string; options: FlatOption[] }> = {};
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
      <Combobox<FlatOption>
        isItemEqualToValue={(a, b) => a.providerId === b.providerId && a.modelId === b.modelId}
        itemToStringLabel={(opt) => opt.displayName}
        value={selectedOption}
        onInputValueChange={(val) => setInputValue(val)}
        onValueChange={(val) => {
          if (val) {
            const group = providerGroups.find((g) => g.id === val.providerId);
            if (!group) return;
            onSelectModel({
              modelId: val.modelId,
              providerId: val.providerId,
              providerType: group.providerType,
            });
          }
        }}
      >
        <ComboboxTrigger className={css.triggerButton}>
          {selectedOption?.icon ?? <span className={css.modelDot} />}
          <span className={css.triggerLabel}>
            {selectedOption ? selectedOption.displayName : 'Select model'}
          </span>
          <ChevronDown className={css.triggerChevron} size={12} />
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
                      {opt.icon}
                      <span className={css.itemText}>{opt.displayName}</span>
                    </span>
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            ))}
            <ComboboxEmpty>
              <div className={css.emptyState}>No models found</div>
            </ComboboxEmpty>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
