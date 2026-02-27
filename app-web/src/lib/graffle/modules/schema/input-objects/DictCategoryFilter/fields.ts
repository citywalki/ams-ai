import type { Schema as $Schema } from '../../_.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictCategoryFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.DictCategoryFilter}[] |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictCategoryFilter} |
* | **Path** | `DictCategoryFilter._and` |
* | **Nullability** | Optional |
* | **List** | Yes |
*/
export interface _and {
kind: "InputField",
name: "_and",
inlineType: [0, [1, ]],
namedType: $Schema.DictCategoryFilter,
type: readonly ($Schema.DictCategoryFilter['type'])[] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictCategoryFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.DictCategoryFilter}[] |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictCategoryFilter} |
* | **Path** | `DictCategoryFilter._or` |
* | **Nullability** | Optional |
* | **List** | Yes |
*/
export interface _or {
kind: "InputField",
name: "_or",
inlineType: [0, [1, ]],
namedType: $Schema.DictCategoryFilter,
type: readonly ($Schema.DictCategoryFilter['type'])[] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictCategoryFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.LongFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictCategoryFilter} |
* | **Path** | `DictCategoryFilter.id` |
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
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictCategoryFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictCategoryFilter} |
* | **Path** | `DictCategoryFilter.code` |
* | **Nullability** | Optional |
*/
export interface code {
kind: "InputField",
name: "code",
inlineType: [0, ],
namedType: $Schema.StringFilter,
type: $Schema.StringFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictCategoryFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictCategoryFilter} |
* | **Path** | `DictCategoryFilter.name` |
* | **Nullability** | Optional |
*/
export interface name {
kind: "InputField",
name: "name",
inlineType: [0, ],
namedType: $Schema.StringFilter,
type: $Schema.StringFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictCategoryFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictCategoryFilter} |
* | **Path** | `DictCategoryFilter.description` |
* | **Nullability** | Optional |
*/
export interface description {
kind: "InputField",
name: "description",
inlineType: [0, ],
namedType: $Schema.StringFilter,
type: $Schema.StringFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictCategoryFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.IntFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictCategoryFilter} |
* | **Path** | `DictCategoryFilter.sort` |
* | **Nullability** | Optional |
*/
export interface sort {
kind: "InputField",
name: "sort",
inlineType: [0, ],
namedType: $Schema.IntFilter,
type: $Schema.IntFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictCategoryFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.IntFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictCategoryFilter} |
* | **Path** | `DictCategoryFilter.status` |
* | **Nullability** | Optional |
*/
export interface status {
kind: "InputField",
name: "status",
inlineType: [0, ],
namedType: $Schema.IntFilter,
type: $Schema.IntFilter['type'] | null | undefined
}