// This file is to test subplebbit commands like `plebbit subplebbit list` or `plebbit subplebbit start`
import { exec } from "node:child_process";
import { expect } from "chai";

import fetch from "node-fetch";
import { SubplebbitList } from "../../src/types.js";
import { CreateSubplebbitOptions, SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";

if (typeof process.env["PLEBBIT_API_PORT"] !== "string") throw Error("You need to set all env variables PLEBBIT_API_PORT");

const execCliCommand = async (args: string[]): Promise<string> => {
    return new Promise(async (resolve) => {
        const plebbitApiUrl = `http://localhost:${process.env["PLEBBIT_API_PORT"]}/api/v0`;
        const cmd = `node . --plebbit-api-url '${plebbitApiUrl}' ${args.join(" ")}`;
        console.log(`Executing command '${cmd}'`);

        exec(cmd, (error, stdout, stderr) => {
            console.log(`error: ${error}\nstdout: ${stdout}\nstderr: ${stderr}`);
            if (error) throw error;
            if (!stderr.includes("Debugger attached")) throw Error(stderr);
            resolve(stdout);
        });
    });
};

describe("plebbit subplebbit create", async () => {
    it(`Can create a new subplebbit from cli json argument`, async () => {
        const options: CreateSubplebbitOptions = {
            title: `Test subplebbit create ${Date.now()}`,
            description: "Test subplebbit description " + Date.now(),
            suggested: { primaryColor: "#0000" }
        };

        // Command in CLI would be something like this
        const createOutput = await execCliCommand([
            "subplebbit",
            "create",
            `--title "${options.title}"`,
            `--description "${options.description}"`,
            `--suggested.primaryColor "${options.suggested?.primaryColor}"`
        ]);
        const subAfterCreate: SubplebbitType = JSON.parse(createOutput);
        expect(subAfterCreate.title).to.equal(options.title);
        expect(subAfterCreate.description).to.equal(options.description);
        expect(subAfterCreate.address).to.be.a.string;
        expect(subAfterCreate.encryption).to.be.an("object");
        expect(subAfterCreate.suggested?.primaryColor).to.equal(options.suggested?.primaryColor);
    });
    it(`Can create new sub from json file`, async () => {});
    it(`Can retrieve an already existing subplebbit with plebbit subplebbit create --address`);
});

    });
    it(`Can create new sub from json file`);
    it(`Can retrieve an already existing subplebbit with plebbit subplebbit create '{address}'`);
});
