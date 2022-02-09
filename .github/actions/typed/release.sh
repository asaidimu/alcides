#!/usr/bin/env sh
set -eu

export GITHUB_TOKEN="${INPUT_GH_TOKEN}"
yarn
yarn build:types
