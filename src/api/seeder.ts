import lodash from "lodash";
import Logger from "@plebbit/plebbit-logger";
import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit";
import { Subplebbit } from "@plebbit/plebbit-js/dist/node/subplebbit";
import { BasePages } from "@plebbit/plebbit-js/dist/node/pages";
import { Comment } from "@plebbit/plebbit-js/dist/node/comment";
import pLimit from "p-limit";
import assert from "assert";

async function _loadAllPages(pageCid: string, pagesInstance: BasePages): Promise<Comment[]> {
    let sortedCommentsPage = await pagesInstance.getPage(pageCid);
    let sortedComments: Comment[] = sortedCommentsPage.comments;
    while (sortedCommentsPage.nextCid) {
        sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
        sortedComments = sortedComments.concat(sortedCommentsPage.comments);
    }
    return sortedComments;
}

async function _seedSub(sub: Subplebbit, pinnedCids: string[]) {
    const log = Logger("plebbit-cli:server:seed");
    if (sub.statsCid) await sub.plebbit.fetchCid(sub.statsCid); // Seed stats

    await sub.plebbit.pubsubSubscribe(sub.pubsubTopic || sub.address);

    // Load all pages
    if (sub.posts.pageCids) {
        const pagesLoaded = await Promise.all(Object.values(sub.posts.pageCids).map((pageCid) => _loadAllPages(pageCid, sub.posts)));
        // What if one of pages fail to load

        log.trace(`Loaded the newest pages of sub (${sub.address}) to seed`);
        const pageNames = Object.keys(sub.posts.pageCids);
        const loadedPagesWithNames = lodash.zipObject(pageNames, pagesLoaded);
        const allCidsToPin: string[] = [];
        if (loadedPagesWithNames["new"]) {
            // Fetch all comments CID
            allCidsToPin.push(...loadedPagesWithNames["new"].map((comment) => <string>comment.cid));

            // Fetch all previousCommentCid of authors
            allCidsToPin.push(
                ...loadedPagesWithNames["new"]
                    .filter((comment) => typeof comment.author.previousCommentCid === "string")
                    .map((comment) => <string>comment.author.previousCommentCid)
            );

            // Fetch all comments' CommentUpdate IPNS
            const limit = pLimit(30); // Can only fetch 30 IPNS at a time
            // TODO don't load all IPNS, instead only load the ones whose updatedAt did not change. We need to store all updatedAt somewhere
            const ipnsRes = await Promise.allSettled(
                loadedPagesWithNames["new"].map((comment) =>
                    limit(() => sub.plebbit._clientsManager.fetchFromMultipleGateways({ ipns: <string>comment.ipnsName }, "subplebbit"))
                )
            );

            log.trace(
                `Loaded and seeded ${ipnsRes.filter((res) => res.status === "fulfilled").length} CommentUpdate and failed to seed ${
                    ipnsRes.filter((res) => res.status === "rejected").length
                } of sub (${sub.address})`
            );
        }

        const newCidsToPin = lodash.difference(lodash.uniq(allCidsToPin), pinnedCids);
        if (newCidsToPin.length > 0) {
            const defaultIpfsClient = Object.values(sub.plebbit.clients.ipfsClients)[0];
            assert(defaultIpfsClient);
            await defaultIpfsClient._client.pin.addAll(newCidsToPin);
            log.trace(`Pinned ${newCidsToPin.length} cids from sub (${sub.address})`);
        } else log.trace(`All ${lodash.uniq(allCidsToPin).length} cids from sub (${sub.address}) are pinned`);
    }
}

export async function seedSubplebbits(subAddresses: string[], plebbit: Plebbit) {
    const log = Logger("plebbit-cli:server:seed");

    for (const subAddress of subAddresses) {
        try {
            const sub = await plebbit.getSubplebbit(subAddress);
            log.trace(`Loaded the newest record of sub (${subAddress}) for seeding`);
            const defaultIpfsClient = Object.values(sub.plebbit.clients.ipfsClients)[0];
            assert(defaultIpfsClient);

            const pinnedCids: string[] = (await defaultIpfsClient._client.pin.ls()).map((pin) => pin.cid.toString());
            await _seedSub(sub, pinnedCids);
        } catch (e) {
            log.error(`Failed to load and seed sub (${subAddress}):`, String(e));
        }
    }
}
