#!/bin/bash
# VisionCheck — Backup Script
# Usage: ./scripts/backup.sh
# Run from project root: cd /mnt/storage/projects/visioncheck && ./scripts/backup.sh
#
# What this does:
#   1. Syncs project to NAS backup folder
#   2. Commits any uncommitted changes with a timestamped message
#   3. Pushes to GitHub (AwaizFatima08/visioncheck)

set -e  # Exit immediately on any error

# ── Paths ────────────────────────────────────────────────────────────────────
PROJECT_DIR="/mnt/storage/projects/visioncheck"
BACKUP_DIR="/mnt/storage/project_backups/visioncheck"
GITHUB_REMOTE="https://github.com/AwaizFatima08/visioncheck.git"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
DATE_TAG=$(date '+%Y%m%d_%H%M%S')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  VisionCheck Backup"
echo "  $TIMESTAMP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Step 1: NAS backup sync ───────────────────────────────────────────────────
echo ""
echo "▶ Step 1: Syncing to NAS backup..."
echo "  From: $PROJECT_DIR"
echo "  To:   $BACKUP_DIR"

mkdir -p "$BACKUP_DIR"

rsync -av \
  --exclude 'node_modules/' \
  --exclude '.expo/' \
  --exclude 'android/' \
  --exclude 'ios/' \
  --exclude '*.apk' \
  --exclude '*.aab' \
  --exclude '.env' \
  "$PROJECT_DIR/" "$BACKUP_DIR/"

echo "  ✓ NAS backup complete"

# ── Step 2: Git status check ──────────────────────────────────────────────────
echo ""
echo "▶ Step 2: Checking git status..."
cd "$PROJECT_DIR"

if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "  ! Git not initialised. Run: git init"
  echo "  ! Then: git remote add origin $GITHUB_REMOTE"
  exit 1
fi

# Stage all changes
git add -A

# Check if there is anything to commit
if git diff --staged --quiet; then
  echo "  ✓ No changes to commit"
else
  git commit -m "backup: $TIMESTAMP"
  echo "  ✓ Changes committed"
fi

# ── Step 3: Push to GitHub ────────────────────────────────────────────────────
echo ""
echo "▶ Step 3: Pushing to GitHub..."

if git push origin main 2>/dev/null || git push origin master 2>/dev/null; then
  echo "  ✓ Pushed to GitHub (AwaizFatima08/visioncheck)"
else
  echo "  ! Push failed — check GitHub credentials or internet connection"
  echo "  ! NAS backup was still completed successfully"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Backup complete — $TIMESTAMP"
echo "  NAS:    $BACKUP_DIR"
echo "  GitHub: https://github.com/AwaizFatima08/visioncheck"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
