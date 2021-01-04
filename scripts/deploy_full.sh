#!/usr/bin/env bash

set -euo pipefail

if ! git diff --cached --quiet; then
  echo please unstage changes before running this command
  exit 1
fi

npm run build:ui
git add ./uibuild
git commit -m "uibuild: $(git -C ./uicode rev-parse --short HEAD)"
npm run deploy
