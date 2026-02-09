import { RichRenderer } from '@shiro/rich-editor'

import { JsonViewer } from '../components/JsonViewer'
import { Panel } from '../components/Panel'
import { nodeSamples } from '../fixtures'
import { enhancedRendererConfig } from '../fixtures/enhanced-renderers'

export function NodeShowcase() {
  const inlineNodes = nodeSamples.filter((n) => n.category === 'inline')
  const blockNodes = nodeSamples.filter((n) => n.category === 'block')
  const containerNodes = nodeSamples.filter((n) => n.category === 'container')

  return (
    <div className="page">
      <div className="showcase-intro">
        <h2>Node Showcase</h2>
        <p>
          All custom node types rendered individually with their DSL
          definitions.
        </p>
      </div>

      {/* Inline Nodes */}
      <section className="showcase-section">
        <h3 className="showcase-section-title">Inline Nodes</h3>
        <div className="showcase-grid">
          {inlineNodes.map((sample) => (
            <Panel
              key={sample.key}
              title={sample.label}
              badge={sample.category}
            >
              <p className="node-description">{sample.description}</p>
              <div className="node-render">
                <RichRenderer
                  value={sample.data}
                  variant="article"
                  rendererConfig={enhancedRendererConfig}
                />
              </div>
              <JsonViewer data={sample.data} />
            </Panel>
          ))}
        </div>
      </section>

      {/* Block Nodes */}
      <section className="showcase-section">
        <h3 className="showcase-section-title">Block Nodes</h3>
        <div className="showcase-grid">
          {blockNodes.map((sample) => (
            <Panel
              key={sample.key}
              title={sample.label}
              badge={sample.category}
            >
              <p className="node-description">{sample.description}</p>
              <div className="node-render">
                <RichRenderer
                  value={sample.data}
                  variant="article"
                  rendererConfig={enhancedRendererConfig}
                />
              </div>
              <JsonViewer data={sample.data} />
            </Panel>
          ))}
        </div>
      </section>

      {/* Container Nodes */}
      <section className="showcase-section">
        <h3 className="showcase-section-title">Container Nodes</h3>
        <div className="showcase-grid">
          {containerNodes.map((sample) => (
            <Panel
              key={sample.key}
              title={sample.label}
              badge={sample.category}
            >
              <p className="node-description">{sample.description}</p>
              <div className="node-render">
                <RichRenderer
                  value={sample.data}
                  variant="article"
                  rendererConfig={enhancedRendererConfig}
                />
              </div>
              <JsonViewer data={sample.data} />
            </Panel>
          ))}
        </div>
      </section>
    </div>
  )
}
