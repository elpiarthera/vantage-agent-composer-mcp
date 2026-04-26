#!/usr/bin/env bash
set -e
SMOKE=$(echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 5 node dist/index.js 2>&1)
if [[ "$SMOKE" != *'"protocolVersion"'* ]]; then
  echo "FATAL: server did not respond to initialize"
  echo "Output: $SMOKE"
  exit 1
fi
echo "Smoke test PASS — server responds to initialize"
