import type { SerializedEditorState } from 'lexical';

import { useNestedContentRenderer } from '../../context/NestedContentRendererContext';
import type { AlertType } from '../../nodes/AlertQuoteNode';
import { RendererWrapper } from '../RendererWrapper';
import { AlertRenderer } from './AlertRenderer';

interface AlertStaticDecoratorProps {
  alertType: AlertType;
  contentState: SerializedEditorState;
}

export function AlertStaticDecorator({ alertType, contentState }: AlertStaticDecoratorProps) {
  const renderContent = useNestedContentRenderer();

  return (
    <>
      <RendererWrapper
        defaultRenderer={AlertRenderer}
        props={{ type: alertType }}
        rendererKey="Alert"
      />
      <div className="rich-alert-content">{renderContent(contentState)}</div>
    </>
  );
}
