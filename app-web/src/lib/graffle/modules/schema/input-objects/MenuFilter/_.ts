import type * as $Fields from './fields.js'

export * as MenuFilter from './fields.js'

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
export interface MenuFilter {
kind: "InputObject",
name: "MenuFilter",
isAllFieldsNullable: true,
fields: {
_and: $Fields._and,
_or: $Fields._or,
id: $Fields.id,
key: $Fields.key,
label: $Fields.label,
route: $Fields.route,
parentId: $Fields.parentId,
menuType: $Fields.menuType,
isVisible: $Fields.isVisible
},
type: {
_and?: $Fields._and['type'],
_or?: $Fields._or['type'],
id?: $Fields.id['type'],
key?: $Fields.key['type'],
label?: $Fields.label['type'],
route?: $Fields.route['type'],
parentId?: $Fields.parentId['type'],
menuType?: $Fields.menuType['type'],
isVisible?: $Fields.isVisible['type']
}
}