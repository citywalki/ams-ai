import type * as $Fields from './fields.js'

export * as Permission from './fields.js'

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
export interface Permission {
kind: "Object",
name: "Permission",
fields: {
__typename: $Fields.__typename,
id: $Fields.id,
code: $Fields.code,
name: $Fields.name,
description: $Fields.description,
menuId: $Fields.menuId,
sortOrder: $Fields.sortOrder,
buttonType: $Fields.buttonType
}
}