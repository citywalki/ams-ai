import type { Schema as $Schema } from '../../_.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.UserFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.UserFilter}[] |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.UserFilter} |
* | **Path** | `UserFilter._and` |
* | **Nullability** | Optional |
* | **List** | Yes |
*/
export interface _and {
kind: "InputField",
name: "_and",
inlineType: [0, [1, ]],
namedType: $Schema.UserFilter,
type: readonly ($Schema.UserFilter['type'])[] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.UserFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.UserFilter}[] |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.UserFilter} |
* | **Path** | `UserFilter._or` |
* | **Nullability** | Optional |
* | **List** | Yes |
*/
export interface _or {
kind: "InputField",
name: "_or",
inlineType: [0, [1, ]],
namedType: $Schema.UserFilter,
type: readonly ($Schema.UserFilter['type'])[] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.UserFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.LongFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.UserFilter} |
* | **Path** | `UserFilter.id` |
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
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.UserFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.UserFilter} |
* | **Path** | `UserFilter.username` |
* | **Nullability** | Optional |
*/
export interface username {
kind: "InputField",
name: "username",
inlineType: [0, ],
namedType: $Schema.StringFilter,
type: $Schema.StringFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.UserFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.StringFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.UserFilter} |
* | **Path** | `UserFilter.email` |
* | **Nullability** | Optional |
*/
export interface email {
kind: "InputField",
name: "email",
inlineType: [0, ],
namedType: $Schema.StringFilter,
type: $Schema.StringFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.UserFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.EnumFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.UserFilter} |
* | **Path** | `UserFilter.status` |
* | **Nullability** | Optional |
*/
export interface status {
kind: "InputField",
name: "status",
inlineType: [0, ],
namedType: $Schema.EnumFilter,
type: $Schema.EnumFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.UserFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.DateTimeFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.UserFilter} |
* | **Path** | `UserFilter.createdAt` |
* | **Nullability** | Optional |
*/
export interface createdAt {
kind: "InputField",
name: "createdAt",
inlineType: [0, ],
namedType: $Schema.DateTimeFilter,
type: $Schema.DateTimeFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.UserFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.DateTimeFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.UserFilter} |
* | **Path** | `UserFilter.updatedAt` |
* | **Nullability** | Optional |
*/
export interface updatedAt {
kind: "InputField",
name: "updatedAt",
inlineType: [0, ],
namedType: $Schema.DateTimeFilter,
type: $Schema.DateTimeFilter['type'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.UserFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.RoleFilter} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Parent** | {@link $Schema.UserFilter} |
* | **Path** | `UserFilter.roles` |
* | **Nullability** | Optional |
*/
export interface roles {
kind: "InputField",
name: "roles",
inlineType: [0, ],
namedType: $Schema.RoleFilter,
type: $Schema.RoleFilter['type'] | null | undefined
}