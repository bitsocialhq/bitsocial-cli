[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# bitsocial-cli: A Bitsocial Node with WebSocket and Command Line Interface

# Table of contents

-   [What is Bitsocial?](#what-is-bitsocial)
-   [What is bitsocial-cli?](#what-is-bitsocial-cli)
-   [Install](#install)
-   [Docker](#docker)
-   [Usage](#usage)
-   [Commands](#commands)
-   [Contribution](#contribution)
-   [Feedback](#feedback)

# What is Bitsocial?

Bitsocial is p2p and decentralized social media protocol built completely with IPFS/IPNS/pubsub. It doesn't use any central server, central database, public HTTP endpoint or DNS, it is pure peer to peer (except for the web client that can't join a P2P swarm directly, web clients use interchangeable HTTP providers). It will allow community owners to retain full ownership over their community. Whitepaper [here](https://github.com/plebbit/whitepaper/discussions/2)

# What is bitsocial-cli?

`bitsocial-cli` is an interface to the backend of PKC protocol using [plebbit-js](https://github.com/plebbit/plebbit-js). Users can run and manage their communities using it. It is written in Typescript and designed to receive commands via CLI and WebSocket.

-   Runs an IPFS and Bitsocial node
-   Command Line interface Interface to IPFS-Nodes
-   WebSocket RPC to access and control your communities and publications

# Install

## For Linux/MacOS

```sh-session
curl https://raw.githubusercontent.com/bitsocialhq/bitsocial-cli/master/bin/install.sh | sh
```

### If you want to install a specific bitsocial-cli version

```sh-session
curl https://raw.githubusercontent.com/bitsocialhq/bitsocial-cli/master/bin/install.sh | sh -s 0.14.4
```

If you get `libfontconfig dependency error`, then you need to install libfontconfig by running `sudo apt install -y libfontconfig1 fontconfig libfontconfig1-dev libfontconfig`

## For Windows

For Windows, You need to install [vc-redist](https://learn.microsoft.com/en-US/cpp/windows/latest-supported-vc-redist?view=msvc-170) first. After you install `vc-redist`, download the installer of [bitsocial](https://github.com/bitsocialhq/bitsocial-cli/releases/latest/download/bitsocial_installer_win32_x64.exe) and next your way to the end

## Build your Bitsocial executable manually (optional)

In case the installation script is not working for you or you just want to build the source code directly. First, you need to have `NodeJS 20`, `npm` and `yarn` installed

```
git clone https://github.com/bitsocialhq/bitsocial-cli
cd bitsocial-cli
yarn install --frozen-lockfile
yarn build
yarn oclif manifest
yarn ci:download-web-uis
./bin/run --help
```

After running the last command you should be able to run commands directly against `./bin/run`, for example `./bin/run daemon`

# Docker

You can run bitsocial-cli as a Docker container. The container runs the daemon and exposes the RPC + web UI on port 9138.

Once your container is running, you can use one of the bundled web UIs to browse the Bitsocial network and manage your communities -- no CLI commands needed. The web UIs provide a full-featured interface for creating communities, moderating, and browsing content entirely through your browser.

If you're a power user, you can also run CLI commands against the running container with `docker exec`:

```sh-session
docker exec bitsocial node ./bin/run community list
```

## Docker Compose (recommended)

Copy the example compose file and start the node:

```sh-session
cp docker-compose.example.yml docker-compose.yml
docker compose up -d
```

View the logs to find your auth key URL:

```sh-session
docker compose logs -f
```

The output will include lines like:

```
plebbit rpc: listening on ws://localhost:9138/<auth-key> (secret auth key for remote connections)
WebUI (seedit - Similar to old reddit UI): http://<your-ip>:9138/<auth-key>/seedit (secret auth key for remote connections)
```

Open the WebUI URL in your browser to start using Bitsocial.

### Example docker-compose.yml

```yaml
services:
  bitsocial:
    image: ghcr.io/bitsocialhq/bitsocial-cli:latest
    container_name: bitsocial
    restart: unless-stopped
    ports:
      - "9138:9138"
    volumes:
      - bitsocial-data:/data
      - bitsocial-logs:/logs
    environment:
      - DEBUG=bitsocial*, plebbit*, -plebbit*trace
      # Set a fixed auth key (useful for bookmarking the web UI URL).
      # If left unset, a random key is generated on first start.
      # - PLEBBIT_RPC_AUTH_KEY=your-custom-auth-key-here

volumes:
  bitsocial-data:
  bitsocial-logs:
```

## Docker Run

```sh-session
docker run -d \
  --name bitsocial \
  --restart unless-stopped \
  -p 9138:9138 \
  -v bitsocial-data:/data \
  -v bitsocial-logs:/logs \
  ghcr.io/bitsocialhq/bitsocial-cli:latest
```

With a custom auth key:

```sh-session
docker run -d \
  --name bitsocial \
  --restart unless-stopped \
  -p 9138:9138 \
  -v bitsocial-data:/data \
  -v bitsocial-logs:/logs \
  -e PLEBBIT_RPC_AUTH_KEY=my-secret-key \
  ghcr.io/bitsocialhq/bitsocial-cli:latest
```

## Building the Docker image locally

```sh-session
docker build -t bitsocial-cli .
docker run -p 9138:9138 bitsocial-cli
```

# Usage

## The data/config directory of Bitsocial

This is the default directory where bitsocial-cli will keep its config, as well as data for local communities:

-   macOS: ~/Library/Application Support/bitsocial
-   Windows: %LOCALAPPDATA%\bitsocial
-   Linux: ~/.local/share/bitsocial

## The logs directory of Bitsocial

bitsocial-cli will keep logs in this directory, with a cap of 10M per log file.

-   macOS: ~/Library/Logs/bitsocial
-   Windows: %LOCALAPPDATA%\bitsocial\Log
-   Linux: ~/.local/state/bitsocial

## Running Daemon

In Bash (or powershell if you're on Windows), run `bitsocial daemon` to able to connect to the network. You need to have the `bitsocial daemon` terminal running to be able to execute other commands.

```sh-session
$ bitsocial daemon
IPFS API listening on: http://localhost:5001/api/v0
IPFS Gateway listening on: http://localhost:6473
plebbit rpc: listening on ws://localhost:9138 (local connections only)
plebbit rpc: listening on ws://localhost:9138/MHA1tm2QWG19z0bnkRarDNWIajDobl7iN2eM2PmL (secret auth key for remote connections)
Bitsocial data path: /root/.local/share/bitsocial
Communities in data path:  [ 'pleblore.eth' ]
WebUI (plebones - A bare bones UI client): http://localhost:9138/plebones (local connections only)
WebUI (plebones - A bare bones UI client): http://192.168.1.60:9138/MHA1tm2QWG19z0bnkRarDNWIajDobl7iN2eM2PmL/plebones (secret auth key for remote connections)
WebUI (seedit - Similar to old reddit UI): http://localhost:9138/seedit (local connections only)
WebUI (seedit - Similar to old reddit UI): http://192.168.1.60:9138/MHA1tm2QWG19z0bnkRarDNWIajDobl7iN2eM2PmL/seedit (secret auth key for remote connections)

```

Once `bitsocial daemon` is running, you can create and manage your communities through the web interfaces, either seedit or plebones. If you're a power user and prefer CLI, then you can take a look at the commands below.

### Creating your first community

```sh-session
$ bitsocial community create --title "Hello Plebs!" --description "This is gonna be great"
12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu
```

### Listing all your communities

```sh-session
$ bitsocial community list
Address                                              Started
 ──────────────────────────────────────────────────── ───────
 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu true
 business-and-finance.eth                             true
 censorship-watch.eth                                 true
 health-nutrition-science.eth                         true
 movies-tv-anime.eth                                  true
 pleblore.eth                                         true
 politically-incorrect.eth                            true
 reddit-screenshots.eth                               false
 videos-livestreams-podcasts.eth                      false
```

### Adding a role moderator to your community

```sh-session
$ bitsocial community edit mysub.eth '--roles["author-address.eth"].role' moderator
```

### Adding a role owner to your community

```sh-session
$ bitsocial community edit mysub.eth '--roles["author-address.eth"].role' owner
```

### Adding a role admin to your community

```sh-session
$ bitsocial community edit mysub.eth '--roles["author-address.eth"].role' admin
```

### Removing a role

```sh-session
$ bitsocial community edit mysub.eth '--roles["author-address.eth"]' null
```

# Commands

<!-- commands -->
* [`bitsocial community create`](#bitsocial-community-create)
* [`bitsocial community delete ADDRESSES`](#bitsocial-community-delete-addresses)
* [`bitsocial community edit ADDRESS`](#bitsocial-community-edit-address)
* [`bitsocial community get ADDRESS`](#bitsocial-community-get-address)
* [`bitsocial community list`](#bitsocial-community-list)
* [`bitsocial community start ADDRESSES`](#bitsocial-community-start-addresses)
* [`bitsocial community stop ADDRESSES`](#bitsocial-community-stop-addresses)
* [`bitsocial daemon`](#bitsocial-daemon)
* [`bitsocial help [COMMAND]`](#bitsocial-help-command)

## `bitsocial community create`

Create a community with specific properties. A newly created community will be started after creation and be able to receive publications. For a list of properties, visit https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions

```
USAGE
  $ bitsocial community create --plebbitRpcUrl <value> [--privateKeyPath <value>]

FLAGS
  --plebbitRpcUrl=<value>   (required) [default: ws://localhost:9138/] URL to Plebbit RPC
  --privateKeyPath=<value>  Private key (PEM) of the community signer that will be used to determine address (if address
                            is not a domain). If it's not provided then Plebbit will generate a private key

DESCRIPTION
  Create a community with specific properties. A newly created community will be started after creation and be able to
  receive publications. For a list of properties, visit
  https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions

EXAMPLES
  Create a community with title 'Hello Plebs' and description 'Welcome'

    $ bitsocial community create --title 'Hello Plebs' --description 'Welcome'
```

_See code: [src/cli/commands/community/create.ts](https://github.com/bitsocialhq/bitsocial-cli/blob/v0.19.10/src/cli/commands/community/create.ts)_

## `bitsocial community delete ADDRESSES`

Delete a community permanently.

```
USAGE
  $ bitsocial community delete ADDRESSES... --plebbitRpcUrl <value>

ARGUMENTS
  ADDRESSES...  Addresses of communities to delete. Separated by space

FLAGS
  --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC

DESCRIPTION
  Delete a community permanently.

EXAMPLES
  $ bitsocial community delete plebbit.eth

  $ bitsocial community delete Qmb99crTbSUfKXamXwZBe829Vf6w5w5TktPkb6WstC9RFW
```

_See code: [src/cli/commands/community/delete.ts](https://github.com/bitsocialhq/bitsocial-cli/blob/v0.19.10/src/cli/commands/community/delete.ts)_

## `bitsocial community edit ADDRESS`

Edit a community's properties. For a list of properties, visit https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions

```
USAGE
  $ bitsocial community edit ADDRESS --plebbitRpcUrl <value>

ARGUMENTS
  ADDRESS  Address of the community to edit

FLAGS
  --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC

DESCRIPTION
  Edit a community's properties. For a list of properties, visit
  https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions

EXAMPLES
  Change the address of the community to a new ENS address

    $ bitsocial community edit 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu --address newAddress.eth

  Add the author address 'esteban.eth' as an admin on the community

    $ bitsocial community edit mysub.eth '--roles["esteban.eth"].role' admin

  Add two challenges to the community. The first challenge will be a question and answer, and the second will be an
  image captcha

    $ bitsocial community edit mysub.eth --settings.challenges[0].name question \
      --settings.challenges[0].options.question "what is the password?" --settings.challenges[0].options.answer \
      thepassword --settings.challenges[1].name captcha-canvas-v3

  Change the title and description

    $ bitsocial community edit mysub.eth --title "This is the new title" --description "This is the new description"

  Remove a role from a moderator/admin/owner

    $ bitsocial community edit plebbit.eth --roles['rinse12.eth'] null

  Enable settings.fetchThumbnailUrls to fetch the thumbnail of url submitted by authors

    $ bitsocial community edit plebbit.eth --settings.fetchThumbnailUrls

  disable settings.fetchThumbnailUrls

    $ bitsocial community edit plebbit.eth --settings.fetchThumbnailUrls=false
```

_See code: [src/cli/commands/community/edit.ts](https://github.com/bitsocialhq/bitsocial-cli/blob/v0.19.10/src/cli/commands/community/edit.ts)_

## `bitsocial community get ADDRESS`

Fetch a local or remote community, and print its json in the terminal

```
USAGE
  $ bitsocial community get ADDRESS --plebbitRpcUrl <value>

ARGUMENTS
  ADDRESS  Address of the community to fetch

FLAGS
  --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC

DESCRIPTION
  Fetch a local or remote community, and print its json in the terminal

EXAMPLES
  $ bitsocial community get plebmusic.eth

  $ bitsocial community get 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu
```

_See code: [src/cli/commands/community/get.ts](https://github.com/bitsocialhq/bitsocial-cli/blob/v0.19.10/src/cli/commands/community/get.ts)_

## `bitsocial community list`

List your communities

```
USAGE
  $ bitsocial community list --plebbitRpcUrl <value> [-q]

FLAGS
  -q, --quiet                  Only display community addresses
      --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC

DESCRIPTION
  List your communities

EXAMPLES
  $ bitsocial community list -q

  $ bitsocial community list
```

_See code: [src/cli/commands/community/list.ts](https://github.com/bitsocialhq/bitsocial-cli/blob/v0.19.10/src/cli/commands/community/list.ts)_

## `bitsocial community start ADDRESSES`

Start a community

```
USAGE
  $ bitsocial community start ADDRESSES... --plebbitRpcUrl <value>

ARGUMENTS
  ADDRESSES...  Addresses of communities to start. Separated by space

FLAGS
  --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC

DESCRIPTION
  Start a community

EXAMPLES
  $ bitsocial community start plebbit.eth

  $ bitsocial community start 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu
```

_See code: [src/cli/commands/community/start.ts](https://github.com/bitsocialhq/bitsocial-cli/blob/v0.19.10/src/cli/commands/community/start.ts)_

## `bitsocial community stop ADDRESSES`

Stop a community. The community will not publish or receive any publications until it is started again.

```
USAGE
  $ bitsocial community stop ADDRESSES... --plebbitRpcUrl <value>

ARGUMENTS
  ADDRESSES...  Addresses of communities to stop. Separated by space

FLAGS
  --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC

DESCRIPTION
  Stop a community. The community will not publish or receive any publications until it is started again.

EXAMPLES
  $ bitsocial community stop plebbit.eth

  $ bitsocial community stop Qmb99crTbSUfKXamXwZBe829Vf6w5w5TktPkb6WstC9RFW
```

_See code: [src/cli/commands/community/stop.ts](https://github.com/bitsocialhq/bitsocial-cli/blob/v0.19.10/src/cli/commands/community/stop.ts)_

## `bitsocial daemon`

Run a network-connected BitSocial node. Once the daemon is running you can create and start your communities and receive publications from users. The daemon will also serve web ui on http that can be accessed through a browser on any machine. Within the web ui users are able to browse, create and manage their communities fully P2P.

```
USAGE
  $ bitsocial daemon --plebbitRpcUrl <value> --logPath <value>

FLAGS
  --logPath=<value>        (required) [default: /home/runner/.local/state/bitsocial] Specify a directory which will be
                           used to store logs
  --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] Specify Plebbit RPC URL to listen on

DESCRIPTION
  Run a network-connected BitSocial node. Once the daemon is running you can create and start your communities and
  receive publications from users. The daemon will also serve web ui on http that can be accessed through a browser on
  any machine. Within the web ui users are able to browse, create and manage their communities fully P2P.
  Options can be passed to the RPC's instance through flag --plebbitOptions.optionName. For a list of plebbit options
  (https://github.com/plebbit/plebbit-js?tab=readme-ov-file#plebbitoptions)
  If you need to modify ipfs config, you should head to {bitsocial-data-path}/.ipfs-bitsocial-cli/config and modify the
  config file


EXAMPLES
  $ bitsocial daemon

  $ bitsocial daemon --plebbitRpcUrl ws://localhost:53812

  $ bitsocial daemon --plebbitOptions.dataPath /tmp/bitsocial-datapath/

  $ bitsocial daemon --plebbitOptions.chainProviders.eth[0].url https://ethrpc.com

  $ bitsocial daemon --plebbitOptions.kuboRpcClientsOptions[0] https://remoteipfsnode.com
```

_See code: [src/cli/commands/daemon.ts](https://github.com/bitsocialhq/bitsocial-cli/blob/v0.19.10/src/cli/commands/daemon.ts)_

## `bitsocial help [COMMAND]`

Display help for bitsocial.

```
USAGE
  $ bitsocial help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for bitsocial.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.36/src/cli/commands/help.ts)_
<!-- commandsstop -->

# Contribution

We're always happy to receive pull requests. Few things to keep in mind:

-   This repo follows [Angular commit conventions](https://github.com/angular/angular/blob/main/CONTRIBUTING.md). Easiest way to follow these conventions is by using `yarn commit` instead of `git commit`
-   If you're adding a feature, make sure to add tests to your pull requests

# Feedback

We would love your feedback on our community channels
