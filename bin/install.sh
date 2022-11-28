#!/bin/sh
#
# Inspired by IPFS's kubo install.sh
# Installation script for plebbit. It tries to move $bin in one of the
# directories stored in $binpaths.

INSTALL_DIR=$(dirname $0)

bin="$INSTALL_DIR/plebbit"
binpaths='/usr/local/bin /usr/bin $HOME/.local/bin'

# This variable contains a nonzero length string in case the script fails
# because of missing write permissions.
is_write_perm_missing=""

for raw in $binpaths; do
  # Expand the $HOME variable.
  binpath=$(eval echo "$raw")
  mkdir -p "$binpath"
  if mv "$bin" "$binpath/plebbit" ; then
    echo "Moved $bin to $binpath"
    exit 0
  else
    if [ -d "$binpath" ] && [ ! -w "$binpath" ]; then
      is_write_perm_missing=1
    fi
  fi
done

echo "We cannot install $bin in one of the directories $binpaths"

if [ -n "$is_write_perm_missing" ]; then
  echo "It seems that we do not have the necessary write permissions."
  echo "Perhaps try running this script as a privileged user:"
  echo
  echo "    sudo $0"
  echo
fi

exit 1
