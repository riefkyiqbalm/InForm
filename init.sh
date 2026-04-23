#!/bin/bash

# --- Configuration ---
# Replace the URL below with your actual GitHub Repo URL
REPO_URL="https://github.com/riefkyiqbalm/InForm.git"
COMMIT_MSG="Initial commit"

echo "🚀 Starting Git initialization..."

# 1. Initialize the local directory as a Git repository
git init

# 2. Add all files in the project folder
git add .

# 3. Commit the changes
git commit -m "$COMMIT_MSG"

# 4. Rename the default branch to 'main' (standard for GitHub)
git branch -M master

# 5. Add the remote repository URL
git remote add origin "$REPO_URL"

# 6. Push to GitHub
# The -u flag tracks the remote branch so you can just type 'git push' later
git push -u origin master

echo "✅ Done! Your code is now on GitHub."