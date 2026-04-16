#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/release.sh [major|minor|patch]
# Default: minor

BUMP="${1:-minor}"

# Ensure clean working tree
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: working tree is dirty. Commit or stash changes first."
    exit 1
fi

# Bump version in both packages (npm version updates package.json and returns new version)
NEW_VERSION=$(cd packages/core && npm version "$BUMP" --no-git-tag-version | tr -d 'v')
cd packages/renderer-canvas && npm version "$BUMP" --no-git-tag-version > /dev/null
cd ../..

# Update renderer-canvas peer dep range to match new core version
MAJOR=$(echo "$NEW_VERSION" | cut -d. -f1)
MINOR=$(echo "$NEW_VERSION" | cut -d. -f2)
if [ "$MAJOR" -eq 0 ]; then
    PEER_RANGE="^${NEW_VERSION}"
else
    PEER_RANGE="^${MAJOR}.0.0"
fi

# Use node to update the peerDependencies field reliably
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('packages/renderer-canvas/package.json', 'utf8'));
pkg.peerDependencies['@vizzyjs/core'] = '${PEER_RANGE}';
fs.writeFileSync('packages/renderer-canvas/package.json', JSON.stringify(pkg, null, 4) + '\n');
"

echo "Bumped to v${NEW_VERSION}"

# Build
echo "Building..."
pnpm build

# Publish
echo "Publishing @vizzyjs/core@${NEW_VERSION}..."
pnpm --filter @vizzyjs/core publish --no-git-checks

echo "Publishing @vizzyjs/renderer-canvas@${NEW_VERSION}..."
pnpm --filter @vizzyjs/renderer-canvas publish --no-git-checks

# Commit and tag
git add packages/core/package.json packages/renderer-canvas/package.json
git commit -m "v${NEW_VERSION}"
git tag "v${NEW_VERSION}"

echo ""
echo "Published v${NEW_VERSION}. Run 'git push && git push --tags' to push."
