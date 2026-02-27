import type { Schema as $Schema } from '../../_.js'

/**
* GraphQL `__typename` meta-field. The name of the object type currently being queried.
*
* Type: `"Query"`
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
value: "Query"
}
}

/**
* GraphQL {@link https://graphql.org/learn/queries/#fields | output field} ↗ on type {@link $Schema.Query}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.UserConnection}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | OutputObject ↗} |
* | **Parent** | {@link $Schema.Query} |
* | **Path** | `Query.users` |
* | **Nullability** | Required |
* | **Arguments** | 4 |
*/
export interface users {
kind: "OutputField",
name: "users",
arguments: {
where: {
kind: "InputField",
name: "where",
inlineType: [0, ],
namedType: $Schema.UserFilter
},
orderBy: {
kind: "InputField",
name: "orderBy",
inlineType: [0, [0, ]],
namedType: $Schema.OrderByInput
},
page: {
kind: "InputField",
name: "page",
inlineType: [0, ],
namedType: $Schema.Int
},
size: {
kind: "InputField",
name: "size",
inlineType: [0, ],
namedType: $Schema.Int
}
},
inlineType: [1, ],
namedType: $Schema.UserConnection
}

/**
* GraphQL {@link https://graphql.org/learn/queries/#fields | output field} ↗ on type {@link $Schema.Query}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.RoleConnection}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | OutputObject ↗} |
* | **Parent** | {@link $Schema.Query} |
* | **Path** | `Query.roles` |
* | **Nullability** | Required |
* | **Arguments** | 4 |
*/
export interface roles {
kind: "OutputField",
name: "roles",
arguments: {
where: {
kind: "InputField",
name: "where",
inlineType: [0, ],
namedType: $Schema.RoleFilter
},
orderBy: {
kind: "InputField",
name: "orderBy",
inlineType: [0, [0, ]],
namedType: $Schema.OrderByInput
},
page: {
kind: "InputField",
name: "page",
inlineType: [0, ],
namedType: $Schema.Int
},
size: {
kind: "InputField",
name: "size",
inlineType: [0, ],
namedType: $Schema.Int
}
},
inlineType: [1, ],
namedType: $Schema.RoleConnection
}

/**
* GraphQL {@link https://graphql.org/learn/queries/#fields | output field} ↗ on type {@link $Schema.Query}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.MenuConnection}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | OutputObject ↗} |
* | **Parent** | {@link $Schema.Query} |
* | **Path** | `Query.menus` |
* | **Nullability** | Required |
* | **Arguments** | 4 |
*/
export interface menus {
kind: "OutputField",
name: "menus",
arguments: {
where: {
kind: "InputField",
name: "where",
inlineType: [0, ],
namedType: $Schema.MenuFilter
},
orderBy: {
kind: "InputField",
name: "orderBy",
inlineType: [0, [0, ]],
namedType: $Schema.OrderByInput
},
page: {
kind: "InputField",
name: "page",
inlineType: [0, ],
namedType: $Schema.Int
},
size: {
kind: "InputField",
name: "size",
inlineType: [0, ],
namedType: $Schema.Int
}
},
inlineType: [1, ],
namedType: $Schema.MenuConnection
}

/**
* GraphQL {@link https://graphql.org/learn/queries/#fields | output field} ↗ on type {@link $Schema.Query}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.DictCategoryConnection}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | OutputObject ↗} |
* | **Parent** | {@link $Schema.Query} |
* | **Path** | `Query.dictCategories` |
* | **Nullability** | Required |
* | **Arguments** | 4 |
*/
export interface dictCategories {
kind: "OutputField",
name: "dictCategories",
arguments: {
where: {
kind: "InputField",
name: "where",
inlineType: [0, ],
namedType: $Schema.DictCategoryFilter
},
orderBy: {
kind: "InputField",
name: "orderBy",
inlineType: [0, [0, ]],
namedType: $Schema.OrderByInput
},
page: {
kind: "InputField",
name: "page",
inlineType: [0, ],
namedType: $Schema.Int
},
size: {
kind: "InputField",
name: "size",
inlineType: [0, ],
namedType: $Schema.Int
}
},
inlineType: [1, ],
namedType: $Schema.DictCategoryConnection
}

/**
* GraphQL {@link https://graphql.org/learn/queries/#fields | output field} ↗ on type {@link $Schema.Query}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.DictItemConnection}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | OutputObject ↗} |
* | **Parent** | {@link $Schema.Query} |
* | **Path** | `Query.dictItems` |
* | **Nullability** | Required |
* | **Arguments** | 4 |
*/
export interface dictItems {
kind: "OutputField",
name: "dictItems",
arguments: {
where: {
kind: "InputField",
name: "where",
inlineType: [0, ],
namedType: $Schema.DictItemFilter
},
orderBy: {
kind: "InputField",
name: "orderBy",
inlineType: [0, [0, ]],
namedType: $Schema.OrderByInput
},
page: {
kind: "InputField",
name: "page",
inlineType: [0, ],
namedType: $Schema.Int
},
size: {
kind: "InputField",
name: "size",
inlineType: [0, ],
namedType: $Schema.Int
}
},
inlineType: [1, ],
namedType: $Schema.DictItemConnection
}
