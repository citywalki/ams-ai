import type * as $Fields from './fields.js'

export * as RoleConnection from './fields.js'

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
export interface RoleConnection {
kind: "Object",
name: "RoleConnection",
fields: {
__typename: $Fields.__typename,
content: $Fields.content,
totalElements: $Fields.totalElements,
totalPages: $Fields.totalPages,
page: $Fields.page,
size: $Fields.size
}
}