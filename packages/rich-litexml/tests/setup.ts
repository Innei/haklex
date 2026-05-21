import { parseHTML as linkedomParseHTML } from 'linkedom';

import { registerParseHTML } from '../src/parse-html';

registerParseHTML((html) => linkedomParseHTML(html).document as unknown as Document);
