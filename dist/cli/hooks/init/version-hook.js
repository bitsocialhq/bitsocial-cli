import { createRequire } from "module";
import { readFileSync } from "fs";
import { dirname, join } from "path";
// Get plebbit-js version from its package.json
const getPlebbitJsVersion = () => {
    const require = createRequire(import.meta.url);
    // Get path to plebbit-js module
    const plebbitJsPath = require.resolve("@plebbit/plebbit-js");
    // Navigate to package root (plebbit-js main export is dist/node/index.js)
    const plebbitJsRoot = dirname(dirname(dirname(plebbitJsPath)));
    const plebbitPkgPath = join(plebbitJsRoot, "package.json");
    const plebbitPkg = JSON.parse(readFileSync(plebbitPkgPath, "utf-8"));
    return plebbitPkg.version;
};
// Get commit hash from CLI's package.json dependency URL
const getPlebbitJsCommit = (cliRoot) => {
    try {
        const cliPkgPath = join(cliRoot, "package.json");
        const cliPkg = JSON.parse(readFileSync(cliPkgPath, "utf-8"));
        const plebbitJsDep = cliPkg.dependencies["@plebbit/plebbit-js"];
        // Extract commit hash from URL like "https://github.com/plebbit/plebbit-js#a21d896bd55c76070758dae65dc0693d1c3726db"
        const match = plebbitJsDep?.match(/#([a-f0-9]+)$/);
        return match ? match[1].substring(0, 7) : undefined;
    }
    catch {
        return undefined;
    }
};
const hook = async function (opts) {
    // Check process.argv because oclif normalizes argv and --version becomes the id, not part of argv
    if (process.argv.includes("--version")) {
        const { config } = opts;
        const plebbitJsVersion = getPlebbitJsVersion();
        const commit = getPlebbitJsCommit(config.root);
        const commitStr = commit ? ` (${commit})` : "";
        // Output CLI version on first line, plebbit-js version + commit on second line
        this.log(`${config.name}/${config.version} ${config.platform}-${config.arch} node-${process.version}`);
        this.log(`plebbit-js/${plebbitJsVersion}${commitStr}`);
        // Use process.exit to actually stop - this.exit(0) throws an error that gets caught by oclif
        process.exit(0);
    }
};
export default hook;
