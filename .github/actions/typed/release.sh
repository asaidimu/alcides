#!/usr/bin/env sh
set -eu

export GITHUB_TOKEN="${INPUT_GH_TOKEN}"

git config --global user.email "47994458+asaidimu@users.noreply.github.com"
git config --global user.name "saidimu"

yarn
yarn build:types
