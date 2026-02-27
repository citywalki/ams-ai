import type * as $Fields from './fields.js'

export * as StringFilter from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | InputObject}.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Fields** | 9 |
* | **All Fields Nullable** | Yes |
*/
export interface StringFilter {
kind: "InputObject",
name: "StringFilter",
isAllFieldsNullable: true,
fields: {
_eq: $Fields._eq,
_neq: $Fields._neq,
_like: $Fields._like,
_ilike: $Fields._ilike,
_startsWith: $Fields._startsWith,
_endsWith: $Fields._endsWith,
_in: $Fields._in,
_nin: $Fields._nin,
_isNull: $Fields._isNull
},
type: {
_eq?: $Fields._eq['type'],
_neq?: $Fields._neq['type'],
_like?: $Fields._like['type'],
_ilike?: $Fields._ilike['type'],
_startsWith?: $Fields._startsWith['type'],
_endsWith?: $Fields._endsWith['type'],
_in?: $Fields._in['type'],
_nin?: $Fields._nin['type'],
_isNull?: $Fields._isNull['type']
}
}