import root from 'react-shadow';

import type { ShiroEditorProps } from './ShiroEditor';
import { ShiroEditor } from './ShiroEditor';
// @ts-expect-error -- vite ?inline returns processed CSS as string
import cssText from './style.css?inline';

const resolvedCss = (cssText as string).replaceAll(':root {', ':root, :host {');

export type IsolateEditorProps = ShiroEditorProps;

export function IsolateEditor({ theme = 'light', className, ...props }: IsolateEditorProps) {
  return (
    <root.div className={className}>
      <div suppressHydrationWarning data-theme={theme} id="shadow-html">
        <style dangerouslySetInnerHTML={{ __html: resolvedCss }} />
        <ShiroEditor {...props} theme={theme} />
      </div>
    </root.div>
  );
}
