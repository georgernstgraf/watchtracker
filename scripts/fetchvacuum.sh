#!/usr/bin/env bash
ssh georg@murl 'mkvacuumtracker' && scp georg@murl:/tmp/vacuum.db .
