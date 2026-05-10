export interface CodeFile {
  code: string;
  filename: string;
  highlightLines?: number[];
  language?: string;
}

export interface CodeSnippetRendererProps {
  files: CodeFile[];
}
