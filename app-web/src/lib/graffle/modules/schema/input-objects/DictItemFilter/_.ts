import type * as $Fields from './fields.js'

export * as DictItemFilter from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | InputObject}.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Fields** | 10 |
* | **All Fields Nullable** | Yes |
*/
export interface DictItemFilter {
kind: "InputObject",
name: "DictItemFilter",
isAllFieldsNullable: true,
fields: {
_and: $Fields._and,
_or: $Fields._or,
id: $Fields.id,
categoryId: $Fields.categoryId,
parentId: $Fields.parentId,
code: $Fields.code,
name: $Fields.name,
value: $Fields.value,
sort: $Fields.sort,
status: $Fields.status
},
type: {
_and?: $Fields._and['type'],
_or?: $Fields._or['type'],
id?: $Fields.id['type'],
categoryId?: $Fields.categoryId['type'],
parentId?: $Fields.parentId['type'],
code?: $Fields.code['type'],
name?: $Fields.name['type'],
value?: $Fields.value['type'],
sort?: $Fields.sort['type'],
status?: $Fields.status['type']
}
}