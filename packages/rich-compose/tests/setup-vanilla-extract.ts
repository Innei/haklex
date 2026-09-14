import { setFileScope } from '@vanilla-extract/css/fileScope';

// Vitest runs without the vanilla-extract vite plugin, so every `.css.ts`
// module would throw "Styles were unable to be assigned to a file" at import.
// A process-wide file scope lets those modules evaluate to plain class-name
// strings, which is all the renderer tests need.
setFileScope('vitest.css.ts', 'vitest');
