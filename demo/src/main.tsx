import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { router } from './App';
import { LightboxProvider } from './lightbox/LightboxProvider';

window.addEventListener('error', (e) => {
  document.getElementById('root')!.innerHTML =
    `<pre style="color:red;padding:20px;white-space:pre-wrap">${e.message}\n\n${e.error?.stack || ''}</pre>`;
});

try {
  createRoot(document.getElementById('root')!).render(
    <LightboxProvider>
      <RouterProvider router={router} />
    </LightboxProvider>,
  );
} catch (e: unknown) {
  const err = e as Error;
  document.getElementById('root')!.innerHTML =
    `<pre style="color:red;padding:20px;white-space:pre-wrap">${err.message}\n\n${err.stack || ''}</pre>`;
}
