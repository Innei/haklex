export { createDefaultRegistry } from './default-registry';
export { deserializeFromXml, deserializeNodesFromXml } from './deserializer';
export { registerBuiltinReaders } from './readers/builtin';
export { registerCustomReaders } from './readers/custom';
export { LitexmlRegistry } from './registry';
export { serializeNodesToXml, serializeToXml } from './serializer';
export type {
  ReaderContext,
  WriterContext,
  XmlContent,
  XmlElement,
  XmlReaderFn,
  XmlWriterFn,
} from './types';
export { registerBuiltinWriters } from './writers/builtin';
export { registerCustomWriters } from './writers/custom';
