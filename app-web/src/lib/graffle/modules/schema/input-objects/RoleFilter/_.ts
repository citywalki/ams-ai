import type * as $Fields from './fields.js'

export * as RoleFilter from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | InputObject}.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Fields** | 7 |
* | **All Fields Nullable** | Yes |
*/
export interface RoleFilter {
kind: "InputObject",
name: "RoleFilter",
isAllFieldsNullable: true,
fields: {
_and: $Fields._and,
_or: $Fields._or,
id: $Fields.id,
code: $Fields.code,
name: $Fields.name,
description: $Fields.description,
permissions: $Fields.permissions
},
type: {
_and?: $Fields._and['type'],
_or?: $Fields._or['type'],
id?: $Fields.id['type'],
code?: $Fields.code['type'],
name?: $Fields.name['type'],
description?: $Fields.description['type'],
permissions?: $Fields.permissions['type']
}
}