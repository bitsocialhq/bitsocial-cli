// // TODO rewrite to use MultiSub json
// // TODO fetch ipns of seeded subplebbits with cache turned off
// import lodash from "lodash";
// import Logger from "@plebbit/plebbit-logger";
// import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit";
// import { BasePages } from "@plebbit/plebbit-js/dist/node/pages";
// import { Comment } from "@plebbit/plebbit-js/dist/node/comment";
// import assert from "assert";
// //@ts-expect-error
// import { CID } from "ipfs-http-client";
// import { Subplebbit } from "@plebbit/plebbit-js/dist/node/subplebbit/subplebbit";

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

// async function _seedSub(sub: Subplebbit) {
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
//         if (loadedPagesWithNames["new"]) {
//             // Fetch all comments CID

//             for (const comment of loadedPagesWithNames["new"]) {
//                 // TODO should also load the pages of this comment
//                 const commentInstance = await sub.plebbit.createComment({ cid: <string>comment.cid });
//                 commentInstance.update();
//                 await new Promise((resolve) => commentInstance.once("update", resolve)); // loaded CommentIpfs
//                 await new Promise((resolve) => commentInstance.once("update", resolve)); // loaded CommentUpdate
//                 await commentInstance.stop();
//             }
//         }
//     }
// }

// export async function seedSubplebbits(subAddresses: string[], plebbit: Plebbit) {
//     const log = Logger("plebbit-cli:server:seed");
//     for (const subAddress of subAddresses) {
//         try {
//             const ipnsAddressOfSub = plebbit._clientsManager.resolveSubplebbitAddressIfNeeded(subAddress);
//             await plebbit._clientsManager.getDefaultIpfs()._client.name.resolve(ipnsAddressOfSub, { nocache: true }); // make sure ipns nonce is the latest by not using cache

//             const sub = await plebbit.getSubplebbit(subAddress);
//             log.trace(`Loaded the newest record of sub (${subAddress}) for seeding`);
//             await _seedSub(sub);
//         } catch (e) {
//             log.error(`Failed to load and seed sub (${subAddress}):`, String(e));
//         }
//     }
//     log(`Finished this round of seeding. Will seed again later`);
// }
