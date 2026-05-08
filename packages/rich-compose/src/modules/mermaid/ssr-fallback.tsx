/**
 * SSR / Suspense fallback for the lazy Mermaid renderer.
 *
 * Determinism requirement: identical output server-side and client-side
 * to avoid hydration mismatches. No Date, no random, no client-only API.
 *
 * Renders an empty placeholder shell sized via CSS so layout stays stable
 * before mermaid's heavy chunk resolves and replaces it.
 */
export function MermaidSsrFallback() {
  return <div className="rich-mermaid-skeleton" data-rich-skeleton="mermaid" />;
}
