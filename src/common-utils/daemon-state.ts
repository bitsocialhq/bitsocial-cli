import defaults from "./defaults.js";
import path from "path";
import fs from "fs/promises";

const DAEMON_STATES_DIR = path.join(defaults.PKC_DATA_PATH, ".daemon_states");

export interface DaemonState {
    pid: number;
    startedAt: string;
    argv: string[];
    pkcRpcUrl: string;
}

function stateFilePath(pid: number): string {
    return path.join(DAEMON_STATES_DIR, `${pid}-daemon.state`);
}

/** Write a daemon state file atomically (write to .tmp then rename). */
export async function writeDaemonState(state: DaemonState): Promise<void> {
    await fs.mkdir(DAEMON_STATES_DIR, { recursive: true });
    const dest = stateFilePath(state.pid);
    const tmp = dest + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(state, null, 2));
    await fs.rename(tmp, dest);
}

/** Read all state files from the daemon states directory. */
export async function readAllDaemonStates(): Promise<DaemonState[]> {
    let entries: string[];
    try {
        entries = await fs.readdir(DAEMON_STATES_DIR);
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw e;
    }

    const states: DaemonState[] = [];
    for (const entry of entries) {
        if (!entry.endsWith("-daemon.state")) continue;
        try {
            const content = await fs.readFile(path.join(DAEMON_STATES_DIR, entry), "utf-8");
            states.push(JSON.parse(content) as DaemonState);
        } catch {
            // Corrupted or partially written — skip
        }
    }
    return states;
}

/** Delete a specific daemon's state file. Ignores ENOENT. */
export async function deleteDaemonState(pid: number): Promise<void> {
    try {
        await fs.unlink(stateFilePath(pid));
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
}

/** Check whether a PID is alive. */
function isPidAlive(pid: number): boolean {
    try {
        process.kill(pid, 0);
        return true;
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "EPERM") return true; // alive but owned by another user
        return false; // ESRCH — no such process
    }
}

/** Delete state files for dead PIDs from disk. */
export async function pruneStaleStates(): Promise<void> {
    const states = await readAllDaemonStates();
    for (const state of states) {
        if (!isPidAlive(state.pid)) {
            await deleteDaemonState(state.pid);
        }
    }
}

/** Read all states, delete stale files (dead PIDs) from disk, return only alive ones. */
export async function getAliveDaemonStates(): Promise<DaemonState[]> {
    const states = await readAllDaemonStates();
    const alive: DaemonState[] = [];
    for (const state of states) {
        if (isPidAlive(state.pid)) {
            alive.push(state);
        } else {
            await deleteDaemonState(state.pid);
        }
    }
    return alive;
}
