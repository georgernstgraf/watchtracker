#!/usr/bin/env bash
set -v
ssh georg@murl 'mkvacuumtracker' && scp georg@murl:/tmp/vacuum.db .
