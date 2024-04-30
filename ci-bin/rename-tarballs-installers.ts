import fs from "fs/promises";
import path from "path";

(async () => {
    // Rename tarball and windows installers to be ready for CI upload
    const distDirectory = path.join(process.cwd(), "dist");

    let tarballFilenames: string[];
    try {
        tarballFilenames = await fs.readdir(distDirectory);
    } catch (e) {
        console.error("Failed to log tarball files, error", e);
        tarballFilenames = [];
    }

    for (const tarballFilename of tarballFilenames) {
        if (!tarballFilename.endsWith(".tar.gz")) continue;
        const splits = tarballFilename.split("-");
        const oldTarballPath = path.join(distDirectory, tarballFilename);
        const newTarbellPath = `plebbit_${splits[3]}-${splits[4]}`;
        await fs.rename(oldTarballPath, newTarbellPath);
        console.log(`Renamed ${oldTarballPath} to ${newTarbellPath}`);
    }

    // Rename windows installer files here
    const windowsInstallerDir = path.join(distDirectory, "win32");

    let winInstallerFilenames: string[];
    try {
        winInstallerFilenames = await fs.readdir(windowsInstallerDir);
    } catch (e) {
        console.error("Failed to log windows install files files, error", e);
        winInstallerFilenames = [];
    }
    for (const winInstallerFilename of winInstallerFilenames) {
        if (!winInstallerFilename.endsWith(".exe")) continue;
        const splits = winInstallerFilename.split("-");
        const oldWinInstallerPath = path.join(windowsInstallerDir, winInstallerFilename);
        const newWinInstallerPath = `plebbit_installer_win32_${splits[3]}`;
        await fs.rename(oldWinInstallerPath, newWinInstallerPath);
        console.log(`Renamed ${oldWinInstallerPath} to ${newWinInstallerPath}`);
    }
})();
