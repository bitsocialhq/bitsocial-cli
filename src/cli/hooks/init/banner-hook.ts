import { Hook } from "@oclif/core";
import { printBanner } from "../../ascii-banner.js";

const hook: Hook<"init"> = async function (opts) {
    // Skip when --version is being handled by version-hook
    if (process.argv.includes("--version")) return;

    // Show banner on bare `bitsocial` invocation (no command, no help flag).
    // oclif sets opts.id to undefined when no command is matched; argv length > 2
    // means the user passed flags/args and expects normal command output.
    const bareInvocation = process.argv.length <= 2;
    const helpInvocation = !opts.id && (process.argv.includes("--help") || process.argv.includes("-h") || process.argv.includes("help"));

    if (bareInvocation || helpInvocation) {
        printBanner();
    }
};

export default hook;
