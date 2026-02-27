import type * as $Fields from './fields.js'

export * as DictCategoryFilter from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | InputObject}.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Fields** | 8 |
* | **All Fields Nullable** | Yes |
*/
export interface DictCategoryFilter {
kind: "InputObject",
name: "DictCategoryFilter",
isAllFieldsNullable: true,
fields: {
_and: $Fields._and,
_or: $Fields._or,
id: $Fields.id,
code: $Fields.code,
name: $Fields.name,
description: $Fields.description,
sort: $Fields.sort,
status: $Fields.status
},
type: {
_and?: $Fields._and['type'],
_or?: $Fields._or['type'],
id?: $Fields.id['type'],
code?: $Fields.code['type'],
name?: $Fields.name['type'],
description?: $Fields.description['type'],
sort?: $Fields.sort['type'],
status?: $Fields.status['type']
}
}