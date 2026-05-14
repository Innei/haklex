export type OutputFormat = 'html' | 'json' | 'markdown';
export type InputFormat = 'litexml' | 'json';
export type Theme = 'light' | 'dark';
export type Variant = 'article' | 'note' | 'comment';

export interface CliOptions {
  compact: boolean;
  format?: OutputFormat;
  input?: string;
  inputFormat?: InputFormat;
  lang: string;
  open: boolean;
  output?: string;
  theme: Theme;
  title?: string;
  variant: Variant;
}

export interface HtmlOptions {
  lang: string;
  theme: Theme;
  title?: string;
  variant: Variant;
}
