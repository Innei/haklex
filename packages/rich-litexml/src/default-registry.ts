import { registerBuiltinReaders } from './readers/builtin';
import { registerCustomReaders } from './readers/custom';
import { LitexmlRegistry } from './registry';
import { registerBuiltinWriters } from './writers/builtin';
import { registerCustomWriters } from './writers/custom';

export function createDefaultRegistry(): LitexmlRegistry {
  const registry = new LitexmlRegistry();
  registerBuiltinWriters(registry);
  registerBuiltinReaders(registry);
  registerCustomWriters(registry);
  registerCustomReaders(registry);
  return registry;
}
