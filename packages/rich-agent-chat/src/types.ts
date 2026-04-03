export type { ChatBubble } from '@haklex/rich-agent-core';

export interface ProviderGroup {
  icon?: React.ReactNode;
  id: string;
  models: ModelOption[];
  name: string;
  providerType: 'claude' | 'openai-compatible';
}

export interface ModelOption {
  displayName: string;
  icon?: React.ReactNode;
  id: string;
}

export interface SelectedModel {
  modelId: string;
  providerId: string;
  providerType: 'claude' | 'openai-compatible';
}
