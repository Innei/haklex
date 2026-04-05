export { createDefaultRegistry } from './default-registry';
export { deserializeFromXml, deserializeNodesFromXml } from './deserializer';
export { registerBuiltinReaders } from './readers/builtin';
export { registerCustomReaders } from './readers/custom';
export { LitexmlRegistry } from './registry';
export type { XmlSerializerOptions } from './serializer';
export { serializeNodesToXml, serializeToXml } from './serializer';
export type {
  ReaderContext,
  WriterContext,
  XmlCdata,
  XmlContent,
  XmlElement,
  XmlReaderFn,
  XmlWriterFn,
} from './types';
export { registerBuiltinWriters } from './writers/builtin';
export { registerCustomWriters } from './writers/custom';
export type { XmlRenderOptions } from './xml-utils';
