import type * as $$SelectionSets from './selection-sets/_.js'
import type * as $$Schema from './schema/_.js'
import type * as $$Utilities from 'graffle/utilities-for-generated'
import type { GraphqlKit } from 'graffle/utilities-for-generated'
import type * as $$SchemaMap from './schema-driven-data-map.js'


/**
* GraphQL {@link https://graphql.org/learn/schema/#the-query-and-mutation-types | Query} root methods.
*
* All methods return Promises. Use `.query.$batch(...)` to select multiple fields at once.
*/
export interface QueryMethods<$Context extends $$Utilities.Context> {
/**
  * Select multiple Query fields at once.
  *
  * Pass a selection set object that includes the fields you want.
  * Use this method to request multiple fields in a single request for better performance.
  */

      $batch:
        $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
          $Context,
          <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.Query<{ scalars: $Context['scalars'] }>>) =>
            GraphqlKit.Document.Object.Var.MethodReturn<
              GraphqlKit.Document.Object.Var.InferFromQuery<$$Utilities.AssertExtendsObject<$SelectionSet>, $$SchemaMap.SchemaDrivenDataMap>,
              & (null | {})
              & $$Utilities.HandleOutput<
                  $Context,
                  GraphqlKit.Document.Object.InferResult.OperationQuery<$$Utilities.AssertExtendsObject<$SelectionSet>, $$Schema.Schema<$Context['scalars']>>
                >,
              $$Utilities.DocumentRunnerDeferred<
                GraphqlKit.Document.Object.Var.InferFromQuery<$$Utilities.AssertExtendsObject<$SelectionSet>, $$SchemaMap.SchemaDrivenDataMap>,
                & (null | {})
                & $$Utilities.HandleOutput<
                    $Context,
                    GraphqlKit.Document.Object.InferResult.OperationQuery<$$Utilities.AssertExtendsObject<$SelectionSet>, $$Schema.Schema<$Context['scalars']>>
                  >
              >
            >
        >

/**
  * Request the {@link https://graphql.org/learn/schema/#the-__typename-field | __typename} meta-field.
  *
  * The `__typename` field returns the name of the object type. In this case, it will always return `"Query"`.
  */

      __typename:
        $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
          $Context,
          () =>
            Promise<
              & (null | {})
              & $$Utilities.HandleOutputDocumentBuilderRootField<
                  $Context,
                  { __typename: 'Query' },
                  '__typename'
                >
            >
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
*/

      users:
        $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
          $Context,
          <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.Query.users<{ scalars: $Context['scalars'] }>>) =>
            GraphqlKit.Document.Object.Var.MethodReturn<
              GraphqlKit.Document.Object.Var.InferFromQuery<{ users: $SelectionSet}, $$SchemaMap.SchemaDrivenDataMap>,
              & (null | {})
              & $$Utilities.HandleOutputDocumentBuilderRootField<
                  $Context,
                  GraphqlKit.Document.Object.InferResult.OperationQuery<{ users: $SelectionSet}, $$Schema.Schema<$Context['scalars']>>,
                  'users'
                >,
              $$Utilities.DocumentRunnerDeferred<
                GraphqlKit.Document.Object.Var.InferFromQuery<{ users: $SelectionSet}, $$SchemaMap.SchemaDrivenDataMap>,
                & (null | {})
                & $$Utilities.HandleOutputDocumentBuilderRootField<
                    $Context,
                    GraphqlKit.Document.Object.InferResult.OperationQuery<{ users: $SelectionSet}, $$Schema.Schema<$Context['scalars']>>,
                    'users'
                  >
              >
            >
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
*/

      roles:
        $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
          $Context,
          <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.Query.roles<{ scalars: $Context['scalars'] }>>) =>
            GraphqlKit.Document.Object.Var.MethodReturn<
              GraphqlKit.Document.Object.Var.InferFromQuery<{ roles: $SelectionSet}, $$SchemaMap.SchemaDrivenDataMap>,
              & (null | {})
              & $$Utilities.HandleOutputDocumentBuilderRootField<
                  $Context,
                  GraphqlKit.Document.Object.InferResult.OperationQuery<{ roles: $SelectionSet}, $$Schema.Schema<$Context['scalars']>>,
                  'roles'
                >,
              $$Utilities.DocumentRunnerDeferred<
                GraphqlKit.Document.Object.Var.InferFromQuery<{ roles: $SelectionSet}, $$SchemaMap.SchemaDrivenDataMap>,
                & (null | {})
                & $$Utilities.HandleOutputDocumentBuilderRootField<
                    $Context,
                    GraphqlKit.Document.Object.InferResult.OperationQuery<{ roles: $SelectionSet}, $$Schema.Schema<$Context['scalars']>>,
                    'roles'
                  >
              >
            >
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
*/

      menus:
        $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
          $Context,
          <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.Query.menus<{ scalars: $Context['scalars'] }>>) =>
            GraphqlKit.Document.Object.Var.MethodReturn<
              GraphqlKit.Document.Object.Var.InferFromQuery<{ menus: $SelectionSet}, $$SchemaMap.SchemaDrivenDataMap>,
              & (null | {})
              & $$Utilities.HandleOutputDocumentBuilderRootField<
                  $Context,
                  GraphqlKit.Document.Object.InferResult.OperationQuery<{ menus: $SelectionSet}, $$Schema.Schema<$Context['scalars']>>,
                  'menus'
                >,
              $$Utilities.DocumentRunnerDeferred<
                GraphqlKit.Document.Object.Var.InferFromQuery<{ menus: $SelectionSet}, $$SchemaMap.SchemaDrivenDataMap>,
                & (null | {})
                & $$Utilities.HandleOutputDocumentBuilderRootField<
                    $Context,
                    GraphqlKit.Document.Object.InferResult.OperationQuery<{ menus: $SelectionSet}, $$Schema.Schema<$Context['scalars']>>,
                    'menus'
                  >
              >
            >
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
*/

      dictCategories:
        $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
          $Context,
          <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.Query.dictCategories<{ scalars: $Context['scalars'] }>>) =>
            GraphqlKit.Document.Object.Var.MethodReturn<
              GraphqlKit.Document.Object.Var.InferFromQuery<{ dictCategories: $SelectionSet}, $$SchemaMap.SchemaDrivenDataMap>,
              & (null | {})
              & $$Utilities.HandleOutputDocumentBuilderRootField<
                  $Context,
                  GraphqlKit.Document.Object.InferResult.OperationQuery<{ dictCategories: $SelectionSet}, $$Schema.Schema<$Context['scalars']>>,
                  'dictCategories'
                >,
              $$Utilities.DocumentRunnerDeferred<
                GraphqlKit.Document.Object.Var.InferFromQuery<{ dictCategories: $SelectionSet}, $$SchemaMap.SchemaDrivenDataMap>,
                & (null | {})
                & $$Utilities.HandleOutputDocumentBuilderRootField<
                    $Context,
                    GraphqlKit.Document.Object.InferResult.OperationQuery<{ dictCategories: $SelectionSet}, $$Schema.Schema<$Context['scalars']>>,
                    'dictCategories'
                  >
              >
            >
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
*/

      dictItems:
        $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
          $Context,
          <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.Query.dictItems<{ scalars: $Context['scalars'] }>>) =>
            GraphqlKit.Document.Object.Var.MethodReturn<
              GraphqlKit.Document.Object.Var.InferFromQuery<{ dictItems: $SelectionSet}, $$SchemaMap.SchemaDrivenDataMap>,
              & (null | {})
              & $$Utilities.HandleOutputDocumentBuilderRootField<
                  $Context,
                  GraphqlKit.Document.Object.InferResult.OperationQuery<{ dictItems: $SelectionSet}, $$Schema.Schema<$Context['scalars']>>,
                  'dictItems'
                >,
              $$Utilities.DocumentRunnerDeferred<
                GraphqlKit.Document.Object.Var.InferFromQuery<{ dictItems: $SelectionSet}, $$SchemaMap.SchemaDrivenDataMap>,
                & (null | {})
                & $$Utilities.HandleOutputDocumentBuilderRootField<
                    $Context,
                    GraphqlKit.Document.Object.InferResult.OperationQuery<{ dictItems: $SelectionSet}, $$Schema.Schema<$Context['scalars']>>,
                    'dictItems'
                  >
              >
            >
        >

    }


export interface BuilderMethodsRoot<$Context extends $$Utilities.Context> {
/**
  * Access to {@link https://graphql.org/learn/schema/#the-query-and-mutation-types | Query} root field methods.
  *
  * Each method corresponds to a root field on the GraphQL schema and returns a Promise.
  * Use `.$batch(...)` to select multiple query fields in a single request.
  *
  * @example Single field
  * ```ts
  * const user = await graffle.query.user({ id: true, name: true })
  * ```
  * @example Multiple fields with $batch
  * ```ts
  * const data = await graffle.query.$batch({
  * user: { id: true, name: true },
  * posts: { title: true, content: true }
  * })
  * ```
  */
query: QueryMethods<$Context>
}


      export interface BuilderMethodsRootFn extends $$Utilities.Kind.Kind {
        // @ts-expect-error parameter is Untyped.
        return: BuilderMethodsRoot<this['parameters']>
      }
