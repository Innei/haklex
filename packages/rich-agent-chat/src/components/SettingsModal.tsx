import { Dialog, DialogHeader, DialogPopup, DialogTitle } from '@haklex/rich-editor-ui';
import { useState } from 'react';

import type { ProviderConfig } from '../types';
import * as css from './settings-modal.css';

interface SettingsModalProps {
  onOpenChange: (open: boolean) => void;
  onProvidersChange: (providers: ProviderConfig[]) => void;
  open: boolean;
  providers: ProviderConfig[];
}

const TYPE_LABELS: Record<ProviderConfig['type'], string> = {
  'claude': 'Claude API',
  'openai-compatible': 'OpenAI Compatible',
};

interface ProviderPreset {
  baseUrl: string;
  description: string;
  name: string;
  type: ProviderConfig['type'];
}

const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    name: 'Anthropic',
    type: 'claude',
    baseUrl: 'https://api.anthropic.com/v1',
    description: 'Claude models via Anthropic native API',
  },
  {
    name: 'OpenAI',
    type: 'openai-compatible',
    baseUrl: 'https://api.openai.com/v1',
    description: 'GPT models via OpenAI API',
  },
  {
    name: 'OpenRouter',
    type: 'openai-compatible',
    baseUrl: 'https://openrouter.ai/api/v1',
    description: 'Multi-provider gateway',
  },
  {
    name: 'DeepSeek',
    type: 'openai-compatible',
    baseUrl: 'https://api.deepseek.com/v1',
    description: 'DeepSeek models',
  },
  {
    name: 'Ollama',
    type: 'openai-compatible',
    baseUrl: 'http://localhost:11434/v1',
    description: 'Local models via Ollama',
  },
  {
    name: 'Custom',
    type: 'openai-compatible',
    baseUrl: '',
    description: 'OpenAI-compatible endpoint',
  },
];

export function SettingsModal({
  open,
  onOpenChange,
  providers,
  onProvidersChange,
}: SettingsModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(providers[0]?.id ?? null);
  const [addingType, setAddingType] = useState(false);
  const [fetching, setFetching] = useState(false);

  const selectedProvider = providers.find((p) => p.id === selectedId) ?? null;

  function updateProvider(id: string, patch: Partial<ProviderConfig>) {
    onProvidersChange(providers.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function addProvider(preset: ProviderPreset) {
    const newProvider: ProviderConfig = {
      id: crypto.randomUUID(),
      type: preset.type,
      name: preset.name,
      apiKey: '',
      baseUrl: preset.baseUrl,
      models: [],
    };
    onProvidersChange([...providers, newProvider]);
    setSelectedId(newProvider.id);
    setAddingType(false);
  }

  function deleteProvider(id: string) {
    const next = providers.filter((p) => p.id !== id);
    onProvidersChange(next);
    setSelectedId(next[0]?.id ?? null);
  }

  async function fetchModels(provider: ProviderConfig) {
    setFetching(true);
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': provider.apiKey,
          'x-base-url': provider.baseUrl,
          'x-provider-type': provider.type,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { models: Array<{ id: string }> };
      updateProvider(provider.id, {
        models: data.models.map((m) => m.id),
      });
    } catch (err) {
      console.error('Failed to fetch models:', err);
    } finally {
      setFetching(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup showCloseButton className={css.dialogPopup}>
        <DialogHeader>
          <DialogTitle>Provider Settings</DialogTitle>
        </DialogHeader>
        <div className={css.modalBody}>
          <div className={css.sidebar}>
            <div className={css.sidebarLabel}>Providers</div>
            {providers.map((p) => (
              <div
                className={`${css.providerItem}${p.id === selectedId ? ` ${css.providerItemActive}` : ''}`}
                key={p.id}
                onClick={() => {
                  setSelectedId(p.id);
                  setAddingType(false);
                }}
              >
                <div className={css.providerItemName}>{p.name}</div>
                <div className={css.providerItemType}>{TYPE_LABELS[p.type]}</div>
              </div>
            ))}
            <div
              className={css.addButton}
              onClick={() => {
                setSelectedId(null);
                setAddingType(true);
              }}
            >
              + Add Provider
            </div>
          </div>

          <div className={css.formPane}>
            {addingType ? (
              <div className={css.typeSelector}>
                <div className={css.typeSelectorTitle}>Choose Provider</div>
                <div className={css.presetGrid}>
                  {PROVIDER_PRESETS.map((preset) => (
                    <div
                      className={css.typeOption}
                      key={preset.name}
                      onClick={() => addProvider(preset)}
                    >
                      <div className={css.typeOptionName}>{preset.name}</div>
                      <div className={css.typeOptionDesc}>{preset.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedProvider ? (
              <>
                <div className={css.formHeader}>
                  <input
                    className={css.formTitleInput}
                    value={selectedProvider.name}
                    onChange={(e) =>
                      updateProvider(selectedProvider.id, {
                        name: e.target.value,
                      })
                    }
                  />
                  <span className={css.typeBadge}>{TYPE_LABELS[selectedProvider.type]}</span>
                </div>
                <div className={css.fieldGroup}>
                  <div className={css.fieldLabel}>API Key</div>
                  <input
                    className={css.fieldInput}
                    placeholder="Enter API key"
                    type="password"
                    value={selectedProvider.apiKey}
                    onChange={(e) =>
                      updateProvider(selectedProvider.id, {
                        apiKey: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={css.fieldGroup}>
                  <div className={css.fieldLabel}>Base URL</div>
                  <input
                    className={css.fieldInput}
                    placeholder="https://api.example.com"
                    value={selectedProvider.baseUrl}
                    onChange={(e) =>
                      updateProvider(selectedProvider.id, {
                        baseUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={css.actions}>
                  <button
                    className={css.actionButton}
                    disabled={!selectedProvider.apiKey || !selectedProvider.baseUrl || fetching}
                    onClick={() => fetchModels(selectedProvider)}
                  >
                    {fetching ? 'Fetching...' : 'Fetch Models'}
                  </button>
                  <button
                    className={css.deleteButton}
                    onClick={() => deleteProvider(selectedProvider.id)}
                  >
                    Delete
                  </button>
                </div>
                {selectedProvider.models.length > 0 && (
                  <div className={css.modelTags}>
                    <div className={css.modelTagsLabel}>Available Models</div>
                    <div className={css.modelTagList}>
                      {selectedProvider.models.map((m) => (
                        <span className={css.modelTag} key={m}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={css.emptyForm}>Select a provider or add a new one</div>
            )}
          </div>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
