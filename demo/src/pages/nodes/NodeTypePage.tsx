import type { SerializedEditorState } from 'lexical';
import { use, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { DocPage } from '../../components/doc/DocPage';
import { Segmented } from '../../components/ui/Segmented';
import { VariantPicker } from '../../components/VariantPicker';
import { useTheme } from '../../context/ThemeContext';
import { VariantContext } from '../../context/VariantContext';
import type { NodeSample } from '../../fixtures';
import { nodeSamples } from '../../fixtures';
import type { NodeTypeMeta } from '../../fixtures/node-types';
import { nodeTypes } from '../../fixtures/node-types';
import { LexicalEditor, LexicalRenderer } from '../../lexical';

type Mode = 'rendered' | 'editable';

const categoryLabels = { inline: 'Inline', block: 'Block', container: 'Container' } as const;

function shortLabel(label: string) {
  const index = label.indexOf(' - ');
  return index === -1 ? label : label.slice(index + 3);
}

function NodeTypeContent({ meta }: { meta: NodeTypeMeta }) {
  const theme = useTheme();
  const variant = use(VariantContext);
  const [mode, setMode] = useState<Mode>('rendered');
  const [live, setLive] = useState<Record<string, SerializedEditorState>>({});
  const samples = meta.sampleKeys
    .map((key) => nodeSamples.find((s) => s.key === key))
    .filter((s): s is NodeSample => !!s);
  const [jsonKey, setJsonKey] = useState(samples[0].key);
  const jsonSample = samples.find((s) => s.key === jsonKey) ?? samples[0];
  const json = JSON.stringify(live[jsonSample.key] ?? jsonSample.data, null, 2);

  return (
    <>
      <section className="doc-section">
        <h2 className="doc-h2">Preview</h2>
        <div className="doc-tabs" style={{ marginTop: 12 }}>
          <div className="doc-tablist" role="tablist">
            {(['rendered', 'editable'] as const).map((m) => (
              <button
                aria-selected={mode === m}
                className="doc-tab"
                key={m}
                role="tab"
                type="button"
                onClick={() => setMode(m)}
              >
                {m === 'rendered' ? 'Rendered' : 'Editable'}
              </button>
            ))}
          </div>
          <VariantPicker />
        </div>
        <div className="preview-frame" role="tabpanel">
          {samples.map((sample) => (
            <div key={sample.key}>
              {samples.length > 1 && <div className="preview-caption">{sample.label}</div>}
              {mode === 'editable' ? (
                <LexicalEditor
                  initialValue={live[sample.key] ?? sample.data}
                  key={`${sample.key}-edit-${variant}`}
                  theme={theme}
                  variant={variant}
                  onChange={(state) => setLive((prev) => ({ ...prev, [sample.key]: state }))}
                />
              ) : (
                <LexicalRenderer
                  key={`${sample.key}-render`}
                  theme={theme}
                  value={live[sample.key] ?? sample.data}
                  variant={variant}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="doc-section">
        <h2 className="doc-h2">Serialized JSON</h2>
        <p className="doc-note">
          The editor state for {samples.length > 1 ? 'the selected sample' : 'this sample'}. Edits
          made in Editable mode show up here.
        </p>
        {samples.length > 1 && (
          <div style={{ marginBottom: 12 }}>
            <Segmented
              label="Sample"
              options={samples.map((s) => ({ value: s.key, label: shortLabel(s.label) }))}
              value={jsonSample.key}
              onChange={setJsonKey}
            />
          </div>
        )}
        <div className="codebox">
          <div className="codebox-head">
            json
            <button
              className="btn btn-sm"
              style={{ border: 0 }}
              type="button"
              onClick={() => navigator.clipboard.writeText(json)}
            >
              Copy
            </button>
          </div>
          <pre>{json}</pre>
        </div>
      </section>
    </>
  );
}

export function NodeTypePage() {
  const { type } = useParams();
  const meta = nodeTypes.find((t) => t.type === type);
  if (!meta) return <Navigate replace to="/nodes" />;

  return (
    <DocPage
      breadcrumb={['Reference', 'Nodes', categoryLabels[meta.category]]}
      lead={meta.description}
      title={meta.label}
      meta={
        <>
          <span className="chip-code">{meta.type}</span>
          <span className="badge">{meta.packageName}</span>
          <span className="badge">{meta.hasEdit ? 'static + edit' : 'static'}</span>
        </>
      }
    >
      <NodeTypeContent key={meta.type} meta={meta} />
    </DocPage>
  );
}
