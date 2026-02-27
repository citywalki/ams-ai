import type * as $Fields from './fields.js'

export * as DictCategory from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#object-types | Object} type.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | Object ↗} |
* | **Fields** | 10 |
*/
export interface DictCategory {
kind: "Object",
name: "DictCategory",
fields: {
__typename: $Fields.__typename,
id: $Fields.id,
code: $Fields.code,
name: $Fields.name,
description: $Fields.description,
sort: $Fields.sort,
status: $Fields.status,
tenant: $Fields.tenant,
createdAt: $Fields.createdAt,
updatedAt: $Fields.updatedAt,
itemCount: $Fields.itemCount
}
}