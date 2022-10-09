import fetch from "node-fetch";
import { expect } from "chai";
import { statusCodes, statusMessages } from "../../src/api/responseStatuses.js";
import { CreateSubplebbitOptions, SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import { SubplebbitList } from "../../src/types.js";
import Plebbit from "@plebbit/plebbit-js";

if (
    typeof process.env["PLEBBIT_API_PORT"] !== "string" ||
    typeof process.env["IPFS_PUBSUB_PORT"] !== "string" ||
    typeof process.env["IPFS_PORT"] !== "string"
)
    throw Error("You need to set all env variables PLEBBIT_API_PORT, IPFS_PUBSUB_PORT, IPFS_PORT");

const baseUrl = `http://localhost:${process.env["PLEBBIT_API_PORT"]}/api/v0/subplebbit`;

describe("/api/v0/subplebbit/create", async () => {
    const createUrl = `${baseUrl}/create`;
    let createdSubplebbit: SubplebbitType;
    it("Request fails with documented error if invalid json was provided", async () => {
        const invalidJson: string = JSON.stringify({ test: "zz" }).slice(1); // Delete first character, should make the string unparsable
        const res = await fetch(createUrl, { method: "POST", body: invalidJson, headers: { "content-type": "application/json" } });
        expect(res.status).to.equal(statusCodes.ERR_INVALID_JSON_FOR_REQUEST_BODY);
        expect(res.statusText).to.equal(statusMessages.ERR_INVALID_JSON_FOR_REQUEST_BODY);
    });

    it(`Can create a new subplebbit successfully`, async () => {
        const subProps: CreateSubplebbitOptions = {
            title: "Memes" + Date.now(),
            description: "Post your memes here."
        };
        const res = await fetch(createUrl, {
            method: "POST",
            body: JSON.stringify(subProps),
            headers: { "content-type": "application/json" }
        });
        expect(res.status).to.equal(statusCodes.SUCCESS_SUBPLEBBIT_CREATED);
        expect(res.statusText).to.equal(statusMessages.SUCCESS_SUBPLEBBIT_CREATED);
        createdSubplebbit = <SubplebbitType>await res.json();
        expect(createdSubplebbit.address).to.be.a.string;
        expect(createdSubplebbit.createdAt).to.be.a("number");
        expect(createdSubplebbit.description).to.equal(subProps.description);
        expect(createdSubplebbit.encryption).to.include.all.keys(["type", "publicKey"]);
        expect(createdSubplebbit.pubsubTopic).to.be.equal(createdSubplebbit.address);
        expect(createdSubplebbit.title).to.equal(subProps.title);
    });

    it(`Can retrieve a subplebbit instance with only {address}`, async () => {
        const subProps: CreateSubplebbitOptions = {
            address: createdSubplebbit.address
        };
        const res = await fetch(createUrl, {
            method: "POST",
            body: JSON.stringify(subProps),
            headers: { "content-type": "application/json" }
        });
        expect(res.status).to.equal(statusCodes.SUCCESS_SUBPLEBBIT_CREATED);
        const retrievedSubplebbit: SubplebbitType = <SubplebbitType>await res.json();

        expect(retrievedSubplebbit).to.deep.equal(createdSubplebbit);
    });
});

describe(`/api/v0/subplebbit/{start, stop}`, async () => {
    let startedSubplebbit: SubplebbitType;
    before(async () => {
        startedSubplebbit = <SubplebbitType>await (
            await fetch(`${baseUrl}/create`, {
                method: "POST",
                body: JSON.stringify({ title: "test" + Date.now() }),
                headers: { "content-type": "application/json" }
            })
        ).json();
    });
    it(`A started subplebbit can receive challenges`, async () => {
        return new Promise(async (resolve) => {
            const startRes = await fetch(`${baseUrl}/start?address=${startedSubplebbit.address}`, { method: "POST" });
            expect(startRes.status).to.equal(statusCodes.SUCCESS_SUBPLEBBIT_STARTED);
            expect(startRes.statusText).to.equal(statusMessages.SUCCESS_SUBPLEBBIT_STARTED);

            const plebbit = await Plebbit({
                ipfsHttpClientOptions: `http://localhost:${process.env["IPFS_PORT"]}/api/v0`,
                pubsubHttpClientOptions: `http://localhost:${process.env["IPFS_PUBSUB_PORT"]}/api/v0`
            });

            const mockPost = await plebbit.createComment({
                subplebbitAddress: startedSubplebbit.address,
                title: "test" + Date.now(),
                signer: await plebbit.createSigner()
            });

            await mockPost.publish({});

            mockPost.once("challenge", resolve); // This test is done once we receive a challenge
        });
    });

    it(`Start fails with documented error if subplebbit is already started`, async () => {
        const startRes = await fetch(`${baseUrl}/start?address=${startedSubplebbit.address}`, { method: "POST" });
        expect(startRes.status).to.equal(statusCodes.ERR_SUB_ALREADY_STARTED);
        expect(startRes.statusText).to.equal(statusMessages.ERR_SUB_ALREADY_STARTED);
    });
    it(`Start fails with documented error if subplebbit has not been created`, async () => {
        const startRes = await fetch(`${baseUrl}/start?address=gibbreish`, { method: "POST" });
        expect(startRes.status).to.equal(statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
        expect(startRes.statusText).to.equal(statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
    });

    it(`Stop fails with documented error if subplebbit has not been created`, async () => {
        const stopRes = await fetch(`${baseUrl}/stop?address=gibbreish`, { method: "POST" });
        expect(stopRes.status).to.equal(statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
        expect(stopRes.statusText).to.equal(statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
    });

    it(`Can stop subplebbit successfully`, async () => {
        const stopRes = await fetch(`${baseUrl}/stop?address=${startedSubplebbit.address}`, { method: "POST" });
        expect(stopRes.status).to.equal(statusCodes.SUCCESS_SUBPLEBBIT_STOPPED);
        expect(stopRes.statusText).to.equal(statusMessages.SUCCESS_SUBPLEBBIT_STOPPED);
    });

    it(`Stop fails with documented error if subplebbit has already been stopped`, async () => {
        const stopRes = await fetch(`${baseUrl}/stop?address=${startedSubplebbit.address}`, { method: "POST" });
        expect(stopRes.status).to.equal(statusCodes.ERR_SUBPLEBBIT_NOT_RUNNING);
        expect(stopRes.statusText).to.equal(statusMessages.ERR_SUBPLEBBIT_NOT_RUNNING);
    });
});

describe(`/api/v0/subplebbit/list`, async () => {
    const listUrl = `${baseUrl}/list`;
    let createdSubplebbit: SubplebbitType;

    it(`Newly created subplebbit is listed`, async () => {
        createdSubplebbit = <SubplebbitType>await (
            await fetch(`${baseUrl}/create`, {
                method: "POST",
                body: JSON.stringify({}),
                headers: { "content-type": "application/json" }
            })
        ).json();
        const res = await fetch(listUrl, {
            method: "POST"
        });
        const subs: SubplebbitList = <SubplebbitList>await res.json();
        const createdSubFromList = subs.filter((sub) => sub.address === createdSubplebbit.address)[0];
        expect(createdSubFromList).to.be.a("object");
        expect(createdSubFromList?.address).to.equal(createdSubplebbit.address);
        expect(createdSubFromList?.started).to.be.false;
    });

    it(`Started subplebbit has started === true`, async () => {
        await fetch(`${baseUrl}/start?address=${createdSubplebbit.address}`, { method: "POST" });
        const subs: SubplebbitList = <SubplebbitList>await (await fetch(listUrl, { method: "POST" })).json();
        const createdSubFromList = subs.filter((sub) => sub.address === createdSubplebbit.address)[0];
        expect(createdSubFromList).to.be.a("object");
        expect(createdSubFromList?.started).to.be.true;
    });
    it(`Stopping subplebbit with /api/v0/subplebbit/stop changes .started to false`, async () => {
        await fetch(`${baseUrl}/stop?address=${createdSubplebbit.address}`, { method: "POST" });
        const subs: SubplebbitList = <SubplebbitList>await (await fetch(listUrl, { method: "POST" })).json();
        const createdSubFromList = subs.filter((sub) => sub.address === createdSubplebbit.address)[0];
        expect(createdSubFromList?.started).to.be.false;
    });
});
