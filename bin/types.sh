#!/usr/bin/env sh
set -eu

NODE_ENV=${NODE_ENV:-""}

TEMP=$(mktemp -d)
TARGET="$TEMP/types/alcides"
REPOSITORY="asaidimu/DefinitelyTyped"

FULL_VERSION=$(
    curl -sH "Accept: application/vnd.github.v3+json" \
              https://api.github.com/repos/asaidimu/alcides/tags?per_page=1 \
    | grep -E "name.+,"\
    | sed -E 's/("|v|,)//g; s/^.*://g; s/^\s//g'
)

VERSION=$(echo "$FULL_VERSION" | sed -E "s/([0-9]\.[0-9]).*/\1/g;")

mkdir "$TARGET" -p
cp types/* "$TARGET" && rm "$TARGET/index.d.ts"

cat > "$TARGET/index.d.ts" <<EOF
// Type definitions for alcides $VERSION
// Project: https://github.com/asaidimu/alcides
// Definitions by: saidimu <https://github.com/asaidimu>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.0

EOF

cat types/index.d.ts >> "$TARGET/index.d.ts"

[ "$NODE_ENV" = "development" ] && exit

cd "$TEMP"

git clone "https://github.com/$REPOSITORY" --depth=1

cd DefinitelyTyped

[ -e "types/alcides" ] && rm -rf "types/alcides"

mv ../types/alcides types/alcides

yarn
yarn prettier --write types/alcides/**/*.ts
yarn lint alcides

if ! git status | grep "nothing to commit, working tree clean" > /dev/null
then
  echo "  Pushing to DefinitelyTyped!"
  git add types/alcides

  git commit -m "chore: Update types for alcides to v$FULL_VERSION" --allow-empty

  git remote set-url origin "https://ausaidimu:${INPUT_GIT_TOKEN}@github.com/$REPOSITORY"

  git push -u origin master
else
  echo "  No changes in types."
fi
