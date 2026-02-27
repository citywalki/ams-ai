import type { Schema as $Schema } from '../../_.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.IntFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Int} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#scalars | ScalarStandard ↗} |
* | **Parent** | {@link $Schema.IntFilter} |
* | **Path** | `IntFilter._eq` |
* | **Nullability** | Optional |
*/
export interface _eq {
kind: "InputField",
name: "_eq",
inlineType: [0, ],
namedType: $Schema.Int,
type: $Schema.Int['codec']['_typeDecoded'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.IntFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Int} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#scalars | ScalarStandard ↗} |
* | **Parent** | {@link $Schema.IntFilter} |
* | **Path** | `IntFilter._neq` |
* | **Nullability** | Optional |
*/
export interface _neq {
kind: "InputField",
name: "_neq",
inlineType: [0, ],
namedType: $Schema.Int,
type: $Schema.Int['codec']['_typeDecoded'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.IntFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Int} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#scalars | ScalarStandard ↗} |
* | **Parent** | {@link $Schema.IntFilter} |
* | **Path** | `IntFilter._gt` |
* | **Nullability** | Optional |
*/
export interface _gt {
kind: "InputField",
name: "_gt",
inlineType: [0, ],
namedType: $Schema.Int,
type: $Schema.Int['codec']['_typeDecoded'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.IntFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Int} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#scalars | ScalarStandard ↗} |
* | **Parent** | {@link $Schema.IntFilter} |
* | **Path** | `IntFilter._gte` |
* | **Nullability** | Optional |
*/
export interface _gte {
kind: "InputField",
name: "_gte",
inlineType: [0, ],
namedType: $Schema.Int,
type: $Schema.Int['codec']['_typeDecoded'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.IntFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Int} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#scalars | ScalarStandard ↗} |
* | **Parent** | {@link $Schema.IntFilter} |
* | **Path** | `IntFilter._lt` |
* | **Nullability** | Optional |
*/
export interface _lt {
kind: "InputField",
name: "_lt",
inlineType: [0, ],
namedType: $Schema.Int,
type: $Schema.Int['codec']['_typeDecoded'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.IntFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Int} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#scalars | ScalarStandard ↗} |
* | **Parent** | {@link $Schema.IntFilter} |
* | **Path** | `IntFilter._lte` |
* | **Nullability** | Optional |
*/
export interface _lte {
kind: "InputField",
name: "_lte",
inlineType: [0, ],
namedType: $Schema.Int,
type: $Schema.Int['codec']['_typeDecoded'] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.IntFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Int}[] |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#scalars | ScalarStandard ↗} |
* | **Parent** | {@link $Schema.IntFilter} |
* | **Path** | `IntFilter._in` |
* | **Nullability** | Optional |
* | **List** | Yes |
*/
export interface _in {
kind: "InputField",
name: "_in",
inlineType: [0, [1, ]],
namedType: $Schema.Int,
type: readonly ($Schema.Int['codec']['_typeDecoded'])[] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.IntFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Int}[] |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#scalars | ScalarStandard ↗} |
* | **Parent** | {@link $Schema.IntFilter} |
* | **Path** | `IntFilter._nin` |
* | **Nullability** | Optional |
* | **List** | Yes |
*/
export interface _nin {
kind: "InputField",
name: "_nin",
inlineType: [0, [1, ]],
namedType: $Schema.Int,
type: readonly ($Schema.Int['codec']['_typeDecoded'])[] | null | undefined
}
/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | input field} ↗ on type {@link $Schema.IntFilter}.
*
* # Info
*
* | | |
* | - | - |
* | **Type** | {@link $Schema.Boolean} |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#scalars | ScalarStandard ↗} |
* | **Parent** | {@link $Schema.IntFilter} |
* | **Path** | `IntFilter._isNull` |
* | **Nullability** | Optional |
*/
export interface _isNull {
kind: "InputField",
name: "_isNull",
inlineType: [0, ],
namedType: $Schema.Boolean,
type: $Schema.Boolean['codec']['_typeDecoded'] | null | undefined
}