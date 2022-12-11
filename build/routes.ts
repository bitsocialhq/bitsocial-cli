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
    "CommentSignedPropertyNames": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"enum","enums":["title","subplebbitAddress","author","timestamp","content","link","parentCid"]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentEditSignedPropertyNames": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"enum","enums":["subplebbitAddress","author","timestamp","content","commentCid","deleted","flair","spoiler","reason","pinned","locked","removed","moderatorReason","commentAuthor"]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VoteSignedPropertyNames": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"enum","enums":["subplebbitAddress","author","timestamp","commentCid","vote"]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubplebbitSignedPropertyNames": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"enum","enums":["createdAt","updatedAt","encryption","title","description","roles","rules","lastPostCid","posts","pubsubTopic","challengeTypes","metrics","features","suggested","flairs","address","metricsCid"]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentUpdatedSignedPropertyNames": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"enum","enums":["updatedAt","author","flair","spoiler","pinned","locked","removed","moderatorReason","upvoteCount","downvoteCount","replyCount","authorEdit","replies"]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChallengeRequestMessageSignedPropertyNames": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"enum","enums":["challengeRequestId","type","encryptedPublication","acceptedChallengeTypes"]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChallengeMessageSignedPropertyNames": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"enum","enums":["challengeRequestId","type","encryptedChallenges"]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChallengeAnswerMessageSignedPropertyNames": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"enum","enums":["challengeRequestId","type","challengeAnswerId","encryptedChallengeAnswers"]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChallengeVerificationMessageSignedPropertyNames": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"enum","enums":["reason","challengeRequestId","type","encryptedPublication","challengeAnswerId","challengeSuccess","challengeErrors"]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SignedPropertyNames": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"CommentSignedPropertyNames"},{"ref":"CommentEditSignedPropertyNames"},{"ref":"VoteSignedPropertyNames"},{"ref":"SubplebbitSignedPropertyNames"},{"ref":"CommentUpdatedSignedPropertyNames"},{"ref":"ChallengeRequestMessageSignedPropertyNames"},{"ref":"ChallengeMessageSignedPropertyNames"},{"ref":"ChallengeAnswerMessageSignedPropertyNames"},{"ref":"ChallengeVerificationMessageSignedPropertyNames"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SignatureType": {
        "dataType": "refObject",
        "properties": {
            "signature": {"dataType":"string","required":true},
            "publicKey": {"dataType":"string","required":true},
            "type": {"dataType":"enum","enums":["rsa"],"required":true},
            "signedPropertyNames": {"ref":"SignedPropertyNames","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubplebbitEncryption": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"publicKey":{"dataType":"string","required":true},"type":{"dataType":"enum","enums":["aes-cbc"],"required":true}},"validators":{}},
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
            "type": {"dataType":"enum","enums":["rsa"],"required":true},
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
    "Wallet": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"address":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Nft": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"signature":{"dataType":"string","required":true},"address":{"dataType":"string","required":true},"id":{"dataType":"string","required":true},"chainTicker":{"dataType":"string","required":true}},"validators":{}},
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
            "lastCommentCid": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthorType": {
        "dataType": "refObject",
        "properties": {
            "address": {"dataType":"string","required":true},
            "previousCommentCid": {"dataType":"string"},
            "displayName": {"dataType":"string"},
            "wallets": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"Wallet"}},
            "avatar": {"ref":"Nft"},
            "flair": {"ref":"Flair"},
            "banExpiresAt": {"dataType":"double"},
            "subplebbit": {"ref":"SubplebbitAuthor"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Partial_CommentType_.author-or-content-or-flair_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"author":{"ref":"AuthorType","required":true},"content":{"dataType":"string"},"flair":{"ref":"Flair"}},"validators":{}},
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
            "author": {"ref":"AuthorType","required":true},
            "signature": {"ref":"SignatureType","required":true},
            "protocolVersion": {"ref":"ProtocolVersion","required":true},
            "subplebbitAddress": {"dataType":"string","required":true},
            "timestamp": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PagesType": {
        "dataType": "refObject",
        "properties": {
            "pages": {"ref":"Partial_Record_PostSortName-or-ReplySortName.PageType__"},
            "pageCids": {"ref":"Partial_Record_PostSortName-or-ReplySortName.string__"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_AuthorType.banExpiresAt-or-flair-or-subplebbit_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"flair":{"ref":"Flair"},"banExpiresAt":{"dataType":"double"},"subplebbit":{"ref":"SubplebbitAuthor"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Omit_AuthorType.subplebbit-or-banExpiresAt__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"address":{"dataType":"string"},"flair":{"ref":"Flair"},"previousCommentCid":{"dataType":"string"},"displayName":{"dataType":"string"},"wallets":{"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"Wallet"}},"avatar":{"ref":"Nft"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_CreateCommentOptions.Exclude_keyofCreateCommentOptions.signer__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"title":{"dataType":"string"},"subplebbitAddress":{"dataType":"string","required":true},"author":{"ref":"Partial_Omit_AuthorType.subplebbit-or-banExpiresAt__"},"timestamp":{"dataType":"double"},"content":{"dataType":"string"},"link":{"dataType":"string"},"parentCid":{"dataType":"string"},"flair":{"ref":"Flair"},"spoiler":{"dataType":"boolean"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentType": {
        "dataType": "refObject",
        "properties": {
            "upvoteCount": {"dataType":"double"},
            "downvoteCount": {"dataType":"double"},
            "replyCount": {"dataType":"double"},
            "authorEdit": {"ref":"AuthorCommentEdit"},
            "replies": {"ref":"PagesType"},
            "flair": {"ref":"Flair","required":true},
            "spoiler": {"dataType":"boolean","required":true},
            "pinned": {"dataType":"boolean"},
            "locked": {"dataType":"boolean"},
            "removed": {"dataType":"boolean"},
            "moderatorReason": {"dataType":"string"},
            "updatedAt": {"dataType":"double"},
            "protocolVersion": {"ref":"ProtocolVersion","required":true},
            "signature": {"ref":"SignatureType","required":true},
            "author": {"ref":"AuthorType","required":true},
            "title": {"dataType":"string"},
            "subplebbitAddress": {"dataType":"string","required":true},
            "timestamp": {"dataType":"double","required":true},
            "content": {"dataType":"string","required":true},
            "link": {"dataType":"string"},
            "parentCid": {"dataType":"string"},
            "commentCid": {"dataType":"string","required":true},
            "deleted": {"dataType":"boolean","required":true},
            "reason": {"dataType":"string","required":true},
            "postCid": {"dataType":"string"},
            "previousCid": {"dataType":"string"},
            "ipnsKeyName": {"dataType":"string"},
            "depth": {"dataType":"double"},
            "signer": {"ref":"SignerType"},
            "original": {"ref":"Pick_Partial_CommentType_.author-or-content-or-flair_"},
            "thumbnailUrl": {"dataType":"string"},
            "cid": {"dataType":"string"},
            "ipnsName": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PageType": {
        "dataType": "refObject",
        "properties": {
            "comments": {"dataType":"array","array":{"dataType":"refObject","ref":"CommentType"},"required":true},
            "nextCid": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Record_PostSortName-or-ReplySortName.PageType__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"hot":{"ref":"PageType"},"new":{"ref":"PageType"},"topHour":{"ref":"PageType"},"topDay":{"ref":"PageType"},"topWeek":{"ref":"PageType"},"topMonth":{"ref":"PageType"},"topYear":{"ref":"PageType"},"topAll":{"ref":"PageType"},"controversialHour":{"ref":"PageType"},"controversialDay":{"ref":"PageType"},"controversialWeek":{"ref":"PageType"},"controversialMonth":{"ref":"PageType"},"controversialYear":{"ref":"PageType"},"controversialAll":{"ref":"PageType"},"old":{"ref":"PageType"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Record_PostSortName-or-ReplySortName.string__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"hot":{"dataType":"string"},"new":{"dataType":"string"},"topHour":{"dataType":"string"},"topDay":{"dataType":"string"},"topWeek":{"dataType":"string"},"topMonth":{"dataType":"string"},"topYear":{"dataType":"string"},"topAll":{"dataType":"string"},"controversialHour":{"dataType":"string"},"controversialDay":{"dataType":"string"},"controversialWeek":{"dataType":"string"},"controversialMonth":{"dataType":"string"},"controversialYear":{"dataType":"string"},"controversialAll":{"dataType":"string"},"old":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pages": {
        "dataType": "refAlias",
        "type": {"ref":"PagesType","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Pages.pages-or-pageCids_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"pages":{"ref":"Partial_Record_PostSortName-or-ReplySortName.PageType__"},"pageCids":{"ref":"Partial_Record_PostSortName-or-ReplySortName.string__"}},"validators":{}},
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
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["image"]},{"dataType":"enum","enums":["text"]},{"dataType":"enum","enums":["video"]},{"dataType":"enum","enums":["audio"]},{"dataType":"enum","enums":["html"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubplebbitMetrics": {
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
    "Pick_CreateSubplebbitOptions.Exclude_keyofCreateSubplebbitOptions.database-or-signer__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"createdAt":{"dataType":"double"},"updatedAt":{"dataType":"double"},"encryption":{"ref":"SubplebbitEncryption"},"signature":{"ref":"SignatureType"},"title":{"dataType":"string"},"description":{"dataType":"string"},"roles":{"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"SubplebbitRole"}},"rules":{"dataType":"array","array":{"dataType":"string"}},"lastPostCid":{"dataType":"string"},"posts":{"dataType":"union","subSchemas":[{"ref":"Pages"},{"ref":"Pick_Pages.pages-or-pageCids_"}]},"pubsubTopic":{"dataType":"string"},"challengeTypes":{"dataType":"array","array":{"dataType":"refObject","ref":"ChallengeType"}},"metrics":{"ref":"SubplebbitMetrics"},"features":{"ref":"SubplebbitFeatures"},"suggested":{"ref":"SubplebbitSuggested"},"flairs":{"ref":"Record_FlairOwner.Flair-Array_"},"address":{"dataType":"string"}},"validators":{}},
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
            "posts": {"dataType":"union","subSchemas":[{"ref":"Pages"},{"ref":"Pick_Pages.pages-or-pageCids_"}],"required":true},
            "pubsubTopic": {"dataType":"string","required":true},
            "challengeTypes": {"dataType":"array","array":{"dataType":"refObject","ref":"ChallengeType"}},
            "metrics": {"ref":"SubplebbitMetrics"},
            "features": {"ref":"SubplebbitFeatures"},
            "suggested": {"ref":"SubplebbitSuggested"},
            "flairs": {"ref":"Record_FlairOwner.Flair-Array_"},
            "address": {"dataType":"string","required":true},
            "signer": {"ref":"SignerType"},
            "metricsCid": {"dataType":"string"},
            "protocolVersion": {"ref":"ProtocolVersion","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_SignerType.privateKey-or-type_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"type":{"dataType":"enum","enums":["rsa"],"required":true},"privateKey":{"dataType":"string","required":true}},"validators":{}},
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
            "posts": {"dataType":"union","subSchemas":[{"ref":"Pages"},{"ref":"Pick_Pages.pages-or-pageCids_"}]},
            "pubsubTopic": {"dataType":"string"},
            "challengeTypes": {"dataType":"array","array":{"dataType":"refObject","ref":"ChallengeType"}},
            "metrics": {"ref":"SubplebbitMetrics"},
            "features": {"ref":"SubplebbitFeatures"},
            "suggested": {"ref":"SubplebbitSuggested"},
            "flairs": {"ref":"Record_FlairOwner.Flair-Array_"},
            "address": {"dataType":"string"},
            "createdAt": {"dataType":"double"},
            "updatedAt": {"dataType":"double"},
            "signer": {"dataType":"union","subSchemas":[{"ref":"Pick_SignerType.privateKey-or-type_"},{"ref":"SignerType"}]},
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
            "posts": {"dataType":"union","subSchemas":[{"ref":"Pages"},{"ref":"Pick_Pages.pages-or-pageCids_"}]},
            "pubsubTopic": {"dataType":"string"},
            "challengeTypes": {"dataType":"array","array":{"dataType":"refObject","ref":"ChallengeType"}},
            "metrics": {"ref":"SubplebbitMetrics"},
            "features": {"ref":"SubplebbitFeatures"},
            "suggested": {"ref":"SubplebbitSuggested"},
            "flairs": {"ref":"Record_FlairOwner.Flair-Array_"},
            "address": {"dataType":"string"},
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
