[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

<img src="https://raw.githubusercontent.com/plebbit/assets/master/letters-grey.svg" width="260" height="73">

# plebbit-cli: A Plebbit Node with HTTP and Command Line Interface

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

`plebbit-cli` is an interface to the backend of Plebbit using [plebbit-js](https://github.com/plebbit/plebbit-js). Users can run and manage their subplebbits using it. It is written in Typescript and designed to receive commands via CLI and HTTP.

-   Runs an IPFS and Plebbit node
-   Command Line interface Interface to IPFS-Nodes
-   HTTP RPC API (`/api/v0`) to access and control Plebbit daemon

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

## Running Daemon

In Bash (or powershell if you're on Windows), run `plebbit daemon` to able to connect to the network. You need to have the `plebbit daemon` terminal running to be able to execute other commands.

```sh-session
$ plebbit daemon
IPFS API listening on: http://localhost:32429/api/v0
IPFS Gateway listening on: http://localhost:32430
Plebbit API listening on: http://localhost:32431/api/v0
You can find Plebbit API documentation at: http://localhost:32431/api/v0/docs
```

### Seeding Subplebbits
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
```

### Creating your first sub
```sh-session
$ plebbit subplebbit create --title "Hello Plebs!" --description "This is gonna be great"
QmPjewdKya8iVkuQiiXQ5qRBsgVUAZg2LQ2m8v3LNJ7Ht8
```

### Listing all your subs
```sh-session
$ plebbit subplebbit list
Address                                        Started 
────────────────────────────────────────────── ─────── 
QmPjewdKya8iVkuQiiXQ5qRBsgVUAZg2LQ2m8v3LNJ7Ht8 false   
QmRcyUK7jUhFyPTEvwWyfGZEAaSoDugNJ8PZSC4PWRjUqd false
```

### Adding an author role
```sh-session
$ plebbit subplebbit role set QmPjewdKya8iVkuQiiXQ5qRBsgVUAZg2LQ2m8v3LNJ7Ht8 author-address.eth --role moderator
```

### Removing a role
```sh-session
$ plebbit subplebbit role remove QmPjewdKya8iVkuQiiXQ5qRBsgVUAZg2LQ2m8v3LNJ7Ht8 author-address.eth 
```


# Commands

<!-- commands -->
* [`plebbit daemon`](#plebbit-daemon)
* [`plebbit help [COMMANDS]`](#plebbit-help-commands)
* [`plebbit subplebbit create`](#plebbit-subplebbit-create)
* [`plebbit subplebbit edit ADDRESS`](#plebbit-subplebbit-edit-address)
* [`plebbit subplebbit list`](#plebbit-subplebbit-list)
* [`plebbit subplebbit role remove SUB-ADDRESS AUTHOR-ADDRESS`](#plebbit-subplebbit-role-remove-sub-address-author-address)
* [`plebbit subplebbit role set SUB-ADDRESS AUTHOR-ADDRESS`](#plebbit-subplebbit-role-set-sub-address-author-address)
* [`plebbit subplebbit start ADDRESSES`](#plebbit-subplebbit-start-addresses)
* [`plebbit subplebbit stop ADDRESSES`](#plebbit-subplebbit-stop-addresses)

## `plebbit daemon`

Run a network-connected Plebbit node. Once the daemon is running you can create and start your subplebbits and receive publications from users

```
USAGE
  $ plebbit daemon --plebbitDataPath <value> --plebbitApiPort <value> --ipfsApiPort <value>
    --ipfsGatewayPort <value> [--seed] [--seedSubs <value>]

FLAGS
  --ipfsApiPort=<value>      (required) [default: 32429] Specify the API port of the ipfs node to listen on
  --ipfsGatewayPort=<value>  (required) [default: 32430] Specify the gateway port of the ipfs node to listen on
  --plebbitApiPort=<value>   (required) [default: 32431] Specify Plebbit API port to listen on
  --plebbitDataPath=<value>  (required) [default: /home/runner/.local/share/plebbit] Path to plebbit data path where
                             subplebbits and ipfs node are stored
  --seed                     Seeding flag. Seeding helps subplebbits distribute their publications and latest updates,
                             as well as receiving new publications
  --seedSubs=<value>...      [default: ] Subplebbits to seed. If --seed is used and no subs was provided, it will
                             default to seeding default subs

DESCRIPTION
  Run a network-connected Plebbit node. Once the daemon is running you can create and start your subplebbits and receive
  publications from users

EXAMPLES
  $ plebbit daemon

  $ plebbit daemon --seed

  $ plebbit daemon --seed --seedSubs mysub.eth, myothersub.eth, 12D3KooWEKA6Fhp6qtyttMvNKcNCtqH2N7ZKpPy5rfCeM1otr5qU
```

_See code: [dist/src/cli/commands/daemon.js](https://github.com/plebbit/plebbit-cli/blob/v0.7.13/dist/src/cli/commands/daemon.js)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.17/src/commands/help.ts)_

## `plebbit subplebbit create`

Create a subplebbit with specific properties. A newly created sub will be started after creation and be able to receive publications

```
USAGE
  $ plebbit subplebbit create --apiUrl <value> [--title <value>] [--description <value>] [--pubsubTopic <value>]
    [--suggested.primaryColor <value>] [--suggested.secondaryColor <value>] [--suggested.avatarUrl <value>]
    [--suggested.bannerUrl <value>] [--suggested.backgroundUrl <value>] [--suggested.language <value>]
    [--settings.fetchThumbnailUrls] [--settings.fetchThumbnailUrlsProxyUrl <value>] [--privateKeyPath <value>]

FLAGS
  --apiUrl=<value>                               (required) [default: http://localhost:32431/api/v0] URL to Plebbit API
  --description=<value>                          Description of the subplebbit
  --privateKeyPath=<value>                       Private key (PEM) of the subplebbit signer that will be used to
                                                 determine address (if address is not a domain). If it's not provided
                                                 then Plebbit will generate a private key
  --pubsubTopic=<value>                          The string to publish to in the pubsub, a public key of the subplebbit
                                                 owner's choice
  --settings.fetchThumbnailUrls                  Fetch the thumbnail URLs of comments with comment.link property, could
                                                 reveal the IP address of the subplebbit node
  --settings.fetchThumbnailUrlsProxyUrl=<value>  The HTTP proxy URL used to fetch thumbnail URLs
  --suggested.avatarUrl=<value>                  The URL of the subplebbit's avatar
  --suggested.backgroundUrl=<value>              The URL of the subplebbit's background
  --suggested.bannerUrl=<value>                  The URL of the subplebbit's banner
  --suggested.language=<value>                   The language of the subplebbit
  --suggested.primaryColor=<value>               Primary color of the subplebbit in hex
  --suggested.secondaryColor=<value>             Secondary color of the subplebbit in hex
  --title=<value>                                Title of the subplebbit

DESCRIPTION
  Create a subplebbit with specific properties. A newly created sub will be started after creation and be able to
  receive publications

EXAMPLES
  Create a subplebbit with title 'Hello Plebs' and description 'Welcome'

    $ plebbit subplebbit create --title 'Hello Plebs' --description 'Welcome'
```

_See code: [dist/src/cli/commands/subplebbit/create.js](https://github.com/plebbit/plebbit-cli/blob/v0.7.13/dist/src/cli/commands/subplebbit/create.js)_

## `plebbit subplebbit edit ADDRESS`

Edit a subplebbit

```
USAGE
  $ plebbit subplebbit edit ADDRESS --apiUrl <value> [--title <value>] [--description <value>] [--pubsubTopic
    <value>] [--suggested.primaryColor <value>] [--suggested.secondaryColor <value>] [--suggested.avatarUrl <value>]
    [--suggested.bannerUrl <value>] [--suggested.backgroundUrl <value>] [--suggested.language <value>]
    [--settings.fetchThumbnailUrls] [--settings.fetchThumbnailUrlsProxyUrl <value>] [--address <value>]

ARGUMENTS
  ADDRESS  Address of the subplebbit address to edit

FLAGS
  --address=<value>                              New address of the subplebbit
  --apiUrl=<value>                               (required) [default: http://localhost:32431/api/v0] URL to Plebbit API
  --description=<value>                          Description of the subplebbit
  --pubsubTopic=<value>                          The string to publish to in the pubsub, a public key of the subplebbit
                                                 owner's choice
  --settings.fetchThumbnailUrls                  Fetch the thumbnail URLs of comments with comment.link property, could
                                                 reveal the IP address of the subplebbit node
  --settings.fetchThumbnailUrlsProxyUrl=<value>  The HTTP proxy URL used to fetch thumbnail URLs
  --suggested.avatarUrl=<value>                  The URL of the subplebbit's avatar
  --suggested.backgroundUrl=<value>              The URL of the subplebbit's background
  --suggested.bannerUrl=<value>                  The URL of the subplebbit's banner
  --suggested.language=<value>                   The language of the subplebbit
  --suggested.primaryColor=<value>               Primary color of the subplebbit in hex
  --suggested.secondaryColor=<value>             Secondary color of the subplebbit in hex
  --title=<value>                                Title of the subplebbit

DESCRIPTION
  Edit a subplebbit
```

_See code: [dist/src/cli/commands/subplebbit/edit.js](https://github.com/plebbit/plebbit-cli/blob/v0.7.13/dist/src/cli/commands/subplebbit/edit.js)_

## `plebbit subplebbit list`

List your subplebbits

```
USAGE
  $ plebbit subplebbit list --apiUrl <value> [-q] [--columns <value> | -x] [--sort <value>] [--filter <value>]
    [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ]

FLAGS
  -q, --quiet        Only display subplebbit addresses
  -x, --extended     show extra columns
  --apiUrl=<value>   (required) [default: http://localhost:32431/api/v0] URL to Plebbit API
  --columns=<value>  only show provided columns (comma-separated)
  --csv              output is csv format [alias: --output=csv]
  --filter=<value>   filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>
  --sort=<value>     property to sort by (prepend '-' for descending)

DESCRIPTION
  List your subplebbits
```

_See code: [dist/src/cli/commands/subplebbit/list.js](https://github.com/plebbit/plebbit-cli/blob/v0.7.13/dist/src/cli/commands/subplebbit/list.js)_

## `plebbit subplebbit role remove SUB-ADDRESS AUTHOR-ADDRESS`

Remove role of an author within the subplebbit

```
USAGE
  $ plebbit subplebbit role remove SUB-ADDRESS AUTHOR-ADDRESS --apiUrl <value>

ARGUMENTS
  SUB-ADDRESS     Address of subplebbit
  AUTHOR-ADDRESS  The address of the author to remove their role

FLAGS
  --apiUrl=<value>  (required) [default: http://localhost:32431/api/v0] URL to Plebbit API

DESCRIPTION
  Remove role of an author within the subplebbit

EXAMPLES
  $ plebbit subplebbit role remove plebbit.eth estebanabaroa.eth
```

_See code: [dist/src/cli/commands/subplebbit/role/remove.js](https://github.com/plebbit/plebbit-cli/blob/v0.7.13/dist/src/cli/commands/subplebbit/role/remove.js)_

## `plebbit subplebbit role set SUB-ADDRESS AUTHOR-ADDRESS`

Set role to an author within the subplebbit. If an author has a role already, it would get overidden with the new role

```
USAGE
  $ plebbit subplebbit role set SUB-ADDRESS AUTHOR-ADDRESS --apiUrl <value> --role admin|moderator|owner

ARGUMENTS
  SUB-ADDRESS     Address of subplebbit
  AUTHOR-ADDRESS  The address of the author to set the role to

FLAGS
  --apiUrl=<value>  (required) [default: http://localhost:32431/api/v0] URL to Plebbit API
  --role=<option>   (required) [default: moderator] New role for the author
                    <options: admin|moderator|owner>

DESCRIPTION
  Set role to an author within the subplebbit. If an author has a role already, it would get overidden with the new role

EXAMPLES
  $ plebbit subplebbit role set plebbit.eth estebanabaroa.eth --role admin
```

_See code: [dist/src/cli/commands/subplebbit/role/set.js](https://github.com/plebbit/plebbit-cli/blob/v0.7.13/dist/src/cli/commands/subplebbit/role/set.js)_

## `plebbit subplebbit start ADDRESSES`

Start a subplebbit

```
USAGE
  $ plebbit subplebbit start ADDRESSES --apiUrl <value>

ARGUMENTS
  ADDRESSES  Addresses of subplebbits to start. Separated by space

FLAGS
  --apiUrl=<value>  (required) [default: http://localhost:32431/api/v0] URL to Plebbit API

DESCRIPTION
  Start a subplebbit
```

_See code: [dist/src/cli/commands/subplebbit/start.js](https://github.com/plebbit/plebbit-cli/blob/v0.7.13/dist/src/cli/commands/subplebbit/start.js)_

## `plebbit subplebbit stop ADDRESSES`

Stop a subplebbit. The subplebbit will not publish or receive any publications until it is started again.

```
USAGE
  $ plebbit subplebbit stop ADDRESSES --apiUrl <value>

ARGUMENTS
  ADDRESSES  Addresses of subplebbits to stop. Separated by space

FLAGS
  --apiUrl=<value>  (required) [default: http://localhost:32431/api/v0] URL to Plebbit API

DESCRIPTION
  Stop a subplebbit. The subplebbit will not publish or receive any publications until it is started again.

EXAMPLES
  $ plebbit subplebbit stop plebbit.eth

  $ plebbit subplebbit stop Qmb99crTbSUfKXamXwZBe829Vf6w5w5TktPkb6WstC9RFW
```

_See code: [dist/src/cli/commands/subplebbit/stop.js](https://github.com/plebbit/plebbit-cli/blob/v0.7.13/dist/src/cli/commands/subplebbit/stop.js)_
<!-- commandsstop -->

# Contribution

We're always happy to receive pull requests. Few things to keep in mind:

-   This repo follows [Angular commit conventions](https://github.com/angular/angular/blob/main/CONTRIBUTING.md). Easiest way to follow these conventions is by using `yarn commit` instead of `git commit`
-   If you're adding a feature, make sure to add tests to your pull requests

# Feedback

We would love your feedback on our [Telegram](https://t.me/plebbit)
