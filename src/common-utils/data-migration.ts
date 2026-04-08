import fs from "fs";
import path from "path";
import envPaths from "env-paths";

export function migrateDataDirectory(dataPath: string): void {
    const defaultNewPath = envPaths("bitsocial", { suffix: "" }).data;
    const defaultOldPath = envPaths("plebbit", { suffix: "" }).data;

    // Step 1: Migrate old default dir (envPaths("plebbit")) → new default (envPaths("bitsocial"))
    if (dataPath === defaultNewPath && fs.existsSync(defaultOldPath)) {
        if (!fs.existsSync(defaultNewPath)) {
            fs.renameSync(defaultOldPath, defaultNewPath);
            console.log(`Migrated data directory: ${defaultOldPath} → ${defaultNewPath}`);
        } else {
            console.warn(`Both ${defaultOldPath} and ${defaultNewPath} exist. Using ${defaultNewPath}.`);
        }
    }

    // Step 2: Migrate subplebbits/ → communities/ inside data directory
    const oldSubDir = path.join(dataPath, "subplebbits");
    const newSubDir = path.join(dataPath, "communities");
    if (fs.existsSync(oldSubDir) && !fs.existsSync(newSubDir)) {
        fs.renameSync(oldSubDir, newSubDir);
        console.log(`Migrated ${oldSubDir} → ${newSubDir}`);
    } else if (fs.existsSync(oldSubDir) && fs.existsSync(newSubDir)) {
        console.warn(`Both ${oldSubDir} and ${newSubDir} exist. Using ${newSubDir}.`);
    }
}
