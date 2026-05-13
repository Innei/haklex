import { createViteConfig } from '../../vite.shared';

export default createViteConfig({
  entry: {
    cli: 'src/cli.ts',
    index: 'src/index.ts',
  },
  vanillaExtract: false,
});
