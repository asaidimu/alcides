#!/usr/bin/env sh
set -eu

yarn build:dist
cd dist
yarn pack . alcides
tar -zxvf alcides-v1.0.0.tgz
[ -e "../node_modules/alcides" ] && rm -rf ../node_modules/alcides
mv package ../node_modules/alcides
cd ..
rm -rf dist
chmod +x node_modules/alcides/index.js

