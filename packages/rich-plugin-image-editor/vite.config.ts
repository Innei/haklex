import { createViteConfig } from '../vite.shared';

const config = await createViteConfig();

// react-image-crop is externalized as a runtime dep, but its stylesheet must be
// bundled into this package's dist css so consumers only import ./style.css.
const baseExternal = config.build!.rollupOptions!.external as (id: string) => boolean;
config.build!.rollupOptions!.external = (id: string) =>
  /\.css(?:\?|$)/.test(id) ? false : baseExternal(id);

export default config;
