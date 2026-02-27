import type * as $$Utilities from 'graffle/utilities-for-generated'
import type { GraphqlKit } from 'graffle/utilities-for-generated'
import type { $DefaultSelectionContext } from '../../_context.js'
import type * as $Named from '../../$named.js'
import type * as $Scalars from '../../scalars/_.js'

export type users<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> = users.$SelectionSet<_$Context>

export namespace users {
export interface $SelectionSet<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> extends GraphqlKit.Document.Object.Select.Bases.Base, $Named.UserConnection<_$Context> {
/**
* Arguments for `users` field. No arguments are required so you may omit this.
*/
readonly $?: $Arguments<_$Context>
}

export interface $Arguments<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> {
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `UserFilter` |
* | **Parent** | {@link $NamedTypes.$Query}.users |
* | **Path** | `Query.users(where)` |
* | **Nullability** | Optional |
*/
readonly where?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.UserFilter<_$Context> | null | undefined>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `[OrderByInput]` |
* | **Parent** | {@link $NamedTypes.$Query}.users |
* | **Path** | `Query.users(orderBy)` |
* | **Nullability** | Optional |
*/
readonly orderBy?: GraphqlKit.Document.Object.Var.MaybeSchemaful<Array<GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.OrderByInput<_$Context> | null | undefined>> | null | undefined>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `Int` |
* | **Parent** | {@link $NamedTypes.$Query}.users |
* | **Path** | `Query.users(page)` |
* | **Nullability** | Optional |
* | **Default** | `0` |
*/
readonly page?: $Scalars.Int<_$Context>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `Int` |
* | **Parent** | {@link $NamedTypes.$Query}.users |
* | **Path** | `Query.users(size)` |
* | **Nullability** | Optional |
* | **Default** | `20` |
*/
readonly size?: $Scalars.Int<_$Context>
}

/**
* This is the "expanded" version of the `users` type. It is identical except for the fact
* that IDEs will display its contents (a union type) directly, rather than the name of this type.
* In some cases, this is a preferable DX, making the types easier to read for users.
*/
export type $Expanded<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> = $$Utilities.Simplify<$SelectionSet<_$Context>>
}


export type roles<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> = roles.$SelectionSet<_$Context>

export namespace roles {
export interface $SelectionSet<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> extends GraphqlKit.Document.Object.Select.Bases.Base, $Named.RoleConnection<_$Context> {
/**
* Arguments for `roles` field. No arguments are required so you may omit this.
*/
readonly $?: $Arguments<_$Context>
}

export interface $Arguments<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> {
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `RoleFilter` |
* | **Parent** | {@link $NamedTypes.$Query}.roles |
* | **Path** | `Query.roles(where)` |
* | **Nullability** | Optional |
*/
readonly where?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.RoleFilter<_$Context> | null | undefined>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `[OrderByInput]` |
* | **Parent** | {@link $NamedTypes.$Query}.roles |
* | **Path** | `Query.roles(orderBy)` |
* | **Nullability** | Optional |
*/
readonly orderBy?: GraphqlKit.Document.Object.Var.MaybeSchemaful<Array<GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.OrderByInput<_$Context> | null | undefined>> | null | undefined>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `Int` |
* | **Parent** | {@link $NamedTypes.$Query}.roles |
* | **Path** | `Query.roles(page)` |
* | **Nullability** | Optional |
* | **Default** | `0` |
*/
readonly page?: $Scalars.Int<_$Context>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `Int` |
* | **Parent** | {@link $NamedTypes.$Query}.roles |
* | **Path** | `Query.roles(size)` |
* | **Nullability** | Optional |
* | **Default** | `20` |
*/
readonly size?: $Scalars.Int<_$Context>
}

/**
* This is the "expanded" version of the `roles` type. It is identical except for the fact
* that IDEs will display its contents (a union type) directly, rather than the name of this type.
* In some cases, this is a preferable DX, making the types easier to read for users.
*/
export type $Expanded<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> = $$Utilities.Simplify<$SelectionSet<_$Context>>
}


export type menus<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> = menus.$SelectionSet<_$Context>

export namespace menus {
export interface $SelectionSet<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> extends GraphqlKit.Document.Object.Select.Bases.Base, $Named.MenuConnection<_$Context> {
/**
* Arguments for `menus` field. No arguments are required so you may omit this.
*/
readonly $?: $Arguments<_$Context>
}

export interface $Arguments<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> {
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `MenuFilter` |
* | **Parent** | {@link $NamedTypes.$Query}.menus |
* | **Path** | `Query.menus(where)` |
* | **Nullability** | Optional |
*/
readonly where?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.MenuFilter<_$Context> | null | undefined>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `[OrderByInput]` |
* | **Parent** | {@link $NamedTypes.$Query}.menus |
* | **Path** | `Query.menus(orderBy)` |
* | **Nullability** | Optional |
*/
readonly orderBy?: GraphqlKit.Document.Object.Var.MaybeSchemaful<Array<GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.OrderByInput<_$Context> | null | undefined>> | null | undefined>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `Int` |
* | **Parent** | {@link $NamedTypes.$Query}.menus |
* | **Path** | `Query.menus(page)` |
* | **Nullability** | Optional |
* | **Default** | `0` |
*/
readonly page?: $Scalars.Int<_$Context>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `Int` |
* | **Parent** | {@link $NamedTypes.$Query}.menus |
* | **Path** | `Query.menus(size)` |
* | **Nullability** | Optional |
* | **Default** | `20` |
*/
readonly size?: $Scalars.Int<_$Context>
}

/**
* This is the "expanded" version of the `menus` type. It is identical except for the fact
* that IDEs will display its contents (a union type) directly, rather than the name of this type.
* In some cases, this is a preferable DX, making the types easier to read for users.
*/
export type $Expanded<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> = $$Utilities.Simplify<$SelectionSet<_$Context>>
}


export type dictCategories<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> = dictCategories.$SelectionSet<_$Context>

export namespace dictCategories {
export interface $SelectionSet<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> extends GraphqlKit.Document.Object.Select.Bases.Base, $Named.DictCategoryConnection<_$Context> {
/**
* Arguments for `dictCategories` field. No arguments are required so you may omit this.
*/
readonly $?: $Arguments<_$Context>
}

export interface $Arguments<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> {
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `DictCategoryFilter` |
* | **Parent** | {@link $NamedTypes.$Query}.dictCategories |
* | **Path** | `Query.dictCategories(where)` |
* | **Nullability** | Optional |
*/
readonly where?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.DictCategoryFilter<_$Context> | null | undefined>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `[OrderByInput]` |
* | **Parent** | {@link $NamedTypes.$Query}.dictCategories |
* | **Path** | `Query.dictCategories(orderBy)` |
* | **Nullability** | Optional |
*/
readonly orderBy?: GraphqlKit.Document.Object.Var.MaybeSchemaful<Array<GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.OrderByInput<_$Context> | null | undefined>> | null | undefined>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `Int` |
* | **Parent** | {@link $NamedTypes.$Query}.dictCategories |
* | **Path** | `Query.dictCategories(page)` |
* | **Nullability** | Optional |
* | **Default** | `0` |
*/
readonly page?: $Scalars.Int<_$Context>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `Int` |
* | **Parent** | {@link $NamedTypes.$Query}.dictCategories |
* | **Path** | `Query.dictCategories(size)` |
* | **Nullability** | Optional |
* | **Default** | `20` |
*/
readonly size?: $Scalars.Int<_$Context>
}

/**
* This is the "expanded" version of the `dictCategories` type. It is identical except for the fact
* that IDEs will display its contents (a union type) directly, rather than the name of this type.
* In some cases, this is a preferable DX, making the types easier to read for users.
*/
export type $Expanded<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> = $$Utilities.Simplify<$SelectionSet<_$Context>>
}


export type dictItems<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> = dictItems.$SelectionSet<_$Context>

export namespace dictItems {
export interface $SelectionSet<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> extends GraphqlKit.Document.Object.Select.Bases.Base, $Named.DictItemConnection<_$Context> {
/**
* Arguments for `dictItems` field. No arguments are required so you may omit this.
*/
readonly $?: $Arguments<_$Context>
}

export interface $Arguments<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> {
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `DictItemFilter` |
* | **Parent** | {@link $NamedTypes.$Query}.dictItems |
* | **Path** | `Query.dictItems(where)` |
* | **Nullability** | Optional |
*/
readonly where?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.DictItemFilter<_$Context> | null | undefined>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `[OrderByInput]` |
* | **Parent** | {@link $NamedTypes.$Query}.dictItems |
* | **Path** | `Query.dictItems(orderBy)` |
* | **Nullability** | Optional |
*/
readonly orderBy?: GraphqlKit.Document.Object.Var.MaybeSchemaful<Array<GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.OrderByInput<_$Context> | null | undefined>> | null | undefined>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `Int` |
* | **Parent** | {@link $NamedTypes.$Query}.dictItems |
* | **Path** | `Query.dictItems(page)` |
* | **Nullability** | Optional |
* | **Default** | `0` |
*/
readonly page?: $Scalars.Int<_$Context>
/**
* # Info
*
* | | |
* | - | - |
* | **GraphQL Type** | `Int` |
* | **Parent** | {@link $NamedTypes.$Query}.dictItems |
* | **Path** | `Query.dictItems(size)` |
* | **Nullability** | Optional |
* | **Default** | `20` |
*/
readonly size?: $Scalars.Int<_$Context>
}

/**
* This is the "expanded" version of the `dictItems` type. It is identical except for the fact
* that IDEs will display its contents (a union type) directly, rather than the name of this type.
* In some cases, this is a preferable DX, making the types easier to read for users.
*/
export type $Expanded<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> = $$Utilities.Simplify<$SelectionSet<_$Context>>
}

