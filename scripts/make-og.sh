#!/bin/sh
# Renders scripts/og.html to src/assets/img/og.jpg with headless Chrome (macOS path; adjust elsewhere).
set -e
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1200,630 --virtual-time-budget=4000 --screenshot="$PWD/scripts/og.png" "file://$PWD/scripts/og.html" 2>/dev/null
sips -s format jpeg -s formatOptions 85 scripts/og.png --out src/assets/img/og.jpg >/dev/null
rm -f scripts/og.png
echo "wrote src/assets/img/og.jpg"
