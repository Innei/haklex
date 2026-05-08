/**
 * SSR / Suspense fallback for the lazy CodeBlock renderer.
 *
 * Determinism requirement: identical output server-side and client-side
 * to avoid hydration mismatches. No Date, no random, no client-only API.
 *
 * Renders a placeholder `<pre>` shell. The lazy renderer replaces it with
 * shiki-tokenized output once the chunk resolves. Even without code text
 * (the fallback runs before props are routed through the lazy boundary),
 * the empty pre keeps layout stable.
 */
export function CodeBlockSsrFallback() {
  return (
    <pre className="rich-codeblock-skeleton" data-rich-skeleton="codeblock">
      <code />
    </pre>
  );
}
