import fetch from "node-fetch";
import { expect } from "chai";
describe("createSubplebbit", async () => {
    it("Request fails with documented error if invalid json was provided", async () => {
        const url = `http://localhost:${process.env["PLEBBIT_API_PORT"]}/api/v0/subplebbit/create`;
        const invalidJson: string = JSON.stringify({ test: "zz" }).slice(1); // Delete first character, should make the string unparsable
        expect(invalidJson);
        const res = await fetch(url, { method: "POST", body: invalidJson, headers: { "content-type": "application/json" } });
        expect(res.status).to.equal(400);
        expect(res.statusText).to.equal("Request body is invalid as a JSON");
    });
});
