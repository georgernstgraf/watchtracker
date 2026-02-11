#!/bin/bash
set -v
fuser watchtracker.db >/dev/null 2>&1 && echo 'DB IN USE' || (rm watchtracker.db* && cp vacuum.db watchtracker.db)
