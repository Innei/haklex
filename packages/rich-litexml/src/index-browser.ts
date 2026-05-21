import { registerParseHTML } from './parse-html';

registerParseHTML((html) => new DOMParser().parseFromString(html, 'text/html'));

export * from './index';
