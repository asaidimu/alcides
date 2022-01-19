##!/usr/bin/env sh
set -eu

rm -rf dist
yarn tsc
rm -rf dist/tsconfig.tsbuildinfo
cp README.md LICENSE.md dist/
cp dist.package.json dist/package.json
cd dist
yarn
