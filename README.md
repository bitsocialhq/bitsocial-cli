[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Usage

<!-- usage -->

```sh-session
$ npm install -g plebbit-cli
$ plebbit COMMAND
running command...
$ plebbit (--version)
plebbit-cli/0.0.1 linux-x64 node-v16.18.1
$ plebbit --help [COMMAND]
USAGE
  $ plebbit COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

-   [`plebbit daemon`](#plebbit-daemon)
-   [`plebbit help [COMMAND]`](#plebbit-help-command)
-   [`plebbit subplebbit create`](#plebbit-subplebbit-create)
-   [`plebbit subplebbit edit ADDRESS`](#plebbit-subplebbit-edit-address)
-   [`plebbit subplebbit list`](#plebbit-subplebbit-list)
-   [`plebbit subplebbit start ADDRESSES`](#plebbit-subplebbit-start-addresses)

## `plebbit daemon`

Run a network-connected Plebbit node

```
USAGE
  $ plebbit daemon --plebbitDataPath <value> --plebbitApiPort <value> --ipfsApiPort <value>
    --ipfsGatewayPort <value>

FLAGS
  --ipfsApiPort=<value>      (required) [default: 32429] Specify the API port of the ipfs node to listen on
  --ipfsGatewayPort=<value>  (required) [default: 32430] Specify the gateway port of the ipfs node to listen on
  --plebbitApiPort=<value>   (required) [default: 32431] Specify Plebbit API port to listen on
  --plebbitDataPath=<value>  (required) [default: /home/user/.local/share/plebbit] Path to plebbit data path where
                             subplebbits and ipfs node are stored

DESCRIPTION
  Run a network-connected Plebbit node
```

_See code: [dist/src/cli/commands/daemon.ts](https://github.com/plebbit/plebbit-cli/blob/v0.0.1/dist/src/cli/commands/daemon.ts)_

## `plebbit help [COMMAND]`

Display help for plebbit.

```
USAGE
  $ plebbit help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for plebbit.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.16/src/commands/help.ts)_

## `plebbit subplebbit create`

Create a subplebbit

```
USAGE
  $ plebbit subplebbit create --apiUrl <value> [--address <value>] [--title <value>] [--description <value>]
    [--pubsubTopic <value>] [--suggested.primaryColor <value>] [--suggested.secondaryColor <value>]
    [--suggested.avatarUrl <value>] [--suggested.bannerUrl <value>] [--suggested.backgroundUrl <value>]
    [--suggested.language <value>] [--signer.privateKey <value>] [--database.connection.filename <value>]

FLAGS
  --address=<value>                       Address of the subplebbit. Can be used to retrieve an already existing
                                          subplebbit
  --apiUrl=<value>                        (required) [default: http://localhost:32431/api/v0] URL to Plebbit API
  --database.connection.filename=<value>  Path to the subplebbit sqlite file
  --description=<value>                   Description of the subplebbit
  --pubsubTopic=<value>                   The string to publish to in the pubsub, a public key of the subplebbit owner's
                                          choice
  --signer.privateKey=<value>             Private key (PEM) of the subplebbit signer that will be used to determine
                                          address (if address is not a domain). Only needed if you're creating a new
                                          subplebbit
  --suggested.avatarUrl=<value>           The URL of the subplebbit's avatar
  --suggested.backgroundUrl=<value>       The URL of the subplebbit's background
  --suggested.bannerUrl=<value>           The URL of the subplebbit's banner
  --suggested.language=<value>            The language of the subplebbit
  --suggested.primaryColor=<value>
  --suggested.secondaryColor=<value>      Secondary color of the subplebbit in hex
  --title=<value>                         Title of the subplebbit

DESCRIPTION
  Create a subplebbit
```

## `plebbit subplebbit edit ADDRESS`

Edit a subplebbit

```
USAGE
  $ plebbit subplebbit edit [ADDRESS] --apiUrl <value> [--address <value>] [--title <value>] [--description <value>]
    [--pubsubTopic <value>] [--suggested.primaryColor <value>] [--suggested.secondaryColor <value>]
    [--suggested.avatarUrl <value>] [--suggested.bannerUrl <value>] [--suggested.backgroundUrl <value>]
    [--suggested.language <value>]

ARGUMENTS
  ADDRESS  Address of the subplebbit address to edit

FLAGS
  --address=<value>                   Address of the subplebbit. Can be used to retrieve an already existing subplebbit
  --apiUrl=<value>                    (required) [default: http://localhost:32431/api/v0] URL to Plebbit API
  --description=<value>               Description of the subplebbit
  --pubsubTopic=<value>               The string to publish to in the pubsub, a public key of the subplebbit owner's
                                      choice
  --suggested.avatarUrl=<value>       The URL of the subplebbit's avatar
  --suggested.backgroundUrl=<value>   The URL of the subplebbit's background
  --suggested.bannerUrl=<value>       The URL of the subplebbit's banner
  --suggested.language=<value>        The language of the subplebbit
  --suggested.primaryColor=<value>
  --suggested.secondaryColor=<value>  Secondary color of the subplebbit in hex
  --title=<value>                     Title of the subplebbit

DESCRIPTION
  Edit a subplebbit
```

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

## `plebbit subplebbit start ADDRESSES`

Start a subplebbit

```
USAGE
  $ plebbit subplebbit start [ADDRESSES] --apiUrl <value>

ARGUMENTS
  ADDRESSES  Addresses of subplebbits to start. Separated by space

FLAGS
  --apiUrl=<value>  (required) [default: http://localhost:32431/api/v0] URL to Plebbit API

DESCRIPTION
  Start a subplebbit
```

<!-- commandsstop -->

# Table of contents

<!-- toc -->

-   [Usage](#usage)
-   [Commands](#commands)
-   [Table of contents](#table-of-contents)
<!-- tocstop -->
