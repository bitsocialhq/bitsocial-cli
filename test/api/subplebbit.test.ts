import fetch from "node-fetch";
import { expect } from "chai";
import { CreateSubplebbitOptions, SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import { SubplebbitList } from "../../src/types.js";
const baseUrl = `http://localhost:${process.env["PLEBBIT_API_PORT"]}/api/v0/subplebbit`;
let createdSubplebbit: SubplebbitType;
describe("/api/v0/subplebbit/create", async () => {
    const createUrl = `${baseUrl}/create`;
    it("Request fails with documented error if invalid json was provided", async () => {
        const invalidJson: string = JSON.stringify({ test: "zz" }).slice(1); // Delete first character, should make the string unparsable
        const res = await fetch(createUrl, { method: "POST", body: invalidJson, headers: { "content-type": "application/json" } });
        expect(res.status).to.equal(400);
        expect(res.statusText).to.equal("Request body is invalid as a JSON");
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
        expect(res.status).to.equal(200);
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
        expect(res.status).to.equal(200);
        const retrievedSubplebbit: SubplebbitType = <SubplebbitType>await res.json();

        expect(retrievedSubplebbit).to.deep.equal(createdSubplebbit);
    });
});

describe(`/api/v0/subplebbit/list`, async () => {
    const listUrl = `${baseUrl}/list`;

    it(`Newly created subplebbit is listed`, async () => {
        const res = await fetch(listUrl, {
            method: "POST"
        });
        const subs: SubplebbitList = <SubplebbitList>await res.json();
        const createdSubFromList = subs.filter((sub) => sub.address === createdSubplebbit.address)[0];
        expect(createdSubFromList).to.be.a("object");
        expect(createdSubFromList?.address).to.equal(createdSubplebbit.address);
        expect(createdSubFromList?.started).to.be.false;
    });
});
