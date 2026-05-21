import { createViteConfig } from '../../vite.shared';

export default createViteConfig({
  vanillaExtract: false,
  entry: {
    browser: 'src/index-browser.ts',
    node: 'src/index-node.ts',
  },
});
