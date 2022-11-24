import { expect, test } from "@oclif/test";
import { exitStatuses } from "../../dist/src/cli/exit-codes.js";
import defaults from "../../dist/src/common-utils/defaults.js";

describe("plebbit subplebbit list", () => {
    const subList = [
        { address: "plebbit.eth", started: false },
        { address: "plebbit2.eth", started: false }
    ];
    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) => api.post("/subplebbit/list").reply(200, subList).persist())
        .loadConfig({ root: process.cwd() })
        .stdout()
        .command(["subplebbit list", "-q"])
        .it(`-q Outputs only subplebbit addresses`, (ctx) => {
            const trimmedOutput: string[] = ctx.stdout.trim().split("\n");
            expect(trimmedOutput).to.deep.equal(subList.map((sub) => sub.address));
            expect(ctx.error).to.be.undefined;
        });

    test.loadConfig({ root: process.cwd() })
        .nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
            api.post("/subplebbit/list").replyWithError("Any error would suffice here")
        )
        .command(["subplebbit list"])
        .exit(exitStatuses.ERR_DAEMON_IS_DOWN)
        .it(`Fails when daemon is down`);

    test.loadConfig({ root: process.cwd() })
        .nock(`http://localhost:${defaults.PLEBBIT_API_PORT + 1}/api/v0`, (api) =>
            api.post("/subplebbit/list").reply(200, subList).persist()
        )
        .stdout()
        .command(["subplebbit list", "-q", `--apiUrl=http://localhost:${defaults.PLEBBIT_API_PORT + 1}/api/v0`])
        .it("--apiUrl is parsed correctly", (ctx) => {
            const trimmedOutput: string[] = ctx.stdout.trim().split("\n");
            expect(trimmedOutput).to.deep.equal(subList.map((sub) => sub.address));
            expect(ctx.error).to.be.undefined;
        });
});
