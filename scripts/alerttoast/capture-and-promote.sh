#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/Users/test/web/copymyui"
PROJECT_ROOT="/Users/test/XCodeProjects/CopyMyUI"
CONTENT_VIEW="$PROJECT_ROOT/AudioToAudio/App/ContentView.swift"
RESEARCH_ROOT="$REPO_ROOT/public/uploads/research"
PORT_MANIFEST="$REPO_ROOT/public/uploads/copycat-alerttoast/source-port-manifest.json"
PUBLIC_COMPONENTS_ROOT="$REPO_ROOT/public/components"
SEED_CODE_ROOT="$REPO_ROOT/prisma/seed-code"

UDID="A6938CEB-5370-44D0-B52C-5CA70F354C74"
BUNDLE_ID="org.icorpaudio.CopyMyUI"
DERIVED="/tmp/copymyui-alerttoast-port"
FRAME_SCRIPT="/Users/test/XCodeProjects/APPLE_HELPERS/iphone17-frame.sh"

xcrun simctl boot "$UDID" >/dev/null 2>&1 || true
xcrun simctl status_bar "$UDID" override \
  --time 9:41 \
  --dataNetwork wifi \
  --wifiMode active \
  --wifiBars 3 \
  --cellularMode active \
  --batteryState charged \
  --batteryLevel 100

while IFS='|' read -r folder slug; do
  echo "[alerttoast-port] processing $folder ($slug)"

  component_dir="$RESEARCH_ROOT/$folder"
  swift_source="$component_dir/content.swift"

  if [[ ! -f "$swift_source" ]]; then
    echo "missing content.swift for $folder"
    exit 1
  fi

  cp "$swift_source" "$CONTENT_VIEW"

  xcodebuild \
    -project "$PROJECT_ROOT/CopyMyUI.xcodeproj" \
    -scheme AudioToAudio \
    -destination "id=$UDID" \
    -derivedDataPath "$DERIVED" \
    build >/tmp/copymyui-alerttoast-build.log 2>&1

  xcrun simctl install "$UDID" "$DERIVED/Build/Products/Debug-iphonesimulator/CopyMyUI.app" >/dev/null

  xcrun simctl ui "$UDID" appearance light
  xcrun simctl terminate "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
  xcrun simctl launch "$UDID" "$BUNDLE_ID" >/dev/null
  sleep 1.5
  xcrun simctl io "$UDID" screenshot "$component_dir/original/light.png" >/dev/null

  xcrun simctl ui "$UDID" appearance dark
  xcrun simctl terminate "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
  xcrun simctl launch "$UDID" "$BUNDLE_ID" >/dev/null
  sleep 1.5
  xcrun simctl io "$UDID" screenshot "$component_dir/original/dark.png" >/dev/null

  "$FRAME_SCRIPT" "$component_dir/original/light.png" "$component_dir/framed/light.png"
  "$FRAME_SCRIPT" "$component_dir/original/dark.png" "$component_dir/framed/dark.png"

  mkdir -p "$PUBLIC_COMPONENTS_ROOT/$folder"
  cp "$component_dir/framed/light.png" "$PUBLIC_COMPONENTS_ROOT/$folder/light.png"
  cp "$component_dir/framed/dark.png" "$PUBLIC_COMPONENTS_ROOT/$folder/dark.png"

  cp "$swift_source" "$SEED_CODE_ROOT/$slug.swift"
done < <(jq -r '.[] | "\(.folderName)|\(.slug)"' "$PORT_MANIFEST")

xcrun simctl status_bar "$UDID" clear >/dev/null 2>&1 || true

echo "[alerttoast-port] capture and promotion completed"
