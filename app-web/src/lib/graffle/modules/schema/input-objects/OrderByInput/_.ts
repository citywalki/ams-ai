import type * as $Fields from './fields.js'

export * as OrderByInput from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | InputObject}.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Fields** | 2 |
* | **All Fields Nullable** | Yes |
*/
export interface OrderByInput {
kind: "InputObject",
name: "OrderByInput",
isAllFieldsNullable: true,
fields: {
field: $Fields.field,
direction: $Fields.direction
},
type: {
field: $Fields.field['type'],
direction?: $Fields.direction['type']
}
}