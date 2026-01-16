import { runCommand } from "@oclif/test";
import { format } from "node:util";

type RunCliResult<T> = {
    result: Awaited<ReturnType<typeof runCommand<T>>>;
    stdout: string;
    stderr: string;
};

export const runCliCommand = async <T>(
    args: string | string[],
    cwd = process.cwd(),
    stripAnsi = true
): Promise<RunCliResult<T>> => {
    const stdoutChunks: string[] = [];
    const stderrChunks: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...logArgs: unknown[]) => {
        stdoutChunks.push(format(...logArgs));
    };
    console.error = (...logArgs: unknown[]) => {
        stderrChunks.push(format(...logArgs));
    };

    try {
        const result = await runCommand<T>(args, cwd, { stripAnsi });
        return {
            result,
            stdout: stdoutChunks.join("\n"),
            stderr: stderrChunks.join("\n")
        };
    } finally {
        console.log = originalLog;
        console.error = originalError;
    }
};
