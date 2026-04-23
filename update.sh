#!/bin/bash

# --- Configuration ---
BRANCH="master"

echo "🔄 Starting update process..."

# 1. Pull latest changes from GitHub to prevent conflicts
echo "📥 Pulling latest changes from remote..."
git pull origin $BRANCH

# 2. Add all new changes
echo "➕ Adding changes..."
git add .

# 3. Ask for a commit message
echo "💬 Enter commit message (or press Enter for 'Auto-update'):"
read user_msg

if [ -z "$user_msg" ]; then
    COMMIT_MSG="Auto-update: $(date +'%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$user_msg"
fi

# 4. Commit
git commit -m "$COMMIT_MSG"

# 5. Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin $BRANCH

echo "✅ Update complete!"