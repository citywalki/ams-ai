import type * as $Fields from './fields.js'

export * as EnumFilter from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | InputObject}.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Fields** | 5 |
* | **All Fields Nullable** | Yes |
*/
export interface EnumFilter {
kind: "InputObject",
name: "EnumFilter",
isAllFieldsNullable: true,
fields: {
_eq: $Fields._eq,
_neq: $Fields._neq,
_in: $Fields._in,
_nin: $Fields._nin,
_isNull: $Fields._isNull
},
type: {
_eq?: $Fields._eq['type'],
_neq?: $Fields._neq['type'],
_in?: $Fields._in['type'],
_nin?: $Fields._nin['type'],
_isNull?: $Fields._isNull['type']
}
}