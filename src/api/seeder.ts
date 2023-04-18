import lodash from "lodash";
import Logger from "@plebbit/plebbit-logger";
import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit";
import { loadIpnsAsJson } from "@plebbit/plebbit-js/dist/node/util.js";
import { Subplebbit } from "@plebbit/plebbit-js/dist/node/subplebbit";
import { Pages } from "@plebbit/plebbit-js/dist/node/pages";
import { Comment } from "@plebbit/plebbit-js/dist/node/comment";
import pLimit from "p-limit";

async function _loadAllPages(pageCid: string, pagesInstance: Pages): Promise<Comment[]> {
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
            const ipnsRes = await Promise.allSettled(
                loadedPagesWithNames["new"].map((comment) => limit(() => loadIpnsAsJson(<string>comment.ipnsName, sub.plebbit)))
            );

            log.trace(
                `Loaded and seeded ${ipnsRes.filter((res) => res.status === "fulfilled").length} CommentUpdate and failed to seed ${
                    ipnsRes.filter((res) => res.status === "rejected").length
                }`
            );
        }

        const newCidsToPin = lodash.difference(lodash.uniq(allCidsToPin), pinnedCids);
        if (newCidsToPin.length > 0) {
            await sub.plebbit._defaultIpfsClient()._client.pin.addAll(newCidsToPin);
            log.trace(`Pinned ${newCidsToPin.length} cids from sub (${sub.address})`);
        }
    }
}

export async function seedSubplebbits(subAddresses: string[], plebbit: Plebbit) {
    const log = Logger("plebbit-cli:server:seed");

    const pinnedCids: string[] = (await plebbit._defaultIpfsClient()._client.pin.ls()).map((pin) => pin.cid.toString());

    for (const subAddress of subAddresses) {
        try {
            const sub = await plebbit.getSubplebbit(subAddress);
            log.trace(`Loaded the newest record of sub (${subAddress}) for seeding`);
            _seedSub(sub, pinnedCids);
        } catch (e) {
            log.error(`Failed to load and seed sub (${subAddress}):`, String(e));
        }
    }
}
