import { createDefaultRegistry, type LitexmlRegistry } from '@haklex/rich-litexml';

export type LitexmlRegistryProvider = LitexmlRegistry | (() => LitexmlRegistry);

export type LitexmlRegistryOptions = {
  litexmlRegistry?: LitexmlRegistryProvider;
};

export function resolveLitexmlRegistry(options?: LitexmlRegistryOptions): LitexmlRegistry {
  const provider = options?.litexmlRegistry;
  if (!provider) return createDefaultRegistry();
  return typeof provider === 'function' ? provider() : provider;
}
