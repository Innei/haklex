import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

/** Structured XML element for serializer output */
export interface XmlElement {
  attrs?: Record<string, string>;
  children?: XmlContent[];
  selfClosing?: boolean;
  tag: string;
}

/** CDATA wrapper — rendered as <![CDATA[...]]> without escaping */
export interface XmlCdata {
  cdata: string;
}

/** XML content: either a structured element, raw text (will be escaped), or CDATA */
export type XmlContent = XmlElement | XmlCdata | string;

/** Context provided to writer functions */
export interface WriterContext {
  /** Serialize an array of child nodes into XML content */
  serializeChildren: (children: SerializedLexicalNode[]) => XmlContent[];
  /** Serialize a nested SerializedEditorState's root children into XmlContent[] (for container nodes like alert-quote, banner) */
  serializeNestedState: (state: SerializedEditorState) => XmlContent[];
  /** Serialize a single node into XML content */
  serializeNode: (node: SerializedLexicalNode) => XmlContent | XmlContent[];
}

/** Context provided to reader functions */
export interface ReaderContext {
  /** Parse all child elements of a DOM element into serialized nodes */
  parseChildren: (element: Element) => SerializedLexicalNode[];
  /** Parse a nested XML string into SerializedEditorState (for container nodes) */
  parseNestedState: (xml: string) => SerializedEditorState;
}

/**
 * Writer: converts a SerializedLexicalNode to XML representation.
 * Return `false` to indicate this writer does not handle the node.
 */
export type XmlWriterFn = (
  node: SerializedLexicalNode,
  ctx: WriterContext,
) => XmlContent | XmlContent[] | false;

/**
 * Reader: converts a DOM Element to SerializedLexicalNode(s).
 * Return `false` to indicate this reader does not handle the element.
 */
export type XmlReaderFn = (
  element: Element,
  ctx: ReaderContext,
) => SerializedLexicalNode | SerializedLexicalNode[] | false;
