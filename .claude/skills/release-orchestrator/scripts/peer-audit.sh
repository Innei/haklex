#!/usr/bin/env bash
set -euo pipefail

ALWAYS_PEERS='["react","react-dom","lucide-react","shiki","@lexical/react","@base-ui/react","@excalidraw/excalidraw","katex"]'
status=0

echo "== Always-peer libraries under dependencies =="
always_hits=$(jq -r --argjson always "$ALWAYS_PEERS" '
  select(.name != "@haklex/rich-editor-demo")
  | .name as $pkg
  | (.dependencies // {})
  | to_entries[]
  | select(.key as $k | $always | index($k))
  | "\($pkg)\tdependencies\t\(.key)\t\(.value)"
' packages/*/package.json)
printf '%s\n' "${always_hits:-none}"
[ -n "$always_hits" ] && status=1

echo "== Internal peerDependencies using workspace:* =="
internal_hits=$(jq -r '
  select(.name != "@haklex/rich-editor-demo")
  | .name as $pkg
  | (.peerDependencies // {})
  | to_entries[]
  | select(.key | startswith("@haklex/"))
  | select(.value == "workspace:*")
  | "\($pkg)\tpeerDependencies\t\(.key)\t\(.value)"
' packages/*/package.json)
printf '%s\n' "${internal_hits:-none}"
[ -n "$internal_hits" ] && status=1

echo "== Divergent third-party peer floors =="
divergent=$(jq -s '
  [ .[]
    | select(.name != "@haklex/rich-editor-demo")
    | .name as $pkg
    | (.peerDependencies // {})
    | to_entries[]
    | select(.key | startswith("@haklex/") | not)
    | {lib: .key, range: .value, pkg: $pkg}
  ]
  | group_by(.lib)
  | map({lib: .[0].lib, ranges: ([.[].range] | unique), pkgs: ([.[].pkg] | unique)})
  | map(select(.ranges | length > 1))
' packages/*/package.json)
printf '%s\n' "$divergent"
if [ "$(jq 'length' <<< "$divergent")" -gt 0 ]; then
  status=1
fi

exit "$status"
