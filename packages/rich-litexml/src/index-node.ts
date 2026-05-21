import { parseHTML as linkedomParseHTML } from 'linkedom';

import { registerParseHTML } from './parse-html';

registerParseHTML((html) => linkedomParseHTML(html).document as unknown as Document);

export * from './index';
