import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import EventEmitter from "events";

vi.mock("@plebbit/plebbit-js", () => {
    return {
        default: vi.fn()
    };
});

// Also mock the logger so BaseCommand.init() doesn't fail
vi.mock("../../src/util.js", () => {
    return {
        getPlebbitLogger: vi.fn().mockResolvedValue(() => () => {}),
        setupDebugLogger: vi.fn()
    };
});

describe("RPC connection timeout", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("should throw if subplebbitschange is not emitted within 20s", async () => {
        const { default: PlebbitMock } = await import("@plebbit/plebbit-js");
        const fakePlebbit = new EventEmitter();
        vi.mocked(PlebbitMock).mockResolvedValue(fakePlebbit as any);

        const { BaseCommand } = await import("../../src/cli/base-command.js");
        class TestCommand extends BaseCommand {
            async run() {}
            connectToPlebbitRpc(url: string) {
                return this._connectToPlebbitRpc(url);
            }
        }
        const cmd = new TestCommand([], {} as any);

        const connectPromise = cmd.connectToPlebbitRpc("ws://localhost:9138/wrong-auth");
        // Prevent unhandled rejection warning — we assert on the error below
        let caughtError: Error | undefined;
        connectPromise.catch((err) => {
            caughtError = err;
        });

        await vi.advanceTimersByTimeAsync(20000);

        expect(caughtError).toBeDefined();
        expect(caughtError!.message).toMatch(/Timed out waiting for RPC server/);
    });

    it("should reject with the last plebbit error if one was emitted before timeout", async () => {
        const { default: PlebbitMock } = await import("@plebbit/plebbit-js");
        const fakePlebbit = new EventEmitter();
        vi.mocked(PlebbitMock).mockResolvedValue(fakePlebbit as any);

        const { BaseCommand } = await import("../../src/cli/base-command.js");
        class TestCommand extends BaseCommand {
            async run() {}
            connectToPlebbitRpc(url: string) {
                return this._connectToPlebbitRpc(url);
            }
        }
        const cmd = new TestCommand([], {} as any);

        const connectPromise = cmd.connectToPlebbitRpc("ws://localhost:9138/wrong-auth");
        let caughtError: Error | undefined;
        connectPromise.catch((err) => {
            caughtError = err;
        });

        // Wait a tick so the Plebbit() promise resolves and the error listener is registered
        await vi.advanceTimersByTimeAsync(0);

        // Simulate plebbit emitting an auth error
        const authError = new Error("RPC server rejected the connection. The auth key is either missing or wrong.");
        Object.assign(authError, { code: "ERR_RPC_AUTH_REQUIRED" });
        fakePlebbit.emit("error", authError);

        await vi.advanceTimersByTimeAsync(20000);

        expect(caughtError).toBeDefined();
        expect(caughtError!.message).toMatch(/auth key is either missing or wrong/);
    });
});
