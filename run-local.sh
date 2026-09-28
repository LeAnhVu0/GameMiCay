#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then
	exec python3 -m http.server 8080
fi
if command -v python >/dev/null 2>&1; then
	exec python -m http.server 8080
fi
echo "Python 3 is required to run the local static preview." >&2
exit 1
