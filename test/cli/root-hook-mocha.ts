import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit.js";
import Sinon from "sinon";
import { Client as WebSocketClient } from "rpc-websockets";
import PlebbitRpcClient from "@plebbit/plebbit-js/dist/node/clients/plebbit-rpc-client.js";

exports.mochaHooks = {
    beforeAll: () => {
        // Stub out plebbit rpc client
        Sinon.stub(WebSocketClient.prototype, "on");
        Sinon.stub(WebSocketClient.prototype, "call");

        Sinon.stub(Plebbit, "prototype");

        Sinon.stub(PlebbitRpcClient.prototype, "_init");
        Sinon.stub(PlebbitRpcClient.prototype, "destroy")

        Sinon.stub(Plebbit.prototype, "listSubplebbits");
    },
    beforeEach: () => {},
    afterAll: () => {},
    afterEach: () => {}
};
