import type { Schema as $Schema } from '../../_.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictItemFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.DictItemFilter}[] |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictItemFilter} |
* | **Path** | `DictItemFilter._and` |
* | **Nullability** | Optional |
* | **List** | Yes |
*/
export interface _and {
kind: "InputField",
name: "_and",
inlineType: [0, [1, ]],
namedType: $Schema.DictItemFilter,
type: readonly ($Schema.DictItemFilter['type'])[] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictItemFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.DictItemFilter}[] |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictItemFilter} |
* | **Path** | `DictItemFilter._or` |
* | **Nullability** | Optional |
* | **List** | Yes |
*/
export interface _or {
kind: "InputField",
name: "_or",
inlineType: [0, [1, ]],
namedType: $Schema.DictItemFilter,
type: readonly ($Schema.DictItemFilter['type'])[] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictItemFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.LongFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictItemFilter} |
* | **Path** | `DictItemFilter.id` |
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
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictItemFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.LongFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictItemFilter} |
* | **Path** | `DictItemFilter.categoryId` |
* | **Nullability** | Optional |
*/
export interface categoryId {
kind: "InputField",
name: "categoryId",
inlineType: [0, ],
namedType: $Schema.LongFilter,
type: $Schema.LongFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictItemFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.LongFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictItemFilter} |
* | **Path** | `DictItemFilter.parentId` |
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
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictItemFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictItemFilter} |
* | **Path** | `DictItemFilter.code` |
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
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictItemFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictItemFilter} |
* | **Path** | `DictItemFilter.name` |
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
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictItemFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictItemFilter} |
* | **Path** | `DictItemFilter.value` |
* | **Nullability** | Optional |
*/
export interface value {
kind: "InputField",
name: "value",
inlineType: [0, ],
namedType: $Schema.StringFilter,
type: $Schema.StringFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictItemFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.IntFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictItemFilter} |
* | **Path** | `DictItemFilter.sort` |
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
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.DictItemFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.IntFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.DictItemFilter} |
* | **Path** | `DictItemFilter.status` |
* | **Nullability** | Optional |
*/
export interface status {
kind: "InputField",
name: "status",
inlineType: [0, ],
namedType: $Schema.IntFilter,
type: $Schema.IntFilter['type'] | null | undefined
}