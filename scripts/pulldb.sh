#!/bin/bash
fuser watchtracker.db >/dev/null 2>&1 && echo 'DB IN USE' || scp murl:/tmp/watchtracker.db .
