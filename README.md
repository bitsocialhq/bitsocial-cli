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
-   WebSocket RPC API to access and control your subplebbits and publications

# Install

For Linux/MacOS

```sh-session
curl https://raw.githubusercontent.com/plebbit/plebbit-cli/master/bin/install.sh | sh
```

For Windows, You need to install [vc-redist](https://learn.microsoft.com/en-US/cpp/windows/latest-supported-vc-redist?view=msvc-170) first. After you install `vc-redist`, download the install [plebbit](https://github.com/plebbit/plebbit-cli/releases/latest/download/plebbit_win-x64_installer.exe) and next your way to the end

## Build your Plebbit executable manually (optional)

You need to have `NodeJS 16`, `npm` and `yarn` installed

```
git clone https://github.com/plebbit/plebbit-cli
cd plebbit-cli
yarn install --frozen-lockfile
yarn build && yarn oclif manifest
yarn pkg -t node16-linux-x64 .
```

After running the last command you should have your executable in the directory. In this example we have generated an executables for linux. If you want to generate executables for different operating systems, visit [pkg documentation](https://github.com/vercel/pkg)

# Usage

## The data/config path of Plebbit
This is the directory where plebbit-cli will keep its config, as well as data for local subplebbits:
- macOS: ~/Library/Application Support/plebbit
- Windows: %LOCALAPPDATA%\plebbit
- Linux: ~/.local/share/plebbit

## Running Daemon

In Bash (or powershell if you're on Windows), run `plebbit daemon` to able to connect to the network. You need to have the `plebbit daemon` terminal running to be able to execute other commands.

```sh-session
$ plebbit daemon
IPFS API listening on: http://localhost:5001/api/v0
IPFS Gateway listening on: http://localhost:8080
Plebbit RPC API listening on: ws://localhost:9138
Plebbit data path: /root/.local/share/plebbit
```

<!-- ### Seeding Subplebbits
If you're feeling generous, and would like to seed the default subplebbits you can do so by using the `--seed` flag

```sh-session
$ plebbit daemon --seed
IPFS API listening on: http://localhost:32429/api/v0
IPFS Gateway listening on: http://localhost:32430
Plebbit API listening on: http://localhost:32431/api/v0
You can find Plebbit API documentation at: http://localhost:32431/api/v0/docs
Seeding subplebbits: [                                                                                   
  '12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu',                                                
  'plebshelpingplebs.eth',                                               
  'plebwhales.eth',                                                                                      
  'politically-incorrect.eth',                                                     
  'business-and-finance.eth',                        
  'movies-tv-anime.eth',                   
  'videos-livestreams-podcasts.eth',                          
  'health-nutrition-science.eth',                  
  'censorship-watch.eth',                     
  'reddit-screenshots.eth'                              
]     
``` -->

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

### Removing a role
```sh-session
$ plebbit subplebbit edit mysub.eth '--roles["author-address.eth"]' null
```


# Commands

<!-- commands -->
* [`plebbit daemon`](#plebbit-daemon)
* [`plebbit help [COMMANDS]`](#plebbit-help-commands)
* [`plebbit subplebbit create`](#plebbit-subplebbit-create)
* [`plebbit subplebbit edit ADDRESS`](#plebbit-subplebbit-edit-address)
* [`plebbit subplebbit list`](#plebbit-subplebbit-list)
* [`plebbit subplebbit start ADDRESSES`](#plebbit-subplebbit-start-addresses)
* [`plebbit subplebbit stop ADDRESSES`](#plebbit-subplebbit-stop-addresses)

## `plebbit daemon`

Run a network-connected Plebbit node. Once the daemon is running you can create and start your subplebbits and receive publications from users

```
USAGE
  $ plebbit daemon --plebbitDataPath <value> --plebbitRpcPort <value> --ipfsApiPort <value>
    --ipfsGatewayPort <value>

FLAGS
  --ipfsApiPort=<value>      (required) [default: 5001] Specify the API port of the ipfs node to listen on
  --ipfsGatewayPort=<value>  (required) [default: 8080] Specify the gateway port of the ipfs node to listen on
  --plebbitDataPath=<value>  (required) [default: /home/runner/.local/share/plebbit] Path to plebbit data path where
                             subplebbits and ipfs node are stored
  --plebbitRpcPort=<value>   (required) [default: 9138] Specify Plebbit RPC API port to listen on

DESCRIPTION
  Run a network-connected Plebbit node. Once the daemon is running you can create and start your subplebbits and receive
  publications from users

EXAMPLES
  $ plebbit daemon

  $ plebbit daemon --plebbitRpcPort 80
```

_See code: [src/commands/daemon.ts](https://github.com/plebbit/plebbit-cli/blob/v0.11.2/src/commands/daemon.ts)_

## `plebbit help [COMMANDS]`

Display help for plebbit.

```
USAGE
  $ plebbit help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for plebbit.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.12/src/commands/help.ts)_

## `plebbit subplebbit create`

Create a subplebbit with specific properties. A newly created sub will be started after creation and be able to receive publications. For a list of properties, visit https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions

```
USAGE
  $ plebbit subplebbit create --plebbitRpcApiUrl <value> [--privateKeyPath <value>]

FLAGS
  --plebbitRpcApiUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC API
  --privateKeyPath=<value>    Private key (PEM) of the subplebbit signer that will be used to determine address (if
                              address is not a domain). If it's not provided then Plebbit will generate a private key

DESCRIPTION
  Create a subplebbit with specific properties. A newly created sub will be started after creation and be able to
  receive publications. For a list of properties, visit
  https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions

EXAMPLES
  Create a subplebbit with title 'Hello Plebs' and description 'Welcome'

    $ plebbit subplebbit create --title 'Hello Plebs' --description 'Welcome'
```

_See code: [src/commands/subplebbit/create.ts](https://github.com/plebbit/plebbit-cli/blob/v0.11.2/src/commands/subplebbit/create.ts)_

## `plebbit subplebbit edit ADDRESS`

Edit a subplebbit properties. For a list of properties, visit https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions

```
USAGE
  $ plebbit subplebbit edit ADDRESS --plebbitRpcApiUrl <value>

ARGUMENTS
  ADDRESS  Address of the subplebbit address to edit

FLAGS
  --plebbitRpcApiUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC API

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
```

_See code: [src/commands/subplebbit/edit.ts](https://github.com/plebbit/plebbit-cli/blob/v0.11.2/src/commands/subplebbit/edit.ts)_

## `plebbit subplebbit list`

List your subplebbits

```
USAGE
  $ plebbit subplebbit list --plebbitRpcApiUrl <value> [-q] [--columns <value> | -x] [--filter <value>] [--no-header
    | [--csv | --no-truncate]] [--output csv|json|yaml |  | ] [--sort <value>]

FLAGS
  -q, --quiet                     Only display subplebbit addresses
  -x, --extended                  show extra columns
      --columns=<value>           only show provided columns (comma-separated)
      --csv                       output is csv format [alias: --output=csv]
      --filter=<value>            filter property by partial string matching, ex: name=foo
      --no-header                 hide table header from output
      --no-truncate               do not truncate output to fit screen
      --output=<option>           output in a more machine friendly format
                                  <options: csv|json|yaml>
      --plebbitRpcApiUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC API
      --sort=<value>              property to sort by (prepend '-' for descending)

DESCRIPTION
  List your subplebbits
```

_See code: [src/commands/subplebbit/list.ts](https://github.com/plebbit/plebbit-cli/blob/v0.11.2/src/commands/subplebbit/list.ts)_

## `plebbit subplebbit start ADDRESSES`

Start a subplebbit

```
USAGE
  $ plebbit subplebbit start ADDRESSES --plebbitRpcApiUrl <value>

ARGUMENTS
  ADDRESSES  Addresses of subplebbits to start. Separated by space

FLAGS
  --plebbitRpcApiUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC API

DESCRIPTION
  Start a subplebbit
```

_See code: [src/commands/subplebbit/start.ts](https://github.com/plebbit/plebbit-cli/blob/v0.11.2/src/commands/subplebbit/start.ts)_

## `plebbit subplebbit stop ADDRESSES`

Stop a subplebbit. The subplebbit will not publish or receive any publications until it is started again.

```
USAGE
  $ plebbit subplebbit stop ADDRESSES --plebbitRpcApiUrl <value>

ARGUMENTS
  ADDRESSES  Addresses of subplebbits to stop. Separated by space

FLAGS
  --plebbitRpcApiUrl=<value>  (required) [default: ws://localhost:9138/] URL to Plebbit RPC API

DESCRIPTION
  Stop a subplebbit. The subplebbit will not publish or receive any publications until it is started again.

EXAMPLES
  $ plebbit subplebbit stop plebbit.eth

  $ plebbit subplebbit stop Qmb99crTbSUfKXamXwZBe829Vf6w5w5TktPkb6WstC9RFW
```

_See code: [src/commands/subplebbit/stop.ts](https://github.com/plebbit/plebbit-cli/blob/v0.11.2/src/commands/subplebbit/stop.ts)_
<!-- commandsstop -->

# Contribution

We're always happy to receive pull requests. Few things to keep in mind:

-   This repo follows [Angular commit conventions](https://github.com/angular/angular/blob/main/CONTRIBUTING.md). Easiest way to follow these conventions is by using `yarn commit` instead of `git commit`
-   If you're adding a feature, make sure to add tests to your pull requests

# Feedback

We would love your feedback on our [Telegram](https://t.me/plebbit)
