import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import EventEmitter from "events";

vi.mock("@pkcprotocol/pkc-js", () => ({
    default: vi.fn()
}));

vi.mock("tcp-port-used", () => ({
    default: {
        waitUntilFree: vi.fn().mockResolvedValue(undefined),
        waitUntilUsed: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock("child_process", async () => {
    const actual = await vi.importActual<typeof import("child_process")>("child_process");
    return {
        ...actual,
        spawn: vi.fn(() => ({ pid: 99999, unref: vi.fn() }))
    };
});

vi.mock("../../src/common-utils/daemon-state.js", () => ({
    getAliveDaemonStates: vi.fn().mockResolvedValue([])
}));

vi.mock("../../src/update/npm-registry.js", () => ({
    fetchLatestVersion: vi.fn().mockResolvedValue("99.99.99"),
    installGlobal: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("../../src/update/semver.js", () => ({
    compareVersions: vi.fn().mockReturnValue(-1)
}));

describe("update install — community status reporting", () => {
    let logOutput: string[];
    let warnOutput: string[];

    beforeEach(() => {
        logOutput = [];
        warnOutput = [];
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    async function createInstallCommand() {
        const mod = await import("../../src/cli/commands/update/install.js");
        const Install = mod.default;
        const cmd = new Install([], { version: "0.0.1" } as any);
        cmd.log = (...args: any[]) => logOutput.push(args.join(" "));
        cmd.warn = (...args: any[]) => warnOutput.push(args.join(" "));
        cmd.parse = vi.fn().mockResolvedValue({
            args: { version: "latest" },
            flags: { force: false, "restart-daemons": true }
        });
        cmd.error = vi.fn((msg: string) => {
            throw new Error(msg);
        }) as any;
        return cmd;
    }

    it("prints started count when all communities are started", async () => {
        const { getAliveDaemonStates } = await import("../../src/common-utils/daemon-state.js");
        vi.mocked(getAliveDaemonStates).mockResolvedValue([
            { pid: 12345, startedAt: "2026-01-01", argv: [], pkcRpcUrl: "ws://localhost:39123" }
        ]);

        const { default: PKCMock } = await import("@pkcprotocol/pkc-js");
        const fakePkc = Object.assign(new EventEmitter(), {
            communities: ["community1.bso", "community2.bso"],
            createCommunity: vi.fn().mockResolvedValue({ started: true }),
            destroy: vi.fn().mockResolvedValue(undefined)
        });
        vi.mocked(PKCMock).mockImplementation(async () => {
            // Auto-emit communitieschange after a tick
            setTimeout(() => fakePkc.emit("communitieschange"), 0);
            return fakePkc as any;
        });

        const cmd = await createInstallCommand();
        await cmd.run();

        const joined = logOutput.join("\n");
        expect(joined).toContain("2 communities started");
    });

    it("prints partial count when some communities are still loading", async () => {
        const { getAliveDaemonStates } = await import("../../src/common-utils/daemon-state.js");
        vi.mocked(getAliveDaemonStates).mockResolvedValue([
            { pid: 12345, startedAt: "2026-01-01", argv: [], pkcRpcUrl: "ws://localhost:39123" }
        ]);

        const { default: PKCMock } = await import("@pkcprotocol/pkc-js");
        let callCount = 0;
        const fakePkc = Object.assign(new EventEmitter(), {
            communities: ["community1.bso", "community2.bso", "community3.bso"],
            createCommunity: vi.fn().mockImplementation(async () => {
                callCount++;
                return { started: callCount <= 1 };
            }),
            destroy: vi.fn().mockResolvedValue(undefined)
        });
        vi.mocked(PKCMock).mockImplementation(async () => {
            setTimeout(() => fakePkc.emit("communitieschange"), 0);
            return fakePkc as any;
        });

        const cmd = await createInstallCommand();
        await cmd.run();

        const joined = logOutput.join("\n");
        expect(joined).toContain("1 of 3 communities started (remaining still loading)");
    });

    it("prints still loading message when no communities are started yet", async () => {
        const { getAliveDaemonStates } = await import("../../src/common-utils/daemon-state.js");
        vi.mocked(getAliveDaemonStates).mockResolvedValue([
            { pid: 12345, startedAt: "2026-01-01", argv: [], pkcRpcUrl: "ws://localhost:39123" }
        ]);

        const { default: PKCMock } = await import("@pkcprotocol/pkc-js");
        const fakePkc = Object.assign(new EventEmitter(), {
            communities: ["community1.bso", "community2.bso"],
            createCommunity: vi.fn().mockResolvedValue({ started: false }),
            destroy: vi.fn().mockResolvedValue(undefined)
        });
        vi.mocked(PKCMock).mockImplementation(async () => {
            setTimeout(() => fakePkc.emit("communitieschange"), 0);
            return fakePkc as any;
        });

        const cmd = await createInstallCommand();
        await cmd.run();

        const joined = logOutput.join("\n");
        expect(joined).toContain("2 communities in data path (still loading)");
        expect(joined).toContain("bitsocial community list");
    });

    it("prints nothing when there are no communities", async () => {
        const { getAliveDaemonStates } = await import("../../src/common-utils/daemon-state.js");
        vi.mocked(getAliveDaemonStates).mockResolvedValue([
            { pid: 12345, startedAt: "2026-01-01", argv: [], pkcRpcUrl: "ws://localhost:39123" }
        ]);

        const { default: PKCMock } = await import("@pkcprotocol/pkc-js");
        const fakePkc = Object.assign(new EventEmitter(), {
            communities: [],
            createCommunity: vi.fn(),
            destroy: vi.fn().mockResolvedValue(undefined)
        });
        vi.mocked(PKCMock).mockImplementation(async () => {
            setTimeout(() => fakePkc.emit("communitieschange"), 0);
            return fakePkc as any;
        });

        const cmd = await createInstallCommand();
        await cmd.run();

        const joined = logOutput.join("\n");
        expect(joined).not.toContain("communities");
        expect(joined).not.toContain("community");
    });

    it("warns but does not crash when RPC connection fails", async () => {
        const { getAliveDaemonStates } = await import("../../src/common-utils/daemon-state.js");
        vi.mocked(getAliveDaemonStates).mockResolvedValue([
            { pid: 12345, startedAt: "2026-01-01", argv: [], pkcRpcUrl: "ws://localhost:39123" }
        ]);

        const { default: PKCMock } = await import("@pkcprotocol/pkc-js");
        vi.mocked(PKCMock).mockRejectedValue(new Error("Connection refused"));

        const cmd = await createInstallCommand();
        // Should not throw
        await cmd.run();

        const joinedWarns = warnOutput.join("\n");
        expect(joinedWarns).toContain("Could not check community status");
    });

    it("prints singular 'community' for a single community", async () => {
        const { getAliveDaemonStates } = await import("../../src/common-utils/daemon-state.js");
        vi.mocked(getAliveDaemonStates).mockResolvedValue([
            { pid: 12345, startedAt: "2026-01-01", argv: [], pkcRpcUrl: "ws://localhost:39123" }
        ]);

        const { default: PKCMock } = await import("@pkcprotocol/pkc-js");
        const fakePkc = Object.assign(new EventEmitter(), {
            communities: ["community1.bso"],
            createCommunity: vi.fn().mockResolvedValue({ started: true }),
            destroy: vi.fn().mockResolvedValue(undefined)
        });
        vi.mocked(PKCMock).mockImplementation(async () => {
            setTimeout(() => fakePkc.emit("communitieschange"), 0);
            return fakePkc as any;
        });

        const cmd = await createInstallCommand();
        await cmd.run();

        const joined = logOutput.join("\n");
        expect(joined).toContain("1 community started");
        expect(joined).not.toContain("communities started");
    });
});
