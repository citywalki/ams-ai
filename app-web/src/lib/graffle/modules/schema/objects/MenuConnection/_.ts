import type * as $Fields from './fields.js'

export * as MenuConnection from './fields.js'

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
export interface MenuConnection {
kind: "Object",
name: "MenuConnection",
fields: {
__typename: $Fields.__typename,
content: $Fields.content,
totalElements: $Fields.totalElements,
totalPages: $Fields.totalPages,
page: $Fields.page,
size: $Fields.size
}
}