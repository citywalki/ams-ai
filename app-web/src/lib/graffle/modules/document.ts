import { createStaticRootType } from 'graffle/extensions/document-builder'
import { schemaDrivenDataMap as sddm } from './schema-driven-data-map.js'
import { GraphqlKit } from 'graffle/utilities-for-generated'
import type * as SelectionSets from './selection-sets/_.js'
import type * as $$Scalar from './scalar.js'
import type * as SchemaMap from './schema-driven-data-map.js'

import type * as $$Utilities from 'graffle/utilities-for-generated'
import type * as $$Schema from './schema/_.js'

/**
* Context for static document type inference.
*
* Static documents have no runtime extensions, hence typeHookRequestResultDataTypes is never.
*/
interface StaticDocumentContext {
typeHookRequestResultDataTypes: never
scalars: $$Scalar.$Registry
}

/**
* Static query builder for compile-time GraphQL document generation.
*
* @remarks
* Each field method generates a fully typed GraphQL  document string with:
* - Type-safe selection sets matching your schema
* - Automatic variable inference from `$` usage
* - Compile-time validation of field selections
* - Zero runtime overhead - documents are generated at build time
*
* @example Basic query
* ```ts
* const getUserDoc = query.user({
* id: true,
* name: true,
* email: true
* })
* // Generates: query { user { id name email } }
* ```
*
* @example With variables
* ```ts
* import { Var } from 'graffle'
*
* const getUserByIdDoc = query.user({
* $: { id: $ },
* name: true,
* posts: { title: true }
* })
* // Generates: query ($id: ID!) { user(id: $id) { name posts { title } } }
* // Variables type: { id: string }
* ```
*
* @see {@link https://graffle.js.org/guides/static-generation | Static Generation Guide}
*/

        export interface QueryBuilder {
          $batch: <const $SelectionSet extends SelectionSets.Query<GraphqlKit.Document.Object.Select.StaticBuilderContext>>(
            selection: $SelectionSet
          ) => GraphqlKit.Document.Typed.String<
            $$Utilities.RequestResult.Simplify<StaticDocumentContext, GraphqlKit.Document.Object.InferResult.OperationQuery<$SelectionSet, $$Schema.Schema>>,
            $$Utilities.RequestResult.Simplify<StaticDocumentContext, GraphqlKit.Document.Object.Var.InferFromQuery<$SelectionSet, SchemaMap.SchemaDrivenDataMap>>,
            true
          >

          /**
* ```graphql
* users(where: UserFilter, orderBy: [OrderByInput], page: Int = 0, size: Int = 20): UserConnection!
*
* type UserConnection {
* content: [User!]!
* totalElements: Long!
* totalPages: Int!
* page: Int!
* size: Int!
* }
* ```
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
*
* @example
* ```ts
* const doc = query.users({
* // $: { ...variables }
* content: true,
* totalElements: true,
* totalPages: true,
* // ...
* })
* ```
*/
          users: <const $SelectionSet extends SelectionSets.Query<GraphqlKit.Document.Object.Select.StaticBuilderContext>['users']>(
            selection?: $SelectionSet
          ) => GraphqlKit.Document.Typed.String<
            $$Utilities.RequestResult.Simplify<StaticDocumentContext, GraphqlKit.Document.Object.InferResult.OperationQuery<{ users: $SelectionSet }, $$Schema.Schema>>,
            $$Utilities.RequestResult.Simplify<StaticDocumentContext, GraphqlKit.Document.Object.Var.InferFromQuery<{ users: Exclude<$SelectionSet, undefined> }, SchemaMap.SchemaDrivenDataMap>>,
            true
          >

          /**
* ```graphql
* roles(where: RoleFilter, orderBy: [OrderByInput], page: Int = 0, size: Int = 20): RoleConnection!
*
* type RoleConnection {
* content: [Role!]!
* totalElements: Long!
* totalPages: Int!
* page: Int!
* size: Int!
* }
* ```
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
*
* @example
* ```ts
* const doc = query.roles({
* // $: { ...variables }
* content: true,
* totalElements: true,
* totalPages: true,
* // ...
* })
* ```
*/
          roles: <const $SelectionSet extends SelectionSets.Query<GraphqlKit.Document.Object.Select.StaticBuilderContext>['roles']>(
            selection?: $SelectionSet
          ) => GraphqlKit.Document.Typed.String<
            $$Utilities.RequestResult.Simplify<StaticDocumentContext, GraphqlKit.Document.Object.InferResult.OperationQuery<{ roles: $SelectionSet }, $$Schema.Schema>>,
            $$Utilities.RequestResult.Simplify<StaticDocumentContext, GraphqlKit.Document.Object.Var.InferFromQuery<{ roles: Exclude<$SelectionSet, undefined> }, SchemaMap.SchemaDrivenDataMap>>,
            true
          >

          /**
* ```graphql
* menus(where: MenuFilter, orderBy: [OrderByInput], page: Int = 0, size: Int = 20): MenuConnection!
*
* type MenuConnection {
* content: [Menu!]!
* totalElements: Long!
* totalPages: Int!
* page: Int!
* size: Int!
* }
* ```
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
*
* @example
* ```ts
* const doc = query.menus({
* // $: { ...variables }
* content: true,
* totalElements: true,
* totalPages: true,
* // ...
* })
* ```
*/
          menus: <const $SelectionSet extends SelectionSets.Query<GraphqlKit.Document.Object.Select.StaticBuilderContext>['menus']>(
            selection?: $SelectionSet
          ) => GraphqlKit.Document.Typed.String<
            $$Utilities.RequestResult.Simplify<StaticDocumentContext, GraphqlKit.Document.Object.InferResult.OperationQuery<{ menus: $SelectionSet }, $$Schema.Schema>>,
            $$Utilities.RequestResult.Simplify<StaticDocumentContext, GraphqlKit.Document.Object.Var.InferFromQuery<{ menus: Exclude<$SelectionSet, undefined> }, SchemaMap.SchemaDrivenDataMap>>,
            true
          >

          /**
* ```graphql
* dictCategories(where: DictCategoryFilter, orderBy: [OrderByInput], page: Int = 0, size: Int = 20): DictCategoryConnection!
*
* type DictCategoryConnection {
* content: [DictCategory!]!
* totalElements: Long!
* totalPages: Int!
* page: Int!
* size: Int!
* }
* ```
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
*
* @example
* ```ts
* const doc = query.dictCategories({
* // $: { ...variables }
* content: true,
* totalElements: true,
* totalPages: true,
* // ...
* })
* ```
*/
          dictCategories: <const $SelectionSet extends SelectionSets.Query<GraphqlKit.Document.Object.Select.StaticBuilderContext>['dictCategories']>(
            selection?: $SelectionSet
          ) => GraphqlKit.Document.Typed.String<
            $$Utilities.RequestResult.Simplify<StaticDocumentContext, GraphqlKit.Document.Object.InferResult.OperationQuery<{ dictCategories: $SelectionSet }, $$Schema.Schema>>,
            $$Utilities.RequestResult.Simplify<StaticDocumentContext, GraphqlKit.Document.Object.Var.InferFromQuery<{ dictCategories: Exclude<$SelectionSet, undefined> }, SchemaMap.SchemaDrivenDataMap>>,
            true
          >

          /**
* ```graphql
* dictItems(where: DictItemFilter, orderBy: [OrderByInput], page: Int = 0, size: Int = 20): DictItemConnection!
*
* type DictItemConnection {
* content: [DictItem!]!
* totalElements: Long!
* totalPages: Int!
* page: Int!
* size: Int!
* }
* ```
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
*
* @example
* ```ts
* const doc = query.dictItems({
* // $: { ...variables }
* content: true,
* totalElements: true,
* totalPages: true,
* // ...
* })
* ```
*/
          dictItems: <const $SelectionSet extends SelectionSets.Query<GraphqlKit.Document.Object.Select.StaticBuilderContext>['dictItems']>(
            selection?: $SelectionSet
          ) => GraphqlKit.Document.Typed.String<
            $$Utilities.RequestResult.Simplify<StaticDocumentContext, GraphqlKit.Document.Object.InferResult.OperationQuery<{ dictItems: $SelectionSet }, $$Schema.Schema>>,
            $$Utilities.RequestResult.Simplify<StaticDocumentContext, GraphqlKit.Document.Object.Var.InferFromQuery<{ dictItems: Exclude<$SelectionSet, undefined> }, SchemaMap.SchemaDrivenDataMap>>,
            true
          >
        }

/**
* Static query builder for compile-time GraphQL document generation.
*
* @remarks
* Each field method generates a fully typed GraphQL  document string with:
* - Type-safe selection sets matching your schema
* - Automatic variable inference from `$` usage
* - Compile-time validation of field selections
* - Zero runtime overhead - documents are generated at build time
*
* @example Basic query
* ```ts
* const getUserDoc = query.user({
* id: true,
* name: true,
* email: true
* })
* // Generates: query { user { id name email } }
* ```
*
* @example With variables
* ```ts
* import { Var } from 'graffle'
*
* const getUserByIdDoc = query.user({
* $: { id: $ },
* name: true,
* posts: { title: true }
* })
* // Generates: query ($id: ID!) { user(id: $id) { name posts { title } } }
* // Variables type: { id: string }
* ```
*
* @see {@link https://graffle.js.org/guides/static-generation | Static Generation Guide}
*/
export const query: QueryBuilder = createStaticRootType(GraphqlKit.Schema.OperationType.QUERY, { sddm }) as any
