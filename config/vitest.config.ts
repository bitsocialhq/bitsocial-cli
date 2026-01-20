import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["test/**/*.test.ts"],
        testTimeout: 30000,
        hookTimeout: 30000,
        globals: false,
        pool: "forks", // Each test file runs in separate process to avoid ESM singleton cache contamination
        sequence: {
            concurrent: false
        },
        fileParallelism: false
    }
});
