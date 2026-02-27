import type * as $Fields from './fields.js'

export * as Role from './fields.js'

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
export interface Role {
kind: "Object",
name: "Role",
fields: {
__typename: $Fields.__typename,
id: $Fields.id,
code: $Fields.code,
name: $Fields.name,
description: $Fields.description,
permissions: $Fields.permissions
}
}