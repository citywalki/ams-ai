import type { Schema as $Schema } from '../../_.js'

/**
* GraphQL `__typename` meta-field. The name of the object type currently being queried.
*
* Type: `"DictItemConnection"`
*
* {@link https://graphql.org/learn/queries/#meta-fields | GraphQL __typename documentation}
*/
export interface __typename {
kind: "OutputField",
name: "__typename",
arguments: {},
inlineType: [1],
namedType: {
kind: "__typename",
value: "DictItemConnection"
}
}

/**
* GraphQL {@link https://graphql.org/learn/queries/#fields | output field} ↗ on type {@link $Schema.DictItemConnection}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.DictItem}[]! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | OutputObject ↗} |
* | **Parent** | {@link $Schema.DictItemConnection} |
* | **Path** | `DictItemConnection.content` |
* | **Nullability** | Required |
* | **List** | Yes |
*/
export interface content {
kind: "OutputField",
name: "content",
arguments: {},
inlineType: [1, [1, ]],
namedType: $Schema.DictItem
}

/**
* GraphQL {@link https://graphql.org/learn/queries/#fields | output field} ↗ on type {@link $Schema.DictItemConnection}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Long}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlscalartype | ScalarCustom ↗} |
* | **Parent** | {@link $Schema.DictItemConnection} |
* | **Path** | `DictItemConnection.totalElements` |
* | **Nullability** | Required |
*/
export interface totalElements {
kind: "OutputField",
name: "totalElements",
arguments: {},
inlineType: [1, ],
namedType: $Schema.Long
}

/**
* GraphQL {@link https://graphql.org/learn/queries/#fields | output field} ↗ on type {@link $Schema.DictItemConnection}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Int}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#scalars | ScalarStandard ↗} |
* | **Parent** | {@link $Schema.DictItemConnection} |
* | **Path** | `DictItemConnection.totalPages` |
* | **Nullability** | Required |
*/
export interface totalPages {
kind: "OutputField",
name: "totalPages",
arguments: {},
inlineType: [1, ],
namedType: $Schema.Int
}

/**
* GraphQL {@link https://graphql.org/learn/queries/#fields | output field} ↗ on type {@link $Schema.DictItemConnection}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Int}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#scalars | ScalarStandard ↗} |
* | **Parent** | {@link $Schema.DictItemConnection} |
* | **Path** | `DictItemConnection.page` |
* | **Nullability** | Required |
*/
export interface page {
kind: "OutputField",
name: "page",
arguments: {},
inlineType: [1, ],
namedType: $Schema.Int
}

/**
* GraphQL {@link https://graphql.org/learn/queries/#fields | output field} ↗ on type {@link $Schema.DictItemConnection}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Int}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#scalars | ScalarStandard ↗} |
* | **Parent** | {@link $Schema.DictItemConnection} |
* | **Path** | `DictItemConnection.size` |
* | **Nullability** | Required |
*/
export interface size {
kind: "OutputField",
name: "size",
arguments: {},
inlineType: [1, ],
namedType: $Schema.Int
}
