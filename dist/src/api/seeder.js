"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSubplebbits = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const util_js_1 = require("@plebbit/plebbit-js/dist/node/util.js");
const p_limit_1 = tslib_1.__importDefault(require("p-limit"));
async function _loadAllPages(pageCid, pagesInstance) {
    let sortedCommentsPage = await pagesInstance.getPage(pageCid);
    let sortedComments = sortedCommentsPage.comments;
    while (sortedCommentsPage.nextCid) {
        sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
        sortedComments = sortedComments.concat(sortedCommentsPage.comments);
    }
    return sortedComments;
}
async function _seedSub(sub, pinnedCids) {
    const log = (0, plebbit_logger_1.default)("plebbit-cli:server:seed");
    if (sub.statsCid)
        await sub.plebbit.fetchCid(sub.statsCid); // Seed stats
    await sub.plebbit.pubsubSubscribe(sub.pubsubTopic || sub.address);
    // Load all pages
    if (sub.posts.pageCids) {
        const pagesLoaded = await Promise.all(Object.values(sub.posts.pageCids).map((pageCid) => _loadAllPages(pageCid, sub.posts)));
        // What if one of pages fail to load
        log.trace(`Loaded the newest pages of sub (${sub.address}) to seed`);
        const pageNames = Object.keys(sub.posts.pageCids);
        const loadedPagesWithNames = lodash_1.default.zipObject(pageNames, pagesLoaded);
        const allCidsToPin = [];
        if (loadedPagesWithNames["new"]) {
            // Fetch all comments CID
            allCidsToPin.push(...loadedPagesWithNames["new"].map((comment) => comment.cid));
            // Fetch all previousCommentCid of authors
            allCidsToPin.push(...loadedPagesWithNames["new"]
                .filter((comment) => typeof comment.author.previousCommentCid === "string")
                .map((comment) => comment.author.previousCommentCid));
            // Fetch all comments' CommentUpdate IPNS
            const limit = (0, p_limit_1.default)(30); // Can only fetch 30 IPNS at a time
            const ipnsRes = await Promise.allSettled(loadedPagesWithNames["new"].map((comment) => limit(() => (0, util_js_1.loadIpnsAsJson)(comment.ipnsName, sub.plebbit))));
            log.trace(`Loaded and seeded ${ipnsRes.filter((res) => res.status === "fulfilled").length} CommentUpdate and failed to seed ${ipnsRes.filter((res) => res.status === "rejected").length} of sub (${sub.address})`);
        }
        const newCidsToPin = lodash_1.default.difference(lodash_1.default.uniq(allCidsToPin), pinnedCids);
        if (newCidsToPin.length > 0) {
            await sub.plebbit._defaultIpfsClient()._client.pin.addAll(newCidsToPin);
            log.trace(`Pinned ${newCidsToPin.length} cids from sub (${sub.address})`);
        }
        else
            log.trace(`All ${lodash_1.default.uniq(allCidsToPin).length} cids from sub (${sub.address}) are pinned`);
    }
}
async function seedSubplebbits(subAddresses, plebbit) {
    const log = (0, plebbit_logger_1.default)("plebbit-cli:server:seed");
    for (const subAddress of subAddresses) {
        try {
            const sub = await plebbit.getSubplebbit(subAddress);
            log.trace(`Loaded the newest record of sub (${subAddress}) for seeding`);
            const pinnedCids = (await plebbit._defaultIpfsClient()._client.pin.ls()).map((pin) => pin.cid.toString());
            await _seedSub(sub, pinnedCids);
        }
        catch (e) {
            log.error(`Failed to load and seed sub (${subAddress}):`, String(e));
        }
    }
}
exports.seedSubplebbits = seedSubplebbits;
