import type { Schema as $Schema } from '../../_.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.MenuFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.MenuFilter}[] |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.MenuFilter} |
* | **Path** | `MenuFilter._and` |
* | **Nullability** | Optional |
* | **List** | Yes |
*/
export interface _and {
kind: "InputField",
name: "_and",
inlineType: [0, [1, ]],
namedType: $Schema.MenuFilter,
type: readonly ($Schema.MenuFilter['type'])[] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.MenuFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.MenuFilter}[] |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.MenuFilter} |
* | **Path** | `MenuFilter._or` |
* | **Nullability** | Optional |
* | **List** | Yes |
*/
export interface _or {
kind: "InputField",
name: "_or",
inlineType: [0, [1, ]],
namedType: $Schema.MenuFilter,
type: readonly ($Schema.MenuFilter['type'])[] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.MenuFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.LongFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.MenuFilter} |
* | **Path** | `MenuFilter.id` |
* | **Nullability** | Optional |
*/
export interface id {
kind: "InputField",
name: "id",
inlineType: [0, ],
namedType: $Schema.LongFilter,
type: $Schema.LongFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.MenuFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.MenuFilter} |
* | **Path** | `MenuFilter.key` |
* | **Nullability** | Optional |
*/
export interface key {
kind: "InputField",
name: "key",
inlineType: [0, ],
namedType: $Schema.StringFilter,
type: $Schema.StringFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.MenuFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.MenuFilter} |
* | **Path** | `MenuFilter.label` |
* | **Nullability** | Optional |
*/
export interface label {
kind: "InputField",
name: "label",
inlineType: [0, ],
namedType: $Schema.StringFilter,
type: $Schema.StringFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.MenuFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.MenuFilter} |
* | **Path** | `MenuFilter.route` |
* | **Nullability** | Optional |
*/
export interface route {
kind: "InputField",
name: "route",
inlineType: [0, ],
namedType: $Schema.StringFilter,
type: $Schema.StringFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.MenuFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.LongFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.MenuFilter} |
* | **Path** | `MenuFilter.parentId` |
* | **Nullability** | Optional |
*/
export interface parentId {
kind: "InputField",
name: "parentId",
inlineType: [0, ],
namedType: $Schema.LongFilter,
type: $Schema.LongFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.MenuFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.EnumFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.MenuFilter} |
* | **Path** | `MenuFilter.menuType` |
* | **Nullability** | Optional |
*/
export interface menuType {
kind: "InputField",
name: "menuType",
inlineType: [0, ],
namedType: $Schema.EnumFilter,
type: $Schema.EnumFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.MenuFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.BooleanFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.MenuFilter} |
* | **Path** | `MenuFilter.isVisible` |
* | **Nullability** | Optional |
*/
export interface isVisible {
kind: "InputField",
name: "isVisible",
inlineType: [0, ],
namedType: $Schema.BooleanFilter,
type: $Schema.BooleanFilter['type'] | null | undefined
}