// import lodash from "lodash";
// import Logger from "@plebbit/plebbit-logger";
// import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit";
// import { BasePages } from "@plebbit/plebbit-js/dist/node/pages";
// import { Comment } from "@plebbit/plebbit-js/dist/node/comment";
// import assert from "assert";
// //@ts-expect-error
// import { CID } from "ipfs-http-client";
// import { Subplebbit } from "@plebbit/plebbit-js/dist/node/subplebbit/subplebbit";
export {};
// async function _loadAllPages(pageCid: string, pagesInstance: BasePages): Promise<Comment[]> {
//     const log = Logger("plebbit-cli:server:seed:_loadAllPages");
//     try {
//         let sortedCommentsPage = await pagesInstance.getPage(pageCid);
//         let sortedComments: Comment[] = sortedCommentsPage.comments;
//         while (sortedCommentsPage.nextCid) {
//             sortedCommentsPage = await pagesInstance.getPage(sortedCommentsPage.nextCid);
//             sortedComments = sortedComments.concat(sortedCommentsPage.comments);
//         }
//         return sortedComments;
//     } catch (e) {
//         log.error(`Failed to load page (${pageCid}) of sub (${pagesInstance._subplebbitAddress}) due to error:`, e);
//         return [];
//     }
// }
// const seededIpns: Record<string, { lastSeededAt?: number }> = {};
// async function _seedSub(sub: Subplebbit, pinnedCids: string[]) {
//     const log = Logger("plebbit-cli:server:seed");
//     if (sub.statsCid) await sub.plebbit.fetchCid(sub.statsCid); // Seed stats
//     await sub.plebbit.pubsubSubscribe(sub.pubsubTopic || sub.address);
//     // Load all pages
//     if (sub.posts.pageCids) {
//         const pagesLoaded = await Promise.all(Object.values(sub.posts.pageCids).map((pageCid) => _loadAllPages(pageCid, sub.posts)));
//         // What if one of pages fail to load
//         log.trace(`Loaded the newest pages of sub (${sub.address}) to seed`);
//         const pageNames = Object.keys(sub.posts.pageCids);
//         const loadedPagesWithNames = lodash.zipObject(pageNames, pagesLoaded);
//         const allCidsToPin: string[] = [];
//         if (loadedPagesWithNames["new"]) {
//             // Fetch all comments CID
//             allCidsToPin.push(...loadedPagesWithNames["new"].map((comment) => <string>comment.cid));
//             // Seed IPNS
//             for (const comment of loadedPagesWithNames["new"]) {
//                 assert(comment.ipnsName);
//                 if (seededIpns[comment.ipnsName]?.lastSeededAt !== comment.updatedAt) {
//                     try {
//                         await comment._clientsManager.fetchCommentUpdate(comment.ipnsName);
//                         seededIpns[comment.ipnsName] = { lastSeededAt: comment.updatedAt };
//                         log.trace(`Seeded comment (${comment.cid}) IPNS (${comment.ipnsName})`);
//                     } catch (e) {
//                         log.error(`Failed to seed comment (${comment.cid}) IPNS (${comment.ipnsName}) due to error`, e);
//                     }
//                 }
//             }
//         }
//         // Pin cids that are not already pinned
//         const newCidsToPin = lodash.difference(lodash.uniq(allCidsToPin), pinnedCids).map((cidString) => CID.parse(cidString));
//         if (newCidsToPin.length > 0) {
//             log.trace(`Attempting to pin ${newCidsToPin.length} comments' cids from sub (${sub.address}): `, newCidsToPin);
//             const defaultIpfsClient = Object.values(sub.plebbit.clients.ipfsClients)[0];
//             assert(defaultIpfsClient);
//             await defaultIpfsClient._client.pin.addAll(newCidsToPin);
//             log.trace(`Pinned ${newCidsToPin.length} cids from sub (${sub.address})`);
//         } else log.trace(`All ${lodash.uniq(allCidsToPin).length} cids from sub (${sub.address}) are pinned`);
//     }
// }
// export async function seedSubplebbits(subAddresses: string[], plebbit: Plebbit) {
//     const log = Logger("plebbit-cli:server:seed");
//     log.trace("test"); // remove this line later
//     for (const subAddress of subAddresses) {
//         try {
//             const sub = await plebbit.getSubplebbit(subAddress);
//             log.trace(`Loaded the newest record of sub (${subAddress}) for seeding`);
//             const defaultIpfsClient = Object.values(sub.plebbit.clients.ipfsClients)[0];
//             assert(defaultIpfsClient);
//             const pinnedCids: string[] = (await defaultIpfsClient._client.pin.ls()).map((pin) => pin.cid.toString());
//             await _seedSub(sub, pinnedCids);
//         } catch (e) {
//             log.error(`Failed to load and seed sub (${subAddress}):`, String(e));
//         }
//     }
//     log(`Finished this round of seeding. Will seed again later`);
// }
