import type * as $Fields from './fields.js'

export * as DictItem from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#object-types | Object} type.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | Object ↗} |
* | **Fields** | 13 |
*/
export interface DictItem {
kind: "Object",
name: "DictItem",
fields: {
__typename: $Fields.__typename,
id: $Fields.id,
categoryId: $Fields.categoryId,
parentId: $Fields.parentId,
code: $Fields.code,
name: $Fields.name,
value: $Fields.value,
sort: $Fields.sort,
status: $Fields.status,
remark: $Fields.remark,
tenant: $Fields.tenant,
createdAt: $Fields.createdAt,
updatedAt: $Fields.updatedAt,
children: $Fields.children
}
}