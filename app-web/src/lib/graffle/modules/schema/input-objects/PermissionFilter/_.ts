import type * as $Fields from './fields.js'

export * as PermissionFilter from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | InputObject}.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Fields** | 3 |
* | **All Fields Nullable** | Yes |
*/
export interface PermissionFilter {
kind: "InputObject",
name: "PermissionFilter",
isAllFieldsNullable: true,
fields: {
id: $Fields.id,
code: $Fields.code,
name: $Fields.name
},
type: {
id?: $Fields.id['type'],
code?: $Fields.code['type'],
name?: $Fields.name['type']
}
}