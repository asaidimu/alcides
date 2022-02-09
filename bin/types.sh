#!/usr/bin/env sh
set -eu

TEMP=`mktemp -d`
TARGET="$TEMP/types/alcides"
REPOSITORY="asaidimu/DefinitelyTyped"

FULL_VERSION=$(
    curl -sH "Accept: application/vnd.github.v3+json" \
              https://api.github.com/repos/asaidimu/alcides/tags?per_page=1 \
    | grep -E "name.+,"\
    | sed -E 's/("|v|,)//g; s/^.*://g;'
)
VERSION=$(echo "$FULL_VERSION" | sed -E "s/([0-9]\.[0-9]).*/\1/g;")

mkdir "$TARGET" -p
cp types/* $TARGET && rm $TARGET/index.d.ts

cat > "$TARGET/index.d.ts" <<EOF
// Type definitions for alcides $VERSION
// Project: https://github.com/asaidimu/alcides
// Definitions by: saidimu <https://github.com/asaidimu>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 4.6

EOF

cat types/index.d.ts >> "$TARGET/index.d.ts"

cd "$TEMP"

gh repo clone "$REPOSITORY" -- --sparse --filter=blob:none --depth=1

cd DefinitelyTyped

git sparse-checkout add types/alcides types/chai

[ -e "types/alcides" ] && rm -rf "types/alcides"

mv ../types/alcides types/alcides

yarn
yarn prettier --write types/alcides/**/*.ts
yarn lint alcides

git add --sparse .
git commit -m "chore: Updated types for alcides to v$FULL_VERSION" --allow-empty

echo "asaidimu\n${INPUT_GIT_TOKEN}" | git push -u origin master
