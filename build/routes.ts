/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse, fetchMiddlewares } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SubplebbitController } from './../src/api/subplebbit-controller';
import type { RequestHandler } from 'express';
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "SubplebbitList": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"started":{"dataType":"boolean","required":true},"address":{"dataType":"string","required":true}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SignatureType": {
        "dataType": "refObject",
        "properties": {
            "signature": {"dataType":"string","required":true},
            "publicKey": {"dataType":"string","required":true},
            "type": {"dataType":"enum","enums":["ed25519"],"required":true},
            "signedPropertyNames": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubplebbitEncryption": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"publicKey":{"dataType":"string","required":true},"type":{"dataType":"enum","enums":["ed25519-aes-gcm"],"required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Uint8Array": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SignerType": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"enum","enums":["ed25519"],"required":true},
            "privateKey": {"dataType":"string","required":true},
            "publicKey": {"dataType":"string"},
            "address": {"dataType":"string","required":true},
            "ipfsKey": {"ref":"Uint8Array"},
            "ipnsKeyName": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProtocolVersion": {
        "dataType": "refAlias",
        "type": {"dataType":"enum","enums":["1.0.0"],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PagesTypeJson": {
        "dataType": "refObject",
        "properties": {
            "pages": {"ref":"Partial_Record_PostSortName-or-ReplySortName.PageTypeJson__","required":true},
            "pageCids": {"ref":"Partial_Record_PostSortName-or-ReplySortName.string__","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Flair": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"expiresAt":{"dataType":"double"},"textColor":{"dataType":"string"},"backgroundColor":{"dataType":"string"},"text":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubplebbitAuthor": {
        "dataType": "refObject",
        "properties": {
            "postScore": {"dataType":"double","required":true},
            "replyScore": {"dataType":"double","required":true},
            "banExpiresAt": {"dataType":"double"},
            "flair": {"ref":"Flair"},
            "firstCommentTimestamp": {"dataType":"double","required":true},
            "lastCommentCid": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Wallet": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"address":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Nft": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"signature":{"ref":"SignatureType","required":true},"timestamp":{"dataType":"double","required":true},"id":{"dataType":"string","required":true},"address":{"dataType":"string","required":true},"chainTicker":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthorTypeWithCommentUpdate": {
        "dataType": "refObject",
        "properties": {
            "address": {"dataType":"string","required":true},
            "previousCommentCid": {"dataType":"string"},
            "displayName": {"dataType":"string"},
            "wallets": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"Wallet"}},
            "avatar": {"ref":"Nft"},
            "flair": {"ref":"Flair"},
            "subplebbit": {"ref":"SubplebbitAuthor"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthorIpfsType": {
        "dataType": "refObject",
        "properties": {
            "address": {"dataType":"string","required":true},
            "previousCommentCid": {"dataType":"string"},
            "displayName": {"dataType":"string"},
            "wallets": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"Wallet"}},
            "avatar": {"ref":"Nft"},
            "flair": {"ref":"Flair"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthorCommentEdit": {
        "dataType": "refObject",
        "properties": {
            "commentCid": {"dataType":"string","required":true},
            "content": {"dataType":"string","required":true},
            "deleted": {"dataType":"boolean","required":true},
            "flair": {"ref":"Flair","required":true},
            "spoiler": {"dataType":"boolean","required":true},
            "reason": {"dataType":"string","required":true},
            "author": {"ref":"AuthorIpfsType","required":true},
            "signature": {"ref":"SignatureType","required":true},
            "protocolVersion": {"ref":"ProtocolVersion","required":true},
            "subplebbitAddress": {"dataType":"string","required":true},
            "timestamp": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_CommentType.Exclude_keyofCommentType.replyCount-or-downvoteCount-or-upvoteCount-or-replies-or-updatedAt-or-original-or-cid-or-shortCid-or-postCid-or-depth-or-ipnsKeyName-or-signer__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"signature":{"ref":"SignatureType","required":true},"title":{"dataType":"string"},"author":{"ref":"AuthorTypeWithCommentUpdate","required":true},"edit":{"ref":"AuthorCommentEdit"},"flair":{"ref":"Flair"},"spoiler":{"dataType":"boolean"},"pinned":{"dataType":"boolean"},"locked":{"dataType":"boolean"},"removed":{"dataType":"boolean"},"reason":{"dataType":"string"},"protocolVersion":{"ref":"ProtocolVersion","required":true},"parentCid":{"dataType":"string"},"content":{"dataType":"string"},"link":{"dataType":"string"},"subplebbitAddress":{"dataType":"string","required":true},"timestamp":{"dataType":"double","required":true},"previousCid":{"dataType":"string"},"deleted":{"dataType":"boolean"},"thumbnailUrl":{"dataType":"string"},"ipnsName":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Partial_CommentType_.author-or-content-or-flair-or-protocolVersion_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"author":{"ref":"AuthorTypeWithCommentUpdate","required":true},"flair":{"ref":"Flair"},"protocolVersion":{"ref":"ProtocolVersion","required":true},"content":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_CommentUpdate.Exclude_keyofCommentUpdate.author-or-replies__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"updatedAt":{"dataType":"double","required":true},"signature":{"ref":"SignatureType","required":true},"replyCount":{"dataType":"double","required":true},"downvoteCount":{"dataType":"double","required":true},"upvoteCount":{"dataType":"double","required":true},"cid":{"dataType":"string","required":true},"edit":{"ref":"AuthorCommentEdit"},"flair":{"ref":"Flair"},"spoiler":{"dataType":"boolean"},"pinned":{"dataType":"boolean"},"locked":{"dataType":"boolean"},"removed":{"dataType":"boolean"},"reason":{"dataType":"string"},"protocolVersion":{"ref":"ProtocolVersion","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentWithCommentUpdate": {
        "dataType": "refObject",
        "properties": {
            "signature": {"ref":"SignatureType","required":true},
            "title": {"dataType":"string"},
            "author": {"ref":"AuthorTypeWithCommentUpdate","required":true},
            "edit": {"ref":"AuthorCommentEdit"},
            "flair": {"ref":"Flair"},
            "spoiler": {"dataType":"boolean"},
            "pinned": {"dataType":"boolean"},
            "locked": {"dataType":"boolean"},
            "removed": {"dataType":"boolean"},
            "reason": {"dataType":"string"},
            "protocolVersion": {"ref":"ProtocolVersion","required":true},
            "parentCid": {"dataType":"string"},
            "content": {"dataType":"string"},
            "link": {"dataType":"string"},
            "subplebbitAddress": {"dataType":"string","required":true},
            "timestamp": {"dataType":"double","required":true},
            "previousCid": {"dataType":"string"},
            "deleted": {"dataType":"boolean"},
            "thumbnailUrl": {"dataType":"string"},
            "ipnsName": {"dataType":"string"},
            "original": {"ref":"Pick_Partial_CommentType_.author-or-content-or-flair-or-protocolVersion_","required":true},
            "cid": {"dataType":"string","required":true},
            "shortCid": {"dataType":"string","required":true},
            "postCid": {"dataType":"string","required":true},
            "depth": {"dataType":"double","required":true},
            "updatedAt": {"dataType":"double","required":true},
            "replyCount": {"dataType":"double","required":true},
            "downvoteCount": {"dataType":"double","required":true},
            "upvoteCount": {"dataType":"double","required":true},
            "replies": {"ref":"PagesTypeJson"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PageTypeJson": {
        "dataType": "refObject",
        "properties": {
            "comments": {"dataType":"array","array":{"dataType":"refObject","ref":"CommentWithCommentUpdate"},"required":true},
            "nextCid": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Record_PostSortName-or-ReplySortName.PageTypeJson__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"hot":{"ref":"PageTypeJson"},"new":{"ref":"PageTypeJson"},"topHour":{"ref":"PageTypeJson"},"topDay":{"ref":"PageTypeJson"},"topWeek":{"ref":"PageTypeJson"},"topMonth":{"ref":"PageTypeJson"},"topYear":{"ref":"PageTypeJson"},"topAll":{"ref":"PageTypeJson"},"controversialHour":{"ref":"PageTypeJson"},"controversialDay":{"ref":"PageTypeJson"},"controversialWeek":{"ref":"PageTypeJson"},"controversialMonth":{"ref":"PageTypeJson"},"controversialYear":{"ref":"PageTypeJson"},"controversialAll":{"ref":"PageTypeJson"},"old":{"ref":"PageTypeJson"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Record_PostSortName-or-ReplySortName.string__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"hot":{"dataType":"string"},"new":{"dataType":"string"},"topHour":{"dataType":"string"},"topDay":{"dataType":"string"},"topWeek":{"dataType":"string"},"topMonth":{"dataType":"string"},"topYear":{"dataType":"string"},"topAll":{"dataType":"string"},"controversialHour":{"dataType":"string"},"controversialDay":{"dataType":"string"},"controversialWeek":{"dataType":"string"},"controversialMonth":{"dataType":"string"},"controversialYear":{"dataType":"string"},"controversialAll":{"dataType":"string"},"old":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubplebbitRole": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"role":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["owner"]},{"dataType":"enum","enums":["admin"]},{"dataType":"enum","enums":["moderator"]}],"required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChallengeType": {
        "dataType": "refObject",
        "properties": {
            "challenge": {"dataType":"string","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["image/png"]},{"dataType":"enum","enums":["text/plain"]},{"dataType":"enum","enums":["chain/<chainTicker>"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubplebbitStats": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"allPostCount":{"dataType":"double","required":true},"yearPostCount":{"dataType":"double","required":true},"monthPostCount":{"dataType":"double","required":true},"weekPostCount":{"dataType":"double","required":true},"dayPostCount":{"dataType":"double","required":true},"hourPostCount":{"dataType":"double","required":true},"allActiveUserCount":{"dataType":"double","required":true},"yearActiveUserCount":{"dataType":"double","required":true},"monthActiveUserCount":{"dataType":"double","required":true},"weekActiveUserCount":{"dataType":"double","required":true},"dayActiveUserCount":{"dataType":"double","required":true},"hourActiveUserCount":{"dataType":"double","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubplebbitFeatures": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"markdownVideoReplies":{"dataType":"boolean"},"markdownImageReplies":{"dataType":"boolean"},"noMarkdownVideos":{"dataType":"boolean"},"noMarkdownImages":{"dataType":"boolean"},"requirePostFlairs":{"dataType":"boolean"},"postFlairs":{"dataType":"boolean"},"requireAuthorFlairs":{"dataType":"boolean"},"authorFlairs":{"dataType":"boolean"},"safeForWork":{"dataType":"boolean"},"noNestedReplies":{"dataType":"boolean"},"anonymousAuthors":{"dataType":"boolean"},"noAuthors":{"dataType":"boolean"},"noDownvotes":{"dataType":"boolean"},"noUpvotes":{"dataType":"boolean"},"noCrossposts":{"dataType":"boolean"},"noPolls":{"dataType":"boolean"},"noImageReplies":{"dataType":"boolean"},"noSpoilerReplies":{"dataType":"boolean"},"noVideoReplies":{"dataType":"boolean"},"noImages":{"dataType":"boolean"},"noSpoilers":{"dataType":"boolean"},"noVideos":{"dataType":"boolean"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubplebbitSuggested": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"language":{"dataType":"string"},"backgroundUrl":{"dataType":"string"},"bannerUrl":{"dataType":"string"},"avatarUrl":{"dataType":"string"},"secondaryColor":{"dataType":"string"},"primaryColor":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_FlairOwner.Flair-Array_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"author":{"dataType":"array","array":{"dataType":"refAlias","ref":"Flair"}},"post":{"dataType":"array","array":{"dataType":"refAlias","ref":"Flair"}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubplebbitSettings": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"fetchThumbnailUrlsProxyUrl":{"dataType":"string"},"fetchThumbnailUrls":{"dataType":"boolean"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_CreateSubplebbitOptions.Exclude_keyofCreateSubplebbitOptions.database-or-signer__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"createdAt":{"dataType":"double"},"updatedAt":{"dataType":"double"},"encryption":{"ref":"SubplebbitEncryption"},"signature":{"ref":"SignatureType"},"title":{"dataType":"string"},"description":{"dataType":"string"},"roles":{"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"SubplebbitRole"}},"rules":{"dataType":"array","array":{"dataType":"string"}},"lastPostCid":{"dataType":"string"},"pubsubTopic":{"dataType":"string"},"challengeTypes":{"dataType":"array","array":{"dataType":"refObject","ref":"ChallengeType"}},"stats":{"ref":"SubplebbitStats"},"features":{"ref":"SubplebbitFeatures"},"suggested":{"ref":"SubplebbitSuggested"},"flairs":{"ref":"Record_FlairOwner.Flair-Array_"},"address":{"dataType":"string"},"settings":{"ref":"SubplebbitSettings"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubplebbitType": {
        "dataType": "refObject",
        "properties": {
            "createdAt": {"dataType":"double","required":true},
            "updatedAt": {"dataType":"double","required":true},
            "encryption": {"ref":"SubplebbitEncryption","required":true},
            "signature": {"ref":"SignatureType","required":true},
            "title": {"dataType":"string"},
            "description": {"dataType":"string"},
            "roles": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"SubplebbitRole"}},
            "rules": {"dataType":"array","array":{"dataType":"string"}},
            "lastPostCid": {"dataType":"string"},
            "pubsubTopic": {"dataType":"string"},
            "challengeTypes": {"dataType":"array","array":{"dataType":"refObject","ref":"ChallengeType"}},
            "stats": {"ref":"SubplebbitStats"},
            "features": {"ref":"SubplebbitFeatures"},
            "suggested": {"ref":"SubplebbitSuggested"},
            "flairs": {"ref":"Record_FlairOwner.Flair-Array_"},
            "address": {"dataType":"string","required":true},
            "settings": {"ref":"SubplebbitSettings"},
            "shortAddress": {"dataType":"string","required":true},
            "signer": {"ref":"SignerType"},
            "statsCid": {"dataType":"string"},
            "protocolVersion": {"ref":"ProtocolVersion","required":true},
            "posts": {"ref":"PagesTypeJson"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_SignerType.privateKey-or-type_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"privateKey":{"dataType":"string","required":true},"type":{"dataType":"enum","enums":["ed25519"],"required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateSubplebbitOptions": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string"},
            "description": {"dataType":"string"},
            "roles": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"SubplebbitRole"}},
            "rules": {"dataType":"array","array":{"dataType":"string"}},
            "lastPostCid": {"dataType":"string"},
            "pubsubTopic": {"dataType":"string"},
            "challengeTypes": {"dataType":"array","array":{"dataType":"refObject","ref":"ChallengeType"}},
            "stats": {"ref":"SubplebbitStats"},
            "features": {"ref":"SubplebbitFeatures"},
            "suggested": {"ref":"SubplebbitSuggested"},
            "flairs": {"ref":"Record_FlairOwner.Flair-Array_"},
            "address": {"dataType":"string"},
            "settings": {"ref":"SubplebbitSettings"},
            "createdAt": {"dataType":"double"},
            "updatedAt": {"dataType":"double"},
            "signer": {"ref":"Pick_SignerType.privateKey-or-type_"},
            "encryption": {"ref":"SubplebbitEncryption"},
            "signature": {"ref":"SignatureType"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubplebbitEditOptions": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string"},
            "description": {"dataType":"string"},
            "roles": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"SubplebbitRole"}},
            "rules": {"dataType":"array","array":{"dataType":"string"}},
            "lastPostCid": {"dataType":"string"},
            "pubsubTopic": {"dataType":"string"},
            "challengeTypes": {"dataType":"array","array":{"dataType":"refObject","ref":"ChallengeType"}},
            "stats": {"ref":"SubplebbitStats"},
            "features": {"ref":"SubplebbitFeatures"},
            "suggested": {"ref":"SubplebbitSuggested"},
            "flairs": {"ref":"Record_FlairOwner.Flair-Array_"},
            "address": {"dataType":"string"},
            "settings": {"ref":"SubplebbitSettings"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: express.Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.post('/api/v0/subplebbit/list',
            ...(fetchMiddlewares<RequestHandler>(SubplebbitController)),
            ...(fetchMiddlewares<RequestHandler>(SubplebbitController.prototype.list)),

            function SubplebbitController_list(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SubplebbitController();


              const promise = controller.list.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/v0/subplebbit/create',
            ...(fetchMiddlewares<RequestHandler>(SubplebbitController)),
            ...(fetchMiddlewares<RequestHandler>(SubplebbitController.prototype.create)),

            function SubplebbitController_create(request: any, response: any, next: any) {
            const args = {
                    requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateSubplebbitOptions"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SubplebbitController();


              const promise = controller.create.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, 201, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/v0/subplebbit/start',
            ...(fetchMiddlewares<RequestHandler>(SubplebbitController)),
            ...(fetchMiddlewares<RequestHandler>(SubplebbitController.prototype.start)),

            function SubplebbitController_start(request: any, response: any, next: any) {
            const args = {
                    address: {"in":"query","name":"address","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SubplebbitController();


              const promise = controller.start.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, 200, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/v0/subplebbit/stop',
            ...(fetchMiddlewares<RequestHandler>(SubplebbitController)),
            ...(fetchMiddlewares<RequestHandler>(SubplebbitController.prototype.stop)),

            function SubplebbitController_stop(request: any, response: any, next: any) {
            const args = {
                    address: {"in":"query","name":"address","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SubplebbitController();


              const promise = controller.stop.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, 200, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/v0/subplebbit/edit',
            ...(fetchMiddlewares<RequestHandler>(SubplebbitController)),
            ...(fetchMiddlewares<RequestHandler>(SubplebbitController.prototype.edit)),

            function SubplebbitController_edit(request: any, response: any, next: any) {
            const args = {
                    address: {"in":"query","name":"address","required":true,"dataType":"string"},
                    requestBody: {"in":"body","name":"requestBody","required":true,"ref":"SubplebbitEditOptions"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SubplebbitController();


              const promise = controller.edit.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, 200, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode = successStatus;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus() || statusCode;
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        if (response.headersSent) {
            return;
        }
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            data.pipe(response);
        } else if (data !== null && data !== undefined) {
            response.status(statusCode || 200).json(data);
        } else {
            response.status(statusCode || 204).end();
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown>  {
        return function(status, data, headers) {
            returnHandler(response, status, data, headers);
        };
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function getValidatedArgs(args: any, request: any, response: any): any[] {
        const fieldErrors: FieldErrors  = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'formData':
                    if (args[key].dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.file, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else if (args[key].dataType === 'array' && args[key].array.dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.files, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else {
                        return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    }
                case 'res':
                    return responder(response);
            }
        });

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
