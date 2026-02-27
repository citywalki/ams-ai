import type { Schema as $Schema } from '../../_.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.RoleFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.RoleFilter}[] |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.RoleFilter} |
* | **Path** | `RoleFilter._and` |
* | **Nullability** | Optional |
* | **List** | Yes |
*/
export interface _and {
kind: "InputField",
name: "_and",
inlineType: [0, [1, ]],
namedType: $Schema.RoleFilter,
type: readonly ($Schema.RoleFilter['type'])[] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.RoleFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.RoleFilter}[] |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.RoleFilter} |
* | **Path** | `RoleFilter._or` |
* | **Nullability** | Optional |
* | **List** | Yes |
*/
export interface _or {
kind: "InputField",
name: "_or",
inlineType: [0, [1, ]],
namedType: $Schema.RoleFilter,
type: readonly ($Schema.RoleFilter['type'])[] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.RoleFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.LongFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.RoleFilter} |
* | **Path** | `RoleFilter.id` |
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
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.RoleFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.RoleFilter} |
* | **Path** | `RoleFilter.code` |
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
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.RoleFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.RoleFilter} |
* | **Path** | `RoleFilter.name` |
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
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.RoleFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.RoleFilter} |
* | **Path** | `RoleFilter.description` |
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
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.RoleFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.PermissionFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.RoleFilter} |
* | **Path** | `RoleFilter.permissions` |
* | **Nullability** | Optional |
*/
export interface permissions {
kind: "InputField",
name: "permissions",
inlineType: [0, ],
namedType: $Schema.PermissionFilter,
type: $Schema.PermissionFilter['type'] | null | undefined
}