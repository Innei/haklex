import type { FC } from 'react';

import type { ChatRendererProps } from './types';

export interface ChatEditDecoratorProps extends ChatRendererProps {
  nodeKey: string;
}

export const ChatEditDecorator: FC<ChatEditDecoratorProps> = () => null;
