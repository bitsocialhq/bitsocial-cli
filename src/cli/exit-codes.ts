export enum exitMessages {
    ERR_DAEMON_IS_DOWN = "Daemon is down. Please run 'plebbit daemon' before executing this command",
    ERR_AUTHOR_ROLE_DOES_NOT_EXIST = "Author does not have any roles to remove"
}

// Bash exit status. A number from 1-255. If a command exits with status '0' then it has succeeded
export enum exitStatuses {
    ERR_DAEMON_IS_DOWN = 1,
    ERR_SUB_ALREADY_STARTED = 2,
    ERR_SUBPLEBBIT_DOES_NOT_EXIST = 3,
    ERR_AUTHOR_ROLE_DOES_NOT_EXIST = 4,
    ERR_SUBPLEBBIT_NOT_RUNNING = 5
}
