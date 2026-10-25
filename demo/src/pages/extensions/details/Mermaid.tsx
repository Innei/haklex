import { ColorSchemeProvider, getVariantClass } from '@haklex/rich-editor';
import { MermaidEditRenderer, MermaidRenderer } from '@haklex/rich-renderer-mermaid';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import { useState } from 'react';

import { Panel } from '../../../components/Panel';
import { useTheme } from '../../../context/ThemeContext';

interface MermaidSample {
  code: string;
  description: string;
  key: string;
  label: string;
}

const mermaidSamples: MermaidSample[] = [
  {
    key: 'flowchart-td',
    label: 'Flowchart · TD',
    description: 'Top-down flowchart with a decision branch.',
    code: `flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Action]
  B -->|No| D[Skip]
  C --> E[End]
  D --> E`,
  },
  {
    key: 'flowchart-lr',
    label: 'Flowchart · LR',
    description: 'Left-to-right data pipeline.',
    code: `flowchart LR
  A[Source] --> B[Transform]
  B --> C[Filter]
  C --> D[Sink]`,
  },
  {
    key: 'state',
    label: 'State Diagram',
    description: 'Finite state machine with retry loop.',
    code: `stateDiagram-v2
  [*] --> Idle
  Idle --> Loading: fetch
  Loading --> Success: ok
  Loading --> Error: fail
  Error --> Idle: retry
  Success --> [*]`,
  },
  {
    key: 'sequence',
    label: 'Sequence',
    description: 'Cross-actor interactions over time.',
    code: `sequenceDiagram
  participant C as Client
  participant S as Server
  participant DB
  C->>S: POST /login
  S->>DB: SELECT user
  DB-->>S: row
  S-->>C: JWT`,
  },
  {
    key: 'class',
    label: 'Class Diagram',
    description: 'UML-style class hierarchy.',
    code: `classDiagram
  class Node {
    +String type
    +clone() Node
  }
  class DecoratorNode {
    +decorate() ReactElement
  }
  class MermaidNode {
    -String diagram
  }
  Node <|-- DecoratorNode
  DecoratorNode <|-- MermaidNode`,
  },
  {
    key: 'er',
    label: 'ER Diagram',
    description: 'Entity-relationship between database tables.',
    code: `erDiagram
  USER ||--o{ POST : writes
  POST ||--|{ COMMENT : has
  USER {
    string name
    string email
  }
  POST {
    string title
    text body
  }
  COMMENT {
    text body
  }`,
  },
  {
    key: 'xy-bar',
    label: 'XY Chart · Bar',
    description: 'Categorical bar chart.',
    code: `xychart-beta
  title "Monthly Downloads"
  x-axis [Jan, Feb, Mar, Apr, May, Jun]
  y-axis "Count" 0 --> 12000
  bar [5200, 7100, 8400, 6800, 9600, 11200]`,
  },
  {
    key: 'xy-line',
    label: 'XY Chart · Line',
    description: 'Continuous trend line.',
    code: `xychart-beta
  title "Active Users"
  x-axis [W1, W2, W3, W4, W5, W6]
  y-axis "Users" 0 --> 1500
  line [320, 460, 580, 720, 980, 1280]`,
  },
];

export function MermaidDetail() {
  const theme = useTheme();
  const [editContent, setEditContent] = useState(mermaidSamples[0].code);

  return (
    <PortalThemeProvider className={getVariantClass('article')} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <p
          style={{
            margin: '0 0 16px',
            color: 'var(--rc-text-tertiary)',
            fontSize: 14,
          }}
        >
          Sync SVG rendering via <code>Pele</code>, including flowcharts, sequence and class
          diagrams, ER, XY charts, Gantt charts, pie charts, mindmaps, and timelines.
        </p>

        <div className="biz-masonry">
          {mermaidSamples.map((sample) => (
            <Panel badge={`mermaid · ${sample.key}`} key={sample.key} title={sample.label}>
              <p className="node-description">{sample.description}</p>
              <div
                className={`node-render ${getVariantClass('article')}`}
                data-color-scheme={theme}
                data-theme={theme}
              >
                <MermaidRenderer content={sample.code} />
              </div>
            </Panel>
          ))}

          <Panel badge="mermaid · edit" title="Edit Mode">
            <p className="node-description">
              Hover the diagram to reveal the Edit button. The dialog opens a code editor with live
              preview, templates, copy, and SVG download.
            </p>
            <div
              className={`node-render ${getVariantClass('article')}`}
              data-color-scheme={theme}
              data-theme={theme}
            >
              <MermaidEditRenderer content={editContent} onContentChange={setEditContent} />
            </div>
          </Panel>
        </div>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}
