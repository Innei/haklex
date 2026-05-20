import { type ComponentType, createContext, type ReactNode, use } from 'react';

import type { RichRendererModule } from './types';

export interface ConfigurableModule<TConfig> extends RichRendererModule {
  setup: (config: TConfig) => RichRendererModule;
}

export interface DefineConfigurableModuleResult<TConfig> {
  createModule: (base: Omit<RichRendererModule, 'name'>) => ConfigurableModule<TConfig>;
  useConfig: () => TConfig;
}

type ProviderComponent = ComponentType<{ children: ReactNode }>;

function chainProviders(
  outer: ProviderComponent | undefined,
  inner: ProviderComponent,
): ProviderComponent {
  if (!outer) return inner;
  const Outer = outer;
  const Inner = inner;
  const Chained: ProviderComponent = ({ children }) => (
    <Outer>
      <Inner>{children}</Inner>
    </Outer>
  );
  Chained.displayName = 'ChainedProvider';
  return Chained;
}

/**
 * Build a configurable module factory. The config travels to renderers through
 * a dedicated React Context (the module `Provider`); `useConfig` reads it.
 * `createModule(base)` produces a `ConfigurableModule` usable directly (default
 * config) or via `.setup(config)` — the NestJS `DynamicModule` analog.
 */
export function defineConfigurableModule<TConfig extends object>(opts: {
  defaultConfig: TConfig;
  name: string;
}): DefineConfigurableModuleResult<TConfig> {
  const ConfigContext = createContext<TConfig>(opts.defaultConfig);

  const useConfig = (): TConfig => use(ConfigContext);

  function createModule(base: Omit<RichRendererModule, 'name'>): ConfigurableModule<TConfig> {
    function build(config: TConfig): RichRendererModule {
      const ConfigProvider: ProviderComponent = ({ children }) => (
        <ConfigContext value={config}>{children}</ConfigContext>
      );
      ConfigProvider.displayName = `${opts.name}ConfigProvider`;
      return {
        ...base,
        name: opts.name,
        Provider: chainProviders(base.Provider, ConfigProvider),
      };
    }

    const configurable = build(opts.defaultConfig) as ConfigurableModule<TConfig>;
    configurable.setup = (config) => build({ ...opts.defaultConfig, ...config });
    return configurable;
  }

  return { createModule, useConfig };
}
