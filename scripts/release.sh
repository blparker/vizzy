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

# Bump version in all packages (public and private move in lock step)
NEW_VERSION=$(cd packages/core && npm version "$BUMP" --no-git-tag-version | tr -d 'v')
for pkg in packages/renderer-canvas packages/react packages/docs packages/playground apps/hub; do
    if [ -d "$pkg" ]; then
        cd "$pkg" && npm version "$BUMP" --no-git-tag-version > /dev/null
        cd - > /dev/null
    fi
done

# Update peer dep ranges to match new version
MAJOR=$(echo "$NEW_VERSION" | cut -d. -f1)
if [ "$MAJOR" -eq 0 ]; then
    PEER_RANGE="^${NEW_VERSION}"
else
    PEER_RANGE="^${MAJOR}.0.0"
fi

node -e "
const fs = require('fs');

// Update renderer-canvas peer deps
const rc = JSON.parse(fs.readFileSync('packages/renderer-canvas/package.json', 'utf8'));
rc.peerDependencies['@vizzyjs/core'] = '${PEER_RANGE}';
fs.writeFileSync('packages/renderer-canvas/package.json', JSON.stringify(rc, null, 4) + '\n');

// Update react peer deps
const react = JSON.parse(fs.readFileSync('packages/react/package.json', 'utf8'));
react.peerDependencies['@vizzyjs/core'] = '${PEER_RANGE}';
react.peerDependencies['@vizzyjs/renderer-canvas'] = '${PEER_RANGE}';
fs.writeFileSync('packages/react/package.json', JSON.stringify(react, null, 4) + '\n');
"

echo "Bumped to v${NEW_VERSION}"

# Build
echo "Building..."
pnpm build

# Publish public packages
echo "Publishing @vizzyjs/core@${NEW_VERSION}..."
pnpm --filter @vizzyjs/core publish --no-git-checks

echo "Publishing @vizzyjs/renderer-canvas@${NEW_VERSION}..."
pnpm --filter @vizzyjs/renderer-canvas publish --no-git-checks

echo "Publishing @vizzyjs/react@${NEW_VERSION}..."
pnpm --filter @vizzyjs/react publish --no-git-checks

# Commit and tag
git add -A
git commit -m "v${NEW_VERSION}"
git tag "v${NEW_VERSION}"

echo ""
echo "Published v${NEW_VERSION}. Run 'git push && git push --tags' to push."
