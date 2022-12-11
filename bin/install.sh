#!/bin/sh
# Heavily inspired by IPFS and Dino install script
# Keep this script as simple as possible for auditability

set -e



case $(uname -sm) in
	"Darwin x86_64") suffix="macos-x64" ;;
	"Darwin arm64") suffix="macos-x64" ;; # TODO test x64 builds on arm64 arch
	"Linux aarch64") suffix="linux-arm64" ;;
	*) suffix="linux-x64" ;;
	esac
file_name="plebbit_${suffix}"
plebbit_uri="https://github.com/plebbit/plebbit-cli/releases/latest/download/${file_name}"



curl --fail --location --progress-bar --output "$file_name" "$plebbit_uri"
INSTALL_DIR=$(dirname "$0")

bin="$INSTALL_DIR/$file_name"

chmod +x "$bin"

binpaths="$HOME/.local/bin /usr/local/bin /usr/bin"

# This variable contains a nonzero length string in case the script fails
# because of missing write permissions.
is_write_perm_missing=""

for raw in $binpaths; do
  # Expand the $HOME variable.
  binpath=$(eval echo "$raw")
  mkdir -p "$binpath"
  if mv "$bin" "$binpath/plebbit" ; then
    echo "Plebbit was installed successfully to $binpath"
	echo "Run 'plebbit --help' to get started"
	echo "Need help? Join our Telegram https://t.me/plebbit"

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
