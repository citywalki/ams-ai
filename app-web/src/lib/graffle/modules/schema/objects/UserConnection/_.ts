import type * as $Fields from './fields.js'

export * as UserConnection from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#object-types | Object} type.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | Object ↗} |
* | **Fields** | 5 |
*/
export interface UserConnection {
kind: "Object",
name: "UserConnection",
fields: {
__typename: $Fields.__typename,
content: $Fields.content,
totalElements: $Fields.totalElements,
totalPages: $Fields.totalPages,
page: $Fields.page,
size: $Fields.size
}
}