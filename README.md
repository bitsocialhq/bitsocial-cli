[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

<img src="https://raw.githubusercontent.com/plebbit/assets/master/letters-grey.svg" width="260" height="73">

# plebbit-cli: A Plebbit Node with WebSocket and Command Line Interface

# Table of contents

-   [What is Plebbit?](#what-is-plebbit)
-   [What is plebbit-cli?](#what-is-plebbit-cli)
-   [Install](#install)
-   [Usage](#usage)
-   [Commands](#commands)
-   [Contribution](#contribution)
-   [Feedback](#feedback)

# What is Plebbit?

Plebbit is serverless, admin-less, decentralized Reddit alternative built completely with IPFS/IPNS/pubsub/ENS. It doesn't use any central server, central database, public HTTP endpoint or DNS, it is pure peer to peer (except for the web client that can't join a P2P swarm directly, web clients use interchangeable HTTP providers). It will allow subplebbit (subreddit) owners to retain full ownership over their community. Whitepaper [here](https://github.com/plebbit/whitepaper/discussions/2)

# What is plebbit-cli?

`plebbit-cli` is an interface to the backend of Plebbit using [plebbit-js](https://github.com/plebbit/plebbit-js). Users can run and manage their subplebbits using it. It is written in Typescript and designed to receive commands via CLI and WebSocket.

-   Runs an IPFS and Plebbit node
-   Command Line interface Interface to IPFS-Nodes
-   WebSocket RPC to access and control your subplebbits and publications

# Install

## For Linux/MacOS

```sh-session
curl https://raw.githubusercontent.com/plebbit/plebbit-cli/master/bin/install.sh | sh
```

### If you want to install a specific plebbit-cli version

```sh-session
curl https://raw.githubusercontent.com/plebbit/plebbit-cli/master/bin/install.sh | sh -s 0.14.4
```

If you get `libfontconfig dependency error`, then you need to install libfontconfig by running `sudo apt install -y libfontconfig1 fontconfig libfontconfig1-dev libfontconfig`

## For Windows

For Windows, You need to install [vc-redist](https://learn.microsoft.com/en-US/cpp/windows/latest-supported-vc-redist?view=msvc-170) first. After you install `vc-redist`, download the installer of [plebbit](https://github.com/plebbit/plebbit-cli/releases/latest/download/plebbit_installer_win32_x64.exe) and next your way to the end

## Build your Plebbit executable manually (optional)

In case the installation script is not working for you or you just want to build the source code directly. First, Yyu need to have `NodeJS 20`, `npm` and `yarn` installed

```
git clone https://github.com/plebbit/plebbit-cli
cd plebbit-cli
yarn install --frozen-lockfile
yarn build
yarn oclif manifest
yarn ci:download-web-uis
./bin/run --help
```

After running the last command you should be able to run commands directly against `./bin/run`, for example `./bin/run daemon`

# Usage

## The data/config directory of Plebbit

This is the default directory where plebbit-cli will keep its config, as well as data for local subplebbits:

-   macOS: ~/Library/Application Support/plebbit
-   Windows: %LOCALAPPDATA%\plebbit
-   Linux: ~/.local/share/plebbit

## The logs directory of Plebbit

Plebbit-cli will keep logs in this directory, with a cap of 10M per log file.

-   macOS: ~/Library/Logs/plebbit
-   Windows: %LOCALAPPDATA%\plebbit\Log
-   Linux: ~/.local/state/plebbit

## Running Daemon

In Bash (or powershell if you're on Windows), run `plebbit daemon` to able to connect to the network. You need to have the `plebbit daemon` terminal running to be able to execute other commands.

```sh-session
$ plebbit daemon
IPFS API listening on: http://localhost:5001/api/v0
IPFS Gateway listening on: http://localhost:6473
plebbit rpc: listening on ws://localhost:9138 (local connections only)
plebbit rpc: listening on ws://localhost:9138/MHA1tm2QWG19z0bnkRarDNWIajDobl7iN2eM2PmL (secret auth key for remote connections)
Plebbit data path: /root/.local/share/plebbit
Subplebbits in data path:  [ 'pleblore.eth' ]
WebUI (plebones): http://localhost:9138/plebones (local connections only)
WebUI (plebones): http://192.168.1.60:9138/MHA1tm2QWG19z0bnkRarDNWIajDobl7iN2eM2PmL/plebones (secret auth key for remote connections)
WebUI (seedit): http://localhost:9138/seedit (local connections only)
WebUI (seedit): http://192.168.1.60:9138/MHA1tm2QWG19z0bnkRarDNWIajDobl7iN2eM2PmL/seedit (secret auth key for remote connections)

```

Once `plebbit daemon` is running, you can create and manage your subplebbits through the web interfaces, either seedit or plebones. If you're a power user and prefer CLI, then you can take a look at the commands below.
### Creating your first sub

```sh-session
$ plebbit subplebbit create --title "Hello Plebs!" --description "This is gonna be great"
12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu
```

### Listing all your subs

```sh-session
$ plebbit subplebbit list
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

### Adding a role moderator to your sub

```sh-session
$ plebbit subplebbit edit mysub.eth '--roles["author-address.eth"].role' moderator
```

### Adding a role owner to your sub

```sh-session
$ plebbit subplebbit edit mysub.eth '--roles["author-address.eth"].role' owner
```

### Adding a role admin to your sub

```sh-session
$ plebbit subplebbit edit mysub.eth '--roles["author-address.eth"].role' admin
```

### Removing a role

```sh-session
$ plebbit subplebbit edit mysub.eth '--roles["author-address.eth"]' null
```

# Commands

<!-- commands -->
* [`plebbit daemon`](#plebbit-daemon)
* [`plebbit help [COMMAND]`](#plebbit-help-command)
* [`plebbit subplebbit create`](#plebbit-subplebbit-create)
* [`plebbit subplebbit edit ADDRESS`](#plebbit-subplebbit-edit-address)
* [`plebbit subplebbit get ADDRESS`](#plebbit-subplebbit-get-address)
* [`plebbit subplebbit list`](#plebbit-subplebbit-list)
* [`plebbit subplebbit start ADDRESSES`](#plebbit-subplebbit-start-addresses)
* [`plebbit subplebbit stop ADDRESSES`](#plebbit-subplebbit-stop-addresses)

## `plebbit daemon`

Run a network-connected Plebbit node. Once the daemon is running you can create and start your subplebbits and receive publications from users. The daemon will also serve web ui on http that can be accessed through a browser on any machine. Within the web ui users are able to browse, create and manage their subs fully P2P.

```
USAGE
  $ plebbit daemon --plebbitRpcUrl <value> --logPath <value>

FLAGS
  --logPath=<value>        (required) [default: /home/runner/.local/state/plebbit] Specify a directory which will be
                           used to store logs
  --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] Specify Plebbit RPC URL to listen on

DESCRIPTION
  Run a network-connected Plebbit node. Once the daemon is running you can create and start your subplebbits and receive
  publications from users. The daemon will also serve web ui on http that can be accessed through a browser on any
  machine. Within the web ui users are able to browse, create and manage their subs fully P2P.
  Options can be passed to the RPC's instance through flag --plebbitOptions.optionName. For a list of plebbit options
  (https://github.com/plebbit/plebbit-js?tab=readme-ov-file#plebbitoptions)
  If you need to modify ipfs config, you should head to {plebbit-data-path}/.ipfs-plebbit-cli/config and modify the
  config file


EXAMPLES
  $ plebbit daemon

  $ plebbit daemon --plebbitRpcUrl ws://localhost:53812

  $ plebbit daemon --plebbitOptions.dataPath /tmp/plebbit-datapath/

  $ plebbit daemon --plebbitOptions.chainProviders.eth[0].url https://ethrpc.com

  $ plebbit daemon --plebbitOptions.kuboRpcClientsOptions[0] https://remoteipfsnode.com
```

_See code: [src/cli/commands/daemon.ts](https://github.com/plebbit/plebbit-cli/blob/v0.17.12/src/cli/commands/daemon.ts)_

## `plebbit help [COMMAND]`

Display help for plebbit.

```
USAGE
  $ plebbit help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for plebbit.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.36/src/cli/commands/help.ts)_

## `plebbit subplebbit create`

Create a subplebbit with specific properties. A newly created sub will be started after creation and be able to receive publications. For a list of properties, visit https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions

```
USAGE
  $ plebbit subplebbit create --plebbitRpcUrl <value> [--privateKeyPath <value>]

FLAGS
  --plebbitRpcUrl=<value>   (required) [default: ws://localhost:9138/] URL to Plebbit RPC
  --privateKeyPath=<value>  Private key (PEM) of the subplebbit signer that will be used to determine address (if
                            address is not a domain). If it's not provided then Plebbit will generate a private key

DESCRIPTION
  Create a subplebbit with specific properties. A newly created sub will be started after creation and be able to
  receive publications. For a list of properties, visit
  https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions

EXAMPLES
  Create a subplebbit with title 'Hello Plebs' and description 'Welcome'

    $ plebbit subplebbit create --title 'Hello Plebs' --description 'Welcome'
```

_See code: [src/cli/commands/subplebbit/create.ts](https://github.com/plebbit/plebbit-cli/blob/v0.17.12/src/cli/commands/subplebbit/create.ts)_

## `plebbit subplebbit edit ADDRESS`

Edit a subplebbit properties. For a list of properties, visit https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions

```
USAGE
  $ plebbit subplebbit edit ADDRESS --plebbitRpcUrl <value>

ARGUMENTS
  ADDRESS  Address of the subplebbit address to edit

FLAGS
  --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC

DESCRIPTION
  Edit a subplebbit properties. For a list of properties, visit
  https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions

EXAMPLES
  Change the address of the sub to a new ENS address

    $ plebbit subplebbit edit 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu --address newAddress.eth

  Add the author address 'esteban.eth' as an admin on the sub

    $ plebbit subplebbit edit mysub.eth '--roles["esteban.eth"].role' admin

  Add two challenges to the sub. The first challenge will be a question and answer, and the second will be an image
  captcha

    $ plebbit subplebbit edit mysub.eth --settings.challenges[0].name question \
      --settings.challenges[0].options.question "what is the password?" --settings.challenges[0].options.answer \
      thepassword --settings.challenges[1].name captcha-canvas-v3

  Change the title and description

    $ plebbit subplebbit edit mysub.eth --title "This is the new title" --description "This is the new description"

  Remove a role from a moderator/admin/owner

    $ plebbit subplebbit edit plebbit.eth --roles['rinse12.eth'] null

  Enable settings.fetchThumbnailUrls to fetch the thumbnail of url submitted by authors

    subplebbit edit plebbit.eth --settings.fetchThumbnailUrls

  disable settings.fetchThumbnailUrls

    subplebbit edit plebbit.eth --settings.fetchThumbnailUrls=false
```

_See code: [src/cli/commands/subplebbit/edit.ts](https://github.com/plebbit/plebbit-cli/blob/v0.17.12/src/cli/commands/subplebbit/edit.ts)_

## `plebbit subplebbit get ADDRESS`

Fetch a local or remote subplebbit, and print its json in the terminal

```
USAGE
  $ plebbit subplebbit get ADDRESS --plebbitRpcUrl <value>

ARGUMENTS
  ADDRESS  Address of the subplebbit address to fetch

FLAGS
  --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC

DESCRIPTION
  Fetch a local or remote subplebbit, and print its json in the terminal

EXAMPLES
  $ plebbit subplebbit get plebmusic.eth

  $ plebbit subplebbit get 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu
```

_See code: [src/cli/commands/subplebbit/get.ts](https://github.com/plebbit/plebbit-cli/blob/v0.17.12/src/cli/commands/subplebbit/get.ts)_

## `plebbit subplebbit list`

List your subplebbits

```
USAGE
  $ plebbit subplebbit list --plebbitRpcUrl <value> [-q]

FLAGS
  -q, --quiet                  Only display subplebbit addresses
      --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC

DESCRIPTION
  List your subplebbits

EXAMPLES
  $ plebbit subplebbit list -q

  $ plebbit subplebbit list
```

_See code: [src/cli/commands/subplebbit/list.ts](https://github.com/plebbit/plebbit-cli/blob/v0.17.12/src/cli/commands/subplebbit/list.ts)_

## `plebbit subplebbit start ADDRESSES`

Start a subplebbit

```
USAGE
  $ plebbit subplebbit start ADDRESSES... --plebbitRpcUrl <value>

ARGUMENTS
  ADDRESSES...  Addresses of subplebbits to start. Separated by space

FLAGS
  --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC

DESCRIPTION
  Start a subplebbit

EXAMPLES
  $ plebbit subplebbit start plebbit.eth

  $ plebbit subplebbit start 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu
```

_See code: [src/cli/commands/subplebbit/start.ts](https://github.com/plebbit/plebbit-cli/blob/v0.17.12/src/cli/commands/subplebbit/start.ts)_

## `plebbit subplebbit stop ADDRESSES`

Stop a subplebbit. The subplebbit will not publish or receive any publications until it is started again.

```
USAGE
  $ plebbit subplebbit stop ADDRESSES... --plebbitRpcUrl <value>

ARGUMENTS
  ADDRESSES...  Addresses of subplebbits to stop. Separated by space

FLAGS
  --plebbitRpcUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC

DESCRIPTION
  Stop a subplebbit. The subplebbit will not publish or receive any publications until it is started again.

EXAMPLES
  $ plebbit subplebbit stop plebbit.eth

  $ plebbit subplebbit stop Qmb99crTbSUfKXamXwZBe829Vf6w5w5TktPkb6WstC9RFW
```

_See code: [src/cli/commands/subplebbit/stop.ts](https://github.com/plebbit/plebbit-cli/blob/v0.17.12/src/cli/commands/subplebbit/stop.ts)_
<!-- commandsstop -->

# Contribution

We're always happy to receive pull requests. Few things to keep in mind:

-   This repo follows [Angular commit conventions](https://github.com/angular/angular/blob/main/CONTRIBUTING.md). Easiest way to follow these conventions is by using `yarn commit` instead of `git commit`
-   If you're adding a feature, make sure to add tests to your pull requests

# Feedback

We would love your feedback on our [Telegram](https://t.me/plebbit)
