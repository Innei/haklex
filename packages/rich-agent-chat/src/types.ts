export type { ChatBubble } from '@haklex/rich-agent-core';

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  id: string;
  models: string[];
  name: string;
  type: 'claude' | 'openai-compatible';
}

export interface SelectedModel {
  modelId: string;
  providerId: string;
}
