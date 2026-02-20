#!/usr/bin/env bash
set -v
fuser -k -9 watchtracker.db && sleep 2
rm -f watchtracker.db* && cp vacuum.db watchtracker.db
