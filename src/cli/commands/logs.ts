import { Flags, Command } from "@oclif/core";
import defaults from "../../common-utils/defaults.js";
import fs from "fs";
import fsPromise from "fs/promises";
import path from "path";

interface LogEntry {
    timestamp: Date | null;
    lines: string[];
}

export default class Logs extends Command {
    static override description =
        "View the latest BitSocial daemon log file. By default dumps the full log and exits. Use --follow to stream new output in real-time (like tail -f).";

    static override flags = {
        follow: Flags.boolean({
            char: "f",
            description: "Follow log output in real-time (like tail -f)",
            default: false
        }),
        tail: Flags.string({
            char: "n",
            description: 'Number of log entries to show from the end. Use "all" to show everything.',
            default: "all"
        }),
        since: Flags.string({
            description:
                "Show logs since timestamp (ISO 8601, e.g. 2026-01-02T13:23:37Z) or relative time (e.g. 30s, 42m, 2h, 1d)",
            required: false
        }),
        until: Flags.string({
            description:
                "Show logs before timestamp (ISO 8601, e.g. 2026-01-02T13:23:37Z) or relative time (e.g. 30s, 42m, 2h, 1d)",
            required: false
        })
    };

    static override examples = [
        "bitsocial logs",
        "bitsocial logs -f",
        "bitsocial logs -n 50",
        "bitsocial logs --since 5m",
        "bitsocial logs --since 2026-01-02T13:23:37Z --until 2026-01-02T14:00:00Z",
        "bitsocial logs --since 1h -f"
    ];

    private async _findLatestLogFile(logPath: string): Promise<string> {
        let entries: fs.Dirent[];
        try {
            entries = await fsPromise.readdir(logPath, { withFileTypes: true });
        } catch {
            this.error(`Log directory does not exist: ${logPath}\nHave you started the daemon yet?`);
        }

        const logFiles = entries
            .filter((entry) => entry.isFile() && entry.name.startsWith("bitsocial_cli_daemon_") && entry.name.endsWith(".log"))
            .map((entry) => entry.name)
            .sort();

        if (logFiles.length === 0) {
            this.error(`No log files found in ${logPath}\nHave you started the daemon yet?`);
        }

        return path.join(logPath, logFiles[logFiles.length - 1]);
    }

    _parseTimestamp(value: string): Date {
        // Try relative duration first: 30s, 42m, 2h, 1d
        const relativeMatch = value.match(/^(\d+)([smhd])$/);
        if (relativeMatch) {
            const amount = parseInt(relativeMatch[1], 10);
            const unit = relativeMatch[2];
            const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
            return new Date(Date.now() - amount * multipliers[unit]);
        }

        // Try ISO timestamp
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            this.error(
                `Invalid timestamp: "${value}". Use ISO 8601 format (e.g. 2026-01-02T13:23:37Z) or relative time (e.g. 30s, 42m, 2h, 1d)`
            );
        }
        return date;
    }

    _extractTimestamp(line: string): Date | null {
        const match = line.match(/^\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\] /);
        if (!match) return null;
        return new Date(match[1]);
    }

    _parseLogEntries(content: string): LogEntry[] {
        const lines = content.split("\n");
        const entries: LogEntry[] = [];

        for (const line of lines) {
            const timestamp = this._extractTimestamp(line);
            if (timestamp !== null) {
                // New timestamped entry
                entries.push({ timestamp, lines: [line] });
            } else if (entries.length > 0) {
                // Continuation line — belongs to the previous entry
                entries[entries.length - 1].lines.push(line);
            } else {
                // Line before any timestamped entry (legacy/header)
                entries.push({ timestamp: null, lines: [line] });
            }
        }

        return entries;
    }

    _filterEntries(entries: LogEntry[], since?: Date, until?: Date): LogEntry[] {
        return entries.filter((entry) => {
            if (entry.timestamp === null) {
                // Legacy entries with no timestamp: exclude if --since is set, include otherwise
                return !since;
            }
            if (since && entry.timestamp < since) return false;
            if (until && entry.timestamp > until) return false;
            return true;
        });
    }

    _tailEntries(entries: LogEntry[], tailValue: string): LogEntry[] {
        if (tailValue === "all") return entries;
        const n = parseInt(tailValue, 10);
        if (isNaN(n) || n < 0) {
            this.error(`Invalid --tail value: "${tailValue}". Must be a non-negative integer or "all".`);
        }
        if (n === 0) return [];
        return entries.slice(-n);
    }

    async run() {
        const { flags } = await this.parse(Logs);
        const logPath = defaults.PLEBBIT_LOG_PATH;
        const latestLogFile = await this._findLatestLogFile(logPath);

        const since = flags.since ? this._parseTimestamp(flags.since) : undefined;
        const until = flags.until ? this._parseTimestamp(flags.until) : undefined;

        if (!flags.follow) {
            const content = await fsPromise.readFile(latestLogFile, "utf-8");
            const entries = this._parseLogEntries(content);
            const filtered = this._filterEntries(entries, since, until);
            const tailed = this._tailEntries(filtered, flags.tail);
            const output = tailed.map((e) => e.lines.join("\n")).join("\n");
            if (output) process.stdout.write(output + "\n");
            return;
        }

        // Follow mode: dump existing content (filtered + tailed) then watch for new data
        const existingContent = await fsPromise.readFile(latestLogFile, "utf-8");
        const entries = this._parseLogEntries(existingContent);
        const filtered = this._filterEntries(entries, since, until);
        const tailed = this._tailEntries(filtered, flags.tail);
        const initialOutput = tailed.map((e) => e.lines.join("\n")).join("\n");
        if (initialOutput) process.stdout.write(initialOutput + "\n");

        const stat = await fsPromise.stat(latestLogFile);
        let position = stat.size;
        let pendingBuffer = "";

        // Watch for new data using polling (works across filesystems including Docker volumes)
        const readNewData = async () => {
            try {
                const currentStat = await fsPromise.stat(latestLogFile);
                if (currentStat.size > position) {
                    const fd = await fsPromise.open(latestLogFile, "r");
                    const buf = new Uint8Array(currentStat.size - position);
                    const { bytesRead } = await fd.read(buf, 0, buf.length, position);
                    await fd.close();
                    position += bytesRead;

                    const chunk = pendingBuffer + new TextDecoder().decode(buf.subarray(0, bytesRead));
                    // Split into complete lines; keep any incomplete trailing line in the buffer
                    const lastNewline = chunk.lastIndexOf("\n");
                    if (lastNewline === -1) {
                        pendingBuffer = chunk;
                        return;
                    }
                    pendingBuffer = chunk.slice(lastNewline + 1);
                    const completeText = chunk.slice(0, lastNewline + 1);

                    if (!since && !until) {
                        // No time filtering — pass through directly
                        process.stdout.write(completeText);
                    } else {
                        const newEntries = this._parseLogEntries(completeText.replace(/\n$/, ""));
                        const filteredNew = this._filterEntries(newEntries, since, until);
                        const output = filteredNew.map((e) => e.lines.join("\n")).join("\n");
                        if (output) process.stdout.write(output + "\n");
                    }
                }
            } catch {
                // File may have been rotated or deleted
            }
        };

        fs.watchFile(latestLogFile, { interval: 300 }, readNewData);

        // Keep the process alive and clean up on exit
        process.on("SIGINT", () => {
            fs.unwatchFile(latestLogFile, readNewData);
            process.exit(0);
        });
        process.on("SIGTERM", () => {
            fs.unwatchFile(latestLogFile, readNewData);
            process.exit(0);
        });

        // Keep process alive
        await new Promise(() => {});
    }
}
