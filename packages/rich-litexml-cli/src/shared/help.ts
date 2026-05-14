export const HELP = `Usage:
  litexml <input> --format <fmt> [options]
  litexml - --format <fmt> < input.xml [options]

Input:
  <input>                  File path, "-" for stdin, or an inline string.
                           Format is auto-detected by first non-whitespace char:
                           "<" -> litexml, "{" -> json. Use --input-format to override.

Options:
  -f, --format <fmt>       Output format: html | json | markdown. Required.
  -i, --input-format <fmt> Force input format: litexml | json. Default: auto.
  -o, --output <file>      Write to a file instead of stdout.
  --compact                Compact JSON output (format=json only).
  --theme <light|dark>     HTML theme. Default: light. (format=html only)
  --variant <v>            HTML variant: article | note | comment. Default: article. (format=html only)
  --title <t>              HTML <title>. (format=html only)
  --lang <l>               HTML lang. Default: en. (format=html only)
  --open                   Open the generated HTML in the system browser. (format=html only)
  -h, --help               Show this help message.
`;
