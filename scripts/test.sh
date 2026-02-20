#!/usr/bin/env bash
set -v
scripts/replacedb.sh
deno task dev &
sleep 5
deno test --env-file --allow-env --allow-net tests/
