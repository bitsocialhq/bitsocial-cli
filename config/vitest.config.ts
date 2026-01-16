import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["test/**/*.test.ts"],
        testTimeout: 30000,
        hookTimeout: 30000,
        globals: false,
        sequence: {
            concurrent: false
        },
        fileParallelism: false
    }
});
