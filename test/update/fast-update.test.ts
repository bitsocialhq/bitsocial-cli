import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

// Mock external dependencies before importing the module under test
vi.mock("../../src/challenge-packages/challenge-utils.js", () => ({
    runNpmPack: vi.fn(),
    ensureNpmAvailable: vi.fn().mockResolvedValue(undefined),
    getNpmCliPath: vi.fn().mockResolvedValue("/usr/bin/npm"),
    getNpmEnv: vi.fn().mockReturnValue(process.env)
}));

vi.mock("decompress", () => ({
    default: vi.fn()
}));

import { fastInstallGlobal } from "../../src/update/fast-update.js";
import { runNpmPack } from "../../src/challenge-packages/challenge-utils.js";
import decompress from "decompress";

const MOCK_OLD_PKG = {
    name: "@bitsocial/bitsocial-cli",
    version: "0.19.45",
    dependencies: { "dep-a": "1.0.0", "dep-b": "2.0.0" },
    webuis: [
        { url: "https://github.com/plebbit/seedit/releases/tag/v0.5.10", sha256OfHtmlZip: "aaa" },
        { url: "https://github.com/plebbit/plebones/releases/tag/v0.1.27", sha256OfHtmlZip: "bbb" }
    ]
};

const MOCK_NEW_PKG_SAME_DEPS = {
    ...MOCK_OLD_PKG,
    version: "0.19.46"
};

const MOCK_NEW_PKG_CHANGED_DEPS = {
    ...MOCK_OLD_PKG,
    version: "0.19.46",
    dependencies: { "dep-a": "1.0.0", "dep-b": "3.0.0" }
};

const MOCK_NEW_PKG_CHANGED_WEBUI = {
    ...MOCK_OLD_PKG,
    version: "0.19.46",
    webuis: [
        { url: "https://github.com/plebbit/seedit/releases/tag/v0.5.11", sha256OfHtmlZip: "ccc" },
        { url: "https://github.com/plebbit/plebones/releases/tag/v0.1.27", sha256OfHtmlZip: "bbb" }
    ]
};

describe("fastInstallGlobal", () => {
    let tmpDir: string;
    let installRoot: string;
    let logOutput: string[];
    const log = (msg: string) => logOutput.push(msg);

    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "fast-update-test-"));
        installRoot = path.join(tmpDir, "bitsocial-cli");
        logOutput = [];

        // Create a mock old install directory
        await fs.mkdir(installRoot, { recursive: true });
        await fs.mkdir(path.join(installRoot, "node_modules", "dep-a"), { recursive: true });
        await fs.writeFile(path.join(installRoot, "node_modules", "dep-a", "index.js"), "module.exports = {}");
        await fs.mkdir(path.join(installRoot, "dist", "webuis", "seedit-html-0.5.10"), { recursive: true });
        await fs.mkdir(path.join(installRoot, "dist", "webuis", "plebones-html-0.1.27"), { recursive: true });
        await fs.writeFile(
            path.join(installRoot, "dist", "webuis", "seedit-html-0.5.10", "index_backup_no_rpc.html"),
            "<html></html>"
        );
        await fs.writeFile(path.join(installRoot, "package.json"), JSON.stringify(MOCK_OLD_PKG));
        await fs.mkdir(path.join(installRoot, "bin"), { recursive: true });
        await fs.writeFile(path.join(installRoot, "bin", "run"), "#!/usr/bin/env node");
    });

    afterEach(async () => {
        vi.restoreAllMocks();
        await fs.rm(tmpDir, { recursive: true, force: true });
    });

    /** Helper: set up runNpmPack and decompress mocks to extract a new package.json */
    function setupMocks(newPkg: Record<string, unknown>) {
        vi.mocked(runNpmPack).mockImplementation(async (_spec: string, destDir: string) => {
            const tgzPath = path.join(destDir, "bitsocial-cli-0.19.46.tgz");
            await fs.writeFile(tgzPath, "fake-tarball");
            return tgzPath;
        });

        (vi.mocked(decompress) as any).mockImplementation(async (_input: any, output: any) => {
            // Simulate extracting the tarball — write package.json, bin/, dist/
            await fs.mkdir(path.join(output, "bin"), { recursive: true });
            await fs.mkdir(path.join(output, "dist"), { recursive: true });
            await fs.writeFile(path.join(output, "package.json"), JSON.stringify(newPkg));
            await fs.writeFile(path.join(output, "bin", "run"), "#!/usr/bin/env node");
            await fs.writeFile(path.join(output, "bin", "postinstall.js"), "// postinstall");
            return [];
        });
    }

    it("returns true and preserves node_modules + webuis when deps unchanged", async () => {
        setupMocks(MOCK_NEW_PKG_SAME_DEPS);

        const result = await fastInstallGlobal("0.19.46", installRoot, log);

        expect(result).toBe(true);
        // node_modules should still exist at installRoot
        const depIndex = await fs.readFile(
            path.join(installRoot, "node_modules", "dep-a", "index.js"),
            "utf-8"
        );
        expect(depIndex).toBe("module.exports = {}");
        // webuis should still exist
        const webuiHtml = await fs.readFile(
            path.join(installRoot, "dist", "webuis", "seedit-html-0.5.10", "index_backup_no_rpc.html"),
            "utf-8"
        );
        expect(webuiHtml).toBe("<html></html>");
        // new package.json should be in place
        const pkg = JSON.parse(await fs.readFile(path.join(installRoot, "package.json"), "utf-8"));
        expect(pkg.version).toBe("0.19.46");
        // staging and backup dirs should be gone
        await expect(fs.access(installRoot + ".__fast_update_staging")).rejects.toThrow();
        await expect(fs.access(installRoot + ".__fast_update_backup")).rejects.toThrow();
    });

    it("returns false when dependencies changed", async () => {
        setupMocks(MOCK_NEW_PKG_CHANGED_DEPS);

        const result = await fastInstallGlobal("0.19.46", installRoot, log);

        expect(result).toBe(false);
        expect(logOutput.some((m) => m.includes("Dependencies changed"))).toBe(true);
        // installRoot should be untouched
        const pkg = JSON.parse(await fs.readFile(path.join(installRoot, "package.json"), "utf-8"));
        expect(pkg.version).toBe("0.19.45");
        // node_modules should still be there
        await expect(fs.access(path.join(installRoot, "node_modules", "dep-a"))).resolves.toBeUndefined();
    });

    it("preserves unchanged webuis and marks changed ones for download when only some webuis changed", async () => {
        setupMocks(MOCK_NEW_PKG_CHANGED_WEBUI);

        // Mock fetch for the changed webui download — just let it fail gracefully
        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn().mockRejectedValue(new Error("network disabled in test"));

        try {
            const result = await fastInstallGlobal("0.19.46", installRoot, log);

            expect(result).toBe(true);
            // Unchanged webui (plebones) should still be present
            await expect(
                fs.access(path.join(installRoot, "dist", "webuis", "plebones-html-0.1.27"))
            ).resolves.toBeUndefined();
            // Changed webui (seedit) directory should have been removed (old version)
            await expect(
                fs.access(path.join(installRoot, "dist", "webuis", "seedit-html-0.5.10"))
            ).rejects.toThrow();
            // Download warning should be logged (we mocked fetch to fail)
            expect(logOutput.some((m) => m.includes("Downloading 1 changed web UI"))).toBe(true);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it("cleans up leftover staging dir from interrupted previous update", async () => {
        const stagingDir = installRoot + ".__fast_update_staging";
        await fs.mkdir(stagingDir, { recursive: true });
        await fs.writeFile(path.join(stagingDir, "leftover"), "stale");

        setupMocks(MOCK_NEW_PKG_SAME_DEPS);
        const result = await fastInstallGlobal("0.19.46", installRoot, log);

        expect(result).toBe(true);
        await expect(fs.access(stagingDir)).rejects.toThrow();
    });

    it("cleans up leftover backup dir from interrupted previous update", async () => {
        const backupDir = installRoot + ".__fast_update_backup";
        await fs.mkdir(backupDir, { recursive: true });
        await fs.writeFile(path.join(backupDir, "leftover"), "stale");

        setupMocks(MOCK_NEW_PKG_SAME_DEPS);
        const result = await fastInstallGlobal("0.19.46", installRoot, log);

        expect(result).toBe(true);
        await expect(fs.access(backupDir)).rejects.toThrow();
    });

    it("returns false and restores node_modules when swap fails after node_modules move", async () => {
        setupMocks(MOCK_NEW_PKG_SAME_DEPS);

        // Make the decompress mock also write a package.json that will match deps,
        // but make the installRoot un-renamable after node_modules moves.
        // We'll achieve this by removing write permission from parent dir AFTER node_modules moves.
        // Instead, let's use a simpler approach: mock decompress to not create dist/ dir,
        // which will cause the webuis rename to fail in a way that tests rollback.

        // Actually, let's directly test: after the mocks set up a valid staging dir,
        // make fs.rename fail for the atomic swap by making installRoot a read-only parent.
        const originalRename = fs.rename;
        let renameCallCount = 0;
        vi.spyOn(fs, "rename").mockImplementation(async (oldPath, newPath) => {
            renameCallCount++;
            // First rename: node_modules old -> staging (allow)
            // Second rename: webuis old -> staging (allow)
            // Third rename: installRoot -> backup (fail to test rollback)
            if (renameCallCount === 3) {
                throw new Error("simulated rename failure");
            }
            return originalRename(oldPath as string, newPath as string);
        });

        const result = await fastInstallGlobal("0.19.46", installRoot, log);

        expect(result).toBe(false);
        // node_modules should be restored to installRoot
        await expect(
            fs.access(path.join(installRoot, "node_modules", "dep-a"))
        ).resolves.toBeUndefined();
    });

    it("returns false when runNpmPack fails", async () => {
        vi.mocked(runNpmPack).mockRejectedValue(new Error("npm pack failed"));

        const result = await fastInstallGlobal("0.19.46", installRoot, log);

        expect(result).toBe(false);
        expect(logOutput.some((m) => m.includes("npm pack failed"))).toBe(true);
        // staging dir should be cleaned up
        await expect(fs.access(installRoot + ".__fast_update_staging")).rejects.toThrow();
        // installRoot should be untouched
        const pkg = JSON.parse(await fs.readFile(path.join(installRoot, "package.json"), "utf-8"));
        expect(pkg.version).toBe("0.19.45");
    });
});
