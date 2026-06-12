import { createViteConfig } from '../vite.shared';

export default createViteConfig({
  entry: {
    index: 'src/index.ts',
    react: 'src/react-entry.ts',
  },
  vanillaExtract: false,
});
