import { Popover, PopoverPanel, PopoverTrigger } from '@haklex/rich-editor-ui';
import { Check, ChevronDown, Settings2 } from 'lucide-react';
import { useState } from 'react';

import type { ProviderConfig, SelectedModel } from '../types';
import * as css from './model-selector.css';

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
  const [open, setOpen] = useState(false);

  const currentProvider = selectedModel
    ? (providers.find((provider) => provider.id === selectedModel.providerId) ?? null)
    : null;
  const currentLabel = selectedModel ? selectedModel.modelId : 'No model';

  const providersWithModels = providers.filter((p) => p.models.length > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={css.triggerButton}>
        <span className={css.providerIcon} />
        <span className={css.triggerLabel}>
          {currentProvider ? `${currentProvider.name} / ` : ''}
          {currentLabel}
        </span>
        <ChevronDown className={css.chevronIcon} size={12} />
      </PopoverTrigger>
      <PopoverPanel align="start" className={css.popoverContent} side="top" sideOffset={10}>
        {providersWithModels.length === 0 ? (
          <div className={css.emptyState}>Configure a provider to get started</div>
        ) : (
          providersWithModels.map((provider) => (
            <div className={css.modelGroup} key={provider.id}>
              <div className={css.modelGroupLabel}>{provider.name}</div>
              {provider.models.map((modelId) => {
                const isActive =
                  selectedModel?.providerId === provider.id && selectedModel?.modelId === modelId;
                return (
                  <button
                    className={`${css.modelItem}${isActive ? ` ${css.modelItemActive}` : ''}`}
                    key={modelId}
                    type="button"
                    onClick={() => {
                      onSelectModel({ providerId: provider.id, modelId });
                      setOpen(false);
                    }}
                  >
                    <span>{modelId}</span>
                    {isActive && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          ))
        )}
        <button
          className={css.settingsLink}
          type="button"
          onClick={() => {
            setOpen(false);
            onOpenSettings();
          }}
        >
          <Settings2 size={13} />
          Settings...
        </button>
      </PopoverPanel>
    </Popover>
  );
}
