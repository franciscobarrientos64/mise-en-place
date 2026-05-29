#!/bin/bash
# Safe push — validates before committing
set -e

MSG="${1:-update}"
FILE="index.html"

echo "🔍 Validating $FILE..."
python3 validate.py "$FILE"
if [ $? -ne 0 ]; then
  echo "🚫 Push aborted — fix errors first"
  exit 1
fi

git add "$FILE"
git commit -m "$MSG"
git push origin main
echo "🚀 Deployed → https://mise-en-place-smoky.vercel.app"
