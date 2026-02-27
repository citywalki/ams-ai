import type * as $Fields from './fields.js'

export * as BooleanFilter from './fields.js'

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
export interface BooleanFilter {
kind: "InputObject",
name: "BooleanFilter",
isAllFieldsNullable: true,
fields: {
_eq: $Fields._eq,
_neq: $Fields._neq,
_isNull: $Fields._isNull
},
type: {
_eq?: $Fields._eq['type'],
_neq?: $Fields._neq['type'],
_isNull?: $Fields._isNull['type']
}
}