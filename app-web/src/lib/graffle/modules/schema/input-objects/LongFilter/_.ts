import type * as $Fields from './fields.js'

export * as LongFilter from './fields.js'

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
export interface LongFilter {
kind: "InputObject",
name: "LongFilter",
isAllFieldsNullable: true,
fields: {
_eq: $Fields._eq,
_neq: $Fields._neq,
_gt: $Fields._gt,
_gte: $Fields._gte,
_lt: $Fields._lt,
_lte: $Fields._lte,
_in: $Fields._in,
_nin: $Fields._nin,
_isNull: $Fields._isNull
},
type: {
_eq?: $Fields._eq['type'],
_neq?: $Fields._neq['type'],
_gt?: $Fields._gt['type'],
_gte?: $Fields._gte['type'],
_lt?: $Fields._lt['type'],
_lte?: $Fields._lte['type'],
_in?: $Fields._in['type'],
_nin?: $Fields._nin['type'],
_isNull?: $Fields._isNull['type']
}
}