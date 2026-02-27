import type * as $Fields from './fields.js'

export * as Menu from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#object-types | Object} type.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | Object ↗} |
* | **Fields** | 15 |
*/
export interface Menu {
kind: "Object",
name: "Menu",
fields: {
__typename: $Fields.__typename,
id: $Fields.id,
key: $Fields.key,
label: $Fields.label,
route: $Fields.route,
parentId: $Fields.parentId,
icon: $Fields.icon,
sortOrder: $Fields.sortOrder,
isVisible: $Fields.isVisible,
menuType: $Fields.menuType,
rolesAllowed: $Fields.rolesAllowed,
tenant: $Fields.tenant,
createdAt: $Fields.createdAt,
updatedAt: $Fields.updatedAt,
metadata: $Fields.metadata,
children: $Fields.children
}
}