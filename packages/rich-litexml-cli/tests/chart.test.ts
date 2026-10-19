import { allHeadlessNodes } from '@haklex/rich-headless';
import { createDefaultRegistry, serializeToXml } from '@haklex/rich-litexml';
import { createHeadlessEditor } from '@lexical/headless';
import type { SerializedEditorState } from 'lexical';
import { describe, expect, it } from 'vitest';

import { renderMarkdown } from '../src/formats/markdown';
import { parseLiteXmlToState } from '../src/shared/parse-litexml';

const SPEC =
  '{"version":1,"type":"line","x":"month","series":[{"key":"ms","label":"p95"}],"data":[{"month":"Jan","ms":120},{"month":"Feb","ms":96}],"note":"a > b & c"}';

function throughHeadless(state: SerializedEditorState): SerializedEditorState {
  const editor = createHeadlessEditor({
    nodes: allHeadlessNodes,
    onError: (error) => {
      throw error;
    },
  });
  editor.setEditorState(editor.parseEditorState(JSON.stringify(state)));
  return editor.getEditorState().toJSON();
}

function roundtrip(body: string): string {
  const state = throughHeadless(parseLiteXmlToState(`<doc>${body}</doc>`));
  return serializeToXml(state, createDefaultRegistry())
    .replace(/^<doc>\n/, '')
    .replace(/<\/doc>\n$/, '')
    .trim();
}

describe('chart through the headless editor', () => {
  it('serializes to { type, version, spec }', () => {
    const state = throughHeadless(
      parseLiteXmlToState(`<doc><chart><![CDATA[${SPEC}]]></chart></doc>`),
    );
    expect(state.root.children).toEqual([{ type: 'chart', version: 1, spec: SPEC }]);
  });

  it('round-trips a valid spec', () => {
    const input = `<chart><![CDATA[${SPEC}]]></chart>`;
    expect(roundtrip(input)).toBe(input);
  });

  it('round-trips invalid JSON verbatim', () => {
    const input = '<chart><![CDATA[{"type": "bar", "data": [1, 2]]></chart>';
    expect(roundtrip(input)).toBe(input);
  });

  it('round-trips an empty chart', () => {
    expect(roundtrip('<chart />')).toBe('<chart />');
  });

  it('exports a fenced chart block to Markdown', () => {
    const out = renderMarkdown(
      parseLiteXmlToState(`<doc><chart><![CDATA[${SPEC}]]></chart></doc>`),
    );
    expect(out).toBe(`\`\`\`chart\n${SPEC}\n\`\`\``);
  });
});
