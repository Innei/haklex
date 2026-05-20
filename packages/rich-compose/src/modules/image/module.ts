import { createImageModule } from './module-config';
import { ImageRegistryProvider } from './registry';
import { ComposedImageRenderer } from './renderer';

export const imageModule = createImageModule({
  renderers: { Image: ComposedImageRenderer },
  Provider: ImageRegistryProvider,
});
