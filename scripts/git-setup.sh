#!/bin/bash
# VisionCheck — First-time Git Setup
# Run once after copying project to NAS:
#   cd /mnt/storage/projects/visioncheck
#   chmod +x scripts/git-setup.sh
#   ./scripts/git-setup.sh

set -e

PROJECT_DIR="/mnt/storage/projects/visioncheck"
GITHUB_REMOTE="https://github.com/awaizfatima08/visioncheck.git"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  VisionCheck — Git Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_DIR"

# Initialise git if not already done
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "✓ Git already initialised"
else
  git init
  echo "✓ Git initialised"
fi

# Set remote
if git remote get-url origin > /dev/null 2>&1; then
  echo "✓ Remote already set: $(git remote get-url origin)"
else
  git remote add origin "$GITHUB_REMOTE"
  echo "✓ Remote added: $GITHUB_REMOTE"
fi

# Initial commit
git add -A
git commit -m "init: VisionCheck project structure" || echo "✓ Nothing to commit"

# Set branch to main
git branch -M main

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Ready. Now push with:"
echo "  git push -u origin main"
echo ""
echo "  You will be prompted for GitHub"
echo "  username (awaizfatima08) and"
echo "  personal access token (not password)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
