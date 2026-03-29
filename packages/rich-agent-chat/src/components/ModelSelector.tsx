import { Popover, PopoverPanel, PopoverTrigger } from '@haklex/rich-editor-ui';
import { Check, ChevronDown, Settings } from 'lucide-react';
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

  const currentLabel = selectedModel ? selectedModel.modelId : 'No model';

  const providersWithModels = providers.filter((p) => p.models.length > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={css.triggerButton}>
        {currentLabel}
        <ChevronDown className={css.chevronIcon} size={14} />
      </PopoverTrigger>
      <PopoverPanel align="start" className={css.popoverContent} side="top" sideOffset={8}>
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
                  <div
                    className={`${css.modelItem}${isActive ? ` ${css.modelItemActive}` : ''}`}
                    key={modelId}
                    onClick={() => {
                      onSelectModel({ providerId: provider.id, modelId });
                      setOpen(false);
                    }}
                  >
                    {modelId}
                    {isActive && <Check size={14} />}
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div
          className={css.settingsEntry}
          onClick={() => {
            setOpen(false);
            onOpenSettings();
          }}
        >
          <Settings size={14} />
          Provider Settings
        </div>
      </PopoverPanel>
    </Popover>
  );
}
