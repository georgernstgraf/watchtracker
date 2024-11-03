#!/usr/bin/awk -f
BEGIN {
FS="="
}
/^#/ { next }
{printf "echo \042%s\042 > \042%s\042\n", $2, $1}
