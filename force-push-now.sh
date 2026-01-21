#!/bin/bash
# Force push script - run this in your terminal
cd /Users/lucamack/Desktop/projects/wgfi

echo "Force pushing to GitHub..."
echo "You may be prompted for your GitHub username and password/token"
echo ""

# Force push
git push origin main --force

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
else
    echo ""
    echo "❌ Push failed. You may need to:"
    echo "   1. Use a Personal Access Token instead of password"
    echo "   2. Or use GitHub Desktop: Branch > Force push to origin/main"
fi
