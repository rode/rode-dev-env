#!/bin/bash

set -euo pipefail

echo "Removing previous dist"
rm -f dist/index.js

ACTION_VERSION="v$(jq -r '.version' < package.json)"

echo "Setting version as ${ACTION_VERSION}"

npx esbuild ./src \
  --bundle \
  --minify \
  --outfile=dist/index.js \
  --platform=node \
  --define:process.env.ACTION_VERSION=\""${ACTION_VERSION}"\" \
  --target=node12

echo "::set-output name=version::${ACTION_VERSION}"
