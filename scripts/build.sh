#!/bin/bash

set -euo pipefail

echo "Removing previous dist"
rm -f dist/index.js

IS_CI="${GITHUB_ACTIONS-}"

ACTION_VERSION=$(git rev-parse --abbrev-ref HEAD) # set to branch name when building locally
if [ -n "$IS_CI" ]; then
  ACTION_VERSION="v$(jq -r '.version' < package.json)"
fi

echo "Setting version as ${ACTION_VERSION}"

npx esbuild ./src \
  --bundle \
  --minify \
  --outfile=dist/index.js \
  --platform=node \
  --define:process.env.ACTION_VERSION=\""${ACTION_VERSION}"\" \
  --target=node12

if [ -n "$IS_CI" ]; then
  echo "::set-output name=version::${ACTION_VERSION}"
fi
