import type { SerializedEditorState } from 'lexical';
import { useId, useState } from 'react';

import { parseEditorState } from './parse-editor-state';

export function ImportPanel({ onLoad }: { onLoad: (state: SerializedEditorState) => void }) {
  const id = useId();
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    const result = parseEditorState(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onLoad(result.state);
    setText('');
    setError('');
  };

  return (
    <div className="wb-fill">
      <label className="wb-fill-bar" htmlFor={id}>
        Paste a serialized EditorState. Loading replaces the editor content.
      </label>
      <textarea
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
        className="import-textarea wb-import"
        id={id}
        placeholder='{ "root": { "type": "root", "children": [ … ] } }'
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError('');
        }}
      />
      <div className="wb-fill-foot">
        {error && (
          <span className="wb-error" id={`${id}-error`} role="alert">
            {error}
          </span>
        )}
        <button className="btn btn-primary" type="button" onClick={load}>
          Load into editor
        </button>
      </div>
    </div>
  );
}
