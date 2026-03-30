import type { XmlReaderFn, XmlWriterFn } from './types';

export class LitexmlRegistry {
  private writers = new Map<string, XmlWriterFn>();
  private readers = new Map<string, XmlReaderFn>();

  registerWriter(nodeType: string, writer: XmlWriterFn): void {
    this.writers.set(nodeType, writer);
  }

  registerReader(tagName: string, reader: XmlReaderFn): void {
    this.readers.set(tagName.toLowerCase(), reader);
  }

  getWriter(nodeType: string): XmlWriterFn | undefined {
    return this.writers.get(nodeType);
  }

  getReader(tagName: string): XmlReaderFn | undefined {
    return this.readers.get(tagName.toLowerCase());
  }
}
