import { createRoot } from 'react-dom/client'

import { ShiroRenderer } from '../src/ShiroRenderer'

const root = createRoot(document.getElementById('root')!)
root.render(
  <ShiroRenderer
    value={{
      root: {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    }}
  />,
)
