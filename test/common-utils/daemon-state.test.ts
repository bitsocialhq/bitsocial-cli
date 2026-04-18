import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import path from "path";
import { directory as randomDirectory } from "tempy";

// We test the functions by importing them, but they use a hardcoded DAEMON_STATES_DIR.
// To isolate tests, we test the logic directly with a custom dir via the module internals.
// Since the module uses a fixed path, we'll test by writing/reading actual state files
// in the real states dir, then cleaning up.

// Import the actual functions
import {
    writeDaemonState,
    readAllDaemonStates,
    deleteDaemonState,
    getAliveDaemonStates,
    pruneStaleStates
} from "../../dist/common-utils/daemon-state.js";
import type { DaemonState } from "../../dist/common-utils/daemon-state.js";

// Use a PID range that definitely doesn't exist (very large PIDs)
const FAKE_PID_BASE = 9999900;
let fakePidCounter = 0;
const nextFakePid = () => FAKE_PID_BASE + ++fakePidCounter;

const makeState = (pid: number): DaemonState => ({
    pid,
    startedAt: new Date().toISOString(),
    argv: ["--pkcRpcUrl", `ws://localhost:${9000 + pid}`],
    pkcRpcUrl: `ws://localhost:${9000 + pid}`
});

describe("daemon-state", () => {
    const createdPids: number[] = [];

    afterEach(async () => {
        // Clean up any state files we created
        for (const pid of createdPids) {
            await deleteDaemonState(pid);
        }
        createdPids.length = 0;
    });

    describe("writeDaemonState + readAllDaemonStates", () => {
        it("should write and read a state file", async () => {
            const pid = nextFakePid();
            createdPids.push(pid);
            const state = makeState(pid);

            await writeDaemonState(state);
            const all = await readAllDaemonStates();

            const found = all.find((s) => s.pid === pid);
            expect(found).toBeDefined();
            expect(found!.argv).toEqual(state.argv);
            expect(found!.pkcRpcUrl).toBe(state.pkcRpcUrl);
        });

        it("should write multiple state files", async () => {
            const pid1 = nextFakePid();
            const pid2 = nextFakePid();
            createdPids.push(pid1, pid2);

            await writeDaemonState(makeState(pid1));
            await writeDaemonState(makeState(pid2));

            const all = await readAllDaemonStates();
            const pids = all.map((s) => s.pid);
            expect(pids).toContain(pid1);
            expect(pids).toContain(pid2);
        });
    });

    describe("deleteDaemonState", () => {
        it("should delete a state file", async () => {
            const pid = nextFakePid();
            createdPids.push(pid);

            await writeDaemonState(makeState(pid));
            await deleteDaemonState(pid);

            const all = await readAllDaemonStates();
            expect(all.find((s) => s.pid === pid)).toBeUndefined();
        });

        it("should not throw when deleting non-existent state", async () => {
            await expect(deleteDaemonState(nextFakePid())).resolves.not.toThrow();
        });
    });

    describe("getAliveDaemonStates", () => {
        it("should return only alive PIDs and delete stale files", async () => {
            const stalePid = nextFakePid();
            createdPids.push(stalePid);
            await writeDaemonState(makeState(stalePid));

            // stalePid doesn't exist as a process, so it should be pruned
            const alive = await getAliveDaemonStates();
            expect(alive.find((s) => s.pid === stalePid)).toBeUndefined();

            // The file should have been deleted from disk
            const all = await readAllDaemonStates();
            expect(all.find((s) => s.pid === stalePid)).toBeUndefined();
        });

        it("should return the current process PID as alive", async () => {
            const myPid = process.pid;
            createdPids.push(myPid);
            await writeDaemonState(makeState(myPid));

            const alive = await getAliveDaemonStates();
            expect(alive.find((s) => s.pid === myPid)).toBeDefined();
        });
    });

    describe("pruneStaleStates", () => {
        it("should remove state files for dead PIDs", async () => {
            const stalePid = nextFakePid();
            createdPids.push(stalePid);
            await writeDaemonState(makeState(stalePid));

            await pruneStaleStates();

            const all = await readAllDaemonStates();
            expect(all.find((s) => s.pid === stalePid)).toBeUndefined();
        });

        it("should keep state files for alive PIDs", async () => {
            const myPid = process.pid;
            createdPids.push(myPid);
            await writeDaemonState(makeState(myPid));

            await pruneStaleStates();

            const all = await readAllDaemonStates();
            expect(all.find((s) => s.pid === myPid)).toBeDefined();
        });
    });
});
