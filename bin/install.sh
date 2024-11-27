#!/bin/sh
# Heavily inspired by IPFS and Dino install script
# Keep this script as simple as possible for auditability
set -e

case $(uname -sm) in
	"Darwin x86_64") suffix="darwin-x64" ;;
	"Darwin arm64") suffix="darwin-arm64" ;; 
	"Linux aarch64") suffix="linux-arm64" ;;
  "Linux x86_64") suffix="linux-x64" ;;
	*) suffix="no-file-name" ;;
	esac
plebbit_compressed_file_name="plebbit_${suffix}.tar.gz"
plebbit_uri="https://github.com/plebbit/plebbit-cli/releases/latest/download/${plebbit_compressed_file_name}"

curl --fail --location --progress-bar --output "$plebbit_compressed_file_name" "$plebbit_uri"
PLEBBIT_INSTALL_DIR="$HOME/.plebbit_install_files"
rm -rf "$PLEBBIT_INSTALL_DIR"
mkdir -p "$PLEBBIT_INSTALL_DIR"

tar -xzf $plebbit_compressed_file_name --directory "$PLEBBIT_INSTALL_DIR"
echo "Extracted Plebbit install files to $PLEBBIT_INSTALL_DIR"
echo "Make sure not to delete this directory"

plebbit_bin_path=$(eval echo "$PLEBBIT_INSTALL_DIR/plebbit/bin/plebbit") # Make sure it's expanded
binpaths="$HOME/.local/bin /usr/local/bin /usr/bin"

# This variable contains a nonzero length string in case the script fails
# because of missing write permissions.
is_write_perm_missing=""

for system_bin_path_dir in $binpaths; do
  # Expand the $HOME variable.
  system_plebbit_bin_path=$(eval echo "$system_bin_path_dir/plebbit")
  mkdir -p "$system_bin_path_dir"
  if ln -sf "$plebbit_bin_path" "$system_plebbit_bin_path" ; then
    echo "Plebbit was installed successfully to $system_plebbit_bin_path"
	echo "Run 'plebbit --help' to get started"
	echo "Need help? Join our Telegram https://t.me/plebbit"

  rm "$plebbit_compressed_file_name"

  exit 0
  else
    if [ -d "$system_bin_path_dir" ] && [ ! -w "$system_bin_path_dir" ]; then
      is_write_perm_missing=1
    fi
  fi
done

echo "We cannot install $system_bin_path_dir in one of the directories $binpaths"

if [ -n "$is_write_perm_missing" ]; then
  echo "It seems that we do not have the necessary write permissions."
  echo "Perhaps try running this script as a privileged user:"
  echo
  echo "    sudo $0"
  echo
fi

exit 1
