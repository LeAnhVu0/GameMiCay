#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
exec node dev-server.mjs
