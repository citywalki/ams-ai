import type * as $Fields from './fields.js'

export * as User from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#object-types | Object} type.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | Object ↗} |
* | **Fields** | 7 |
*/
export interface User {
kind: "Object",
name: "User",
fields: {
__typename: $Fields.__typename,
id: $Fields.id,
username: $Fields.username,
email: $Fields.email,
status: $Fields.status,
roles: $Fields.roles,
createdAt: $Fields.createdAt,
updatedAt: $Fields.updatedAt
}
}