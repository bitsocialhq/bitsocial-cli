import Logger from "@plebbit/plebbit-logger";
import startIpfsNode from "../ipfs/startIpfs.js";
import * as isIPFS from "is-ipfs";

const [defaultIpfsApiPort, defaultIpfsGatewayPort] = [32429, 32430];

export async function daemon() {
    await startIpfsNode(defaultIpfsApiPort, defaultIpfsGatewayPort); // TODO permit user to provide their own api and gateway port number
}
