export interface ComponentRendererProps {
  dls: string
  shadow: boolean
  injectHostStyles: boolean
  onDlsChange?: (dls: string) => void
}

function parseDls(dls: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of dls.split('\n')) {
    const idx = line.indexOf('=')
    if (idx > 0) {
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      if (key && value) {
        result[key] = value
      }
    }
  }
  return result
}

export function ComponentRenderer({ dls, shadow }: ComponentRendererProps) {
  const parsed = parseDls(dls)
  const source = parsed['import'] || '(none)'
  const name = parsed['name'] || '(unnamed)'
  const height = parsed['height'] || 'auto'

  return (
    <div className="rich-component-block">
      <div
        style={{
          padding: '12px 16px',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: 1.6,
          background: '#f8f9fa',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '8px', color: '#555' }}>
          Remote Component
        </div>
        <div>
          <span style={{ color: '#888' }}>source: </span>
          <span style={{ color: '#0969da', wordBreak: 'break-all' }}>
            {source}
          </span>
        </div>
        <div>
          <span style={{ color: '#888' }}>name: </span>
          <span>{name}</span>
        </div>
        <div>
          <span style={{ color: '#888' }}>height: </span>
          <span>{height}</span>
        </div>
        <div>
          <span style={{ color: '#888' }}>shadow: </span>
          <span>{shadow ? 'yes' : 'no'}</span>
        </div>
      </div>
    </div>
  )
}
