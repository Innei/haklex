import type { SerializedEditorState } from 'lexical';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface JsonPanelProps {
  data: SerializedEditorState;
  note: string;
}

export function JsonPanel({ data, note }: JsonPanelProps) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const copy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="wb-fill">
      <div className="wb-fill-bar">
        <span>{note}</span>
        <button className="btn btn-sm" type="button" onClick={copy}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="wb-json">{json}</pre>
    </div>
  );
}
