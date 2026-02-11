#!/bin/bash
set -v
fuser watchtracker.db >/dev/null 2>&1 && echo 'DB IN USE' || mv vacuum.db watchtracker.db
