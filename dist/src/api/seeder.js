"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSubplebbits = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const assert_1 = tslib_1.__importDefault(require("assert"));
async function _loadAllPages(pageCid, pagesInstance) {
    const log = (0, plebbit_logger_1.default)("plebbit-cli:server:seed:_loadAllPages");
    try {
        let sortedCommentsPage = await pagesInstance.getPage(pageCid);
        let sortedComments = sortedCommentsPage.comments;
        while (sortedCommentsPage.nextCid) {
            sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
            sortedComments = sortedComments.concat(sortedCommentsPage.comments);
        }
        return sortedComments;
    }
    catch (e) {
        log.error(`Failed to load page (${pageCid}) of sub (${pagesInstance._subplebbitAddress}) due to error:`, e);
        return [];
    }
}
const seededIpns = {};
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
            // Seed IPNS
            for (const comment of loadedPagesWithNames["new"]) {
                (0, assert_1.default)(comment.ipnsName);
                if (seededIpns[comment.ipnsName]?.lastSeededAt !== comment.updatedAt) {
                    try {
                        await comment._clientsManager.fetchCommentUpdate(comment.ipnsName);
                        seededIpns[comment.ipnsName] = { lastSeededAt: comment.updatedAt };
                        log.trace(`Seeded comment (${comment.cid}) IPNS (${comment.ipnsName})`);
                    }
                    catch (e) {
                        log.error(`Failed to seed comment (${comment.cid}) IPNS (${comment.ipnsName}) due to error`, e);
                    }
                }
            }
        }
        // Pin cids that are not already pinned
        const newCidsToPin = lodash_1.default.difference(lodash_1.default.uniq(allCidsToPin), pinnedCids);
        if (newCidsToPin.length > 0) {
            log.trace(`Attempting to pin ${newCidsToPin.length} comments' cids from sub (${sub.address}): `, newCidsToPin);
            const defaultIpfsClient = Object.values(sub.plebbit.clients.ipfsClients)[0];
            (0, assert_1.default)(defaultIpfsClient);
            await defaultIpfsClient._client.pin.addAll(newCidsToPin);
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
            const defaultIpfsClient = Object.values(sub.plebbit.clients.ipfsClients)[0];
            (0, assert_1.default)(defaultIpfsClient);
            const pinnedCids = (await defaultIpfsClient._client.pin.ls()).map((pin) => pin.cid.toString());
            await _seedSub(sub, pinnedCids);
        }
        catch (e) {
            log.error(`Failed to load and seed sub (${subAddress}):`, String(e));
        }
    }
    log(`Finished this round of seeding. Will seed again later`);
}
exports.seedSubplebbits = seedSubplebbits;
