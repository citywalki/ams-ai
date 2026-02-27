import * as $$Data from './data.js'
import * as $$Schema from './schema/_.js'
import * as $$SelectionSets from './selection-sets/_.js'
import type * as $$Utilities from 'graffle/utilities-for-generated'
import type { GraphqlKit } from 'graffle/utilities-for-generated'


    //
    //
    //
    //
    //
    //
    // ==================================================================================================
    //                                              Runtime
    // ==================================================================================================
    //
    //
    //
    //
    //
    //


      import { createSelect } from 'graffle/client'

      /**
       * Runtime utilities for native GraphQL document selection.
       *
       * Used with the `.select()` method to build type-safe native GraphQL documents.
       *
       * @example
       * ```ts
       * import { Select } from './graffle/select.js'
       *
       * const document = Select.Query({ pokemon: { name: true } })
       * ```
       */
      export const Select = createSelect($$Data.Name)



    //
    //
    //
    //
    //
    //
    // ==================================================================================================
    //                                             Buildtime
    // ==================================================================================================
    //
    //
    //
    //
    //
    //


      /**
       * Type utilities for inferring result types from selection sets.
       *
       * Given a selection set, these types compute the exact TypeScript type
       * of the result data returned from a GraphQL operation.
       *
       * # Usage
       *
       * Each type corresponds to a GraphQL schema type and takes a selection set
       * generic parameter, returning the inferred result type.
       *
       * @example
       * ```ts
       * import type { Select } from './graffle/select.js'
       *
       * type Result = Select.Query<{ pokemon: { name: true } }>
       * // Result: { pokemon: { name: string } }
       * ```
       */
      export namespace Select {


    //                                                Root
    // --------------------------------------------------------------------------------------------------
    //

/**
* Infer result type for Query operations.
*/
export type Query<$SelectionSet extends $$SelectionSets.Query> = GraphqlKit.Document.Object.InferResult.Operation<$SelectionSet, $$Schema.Schema, $$Utilities.GraphqlKit.Schema.OperationType.QUERY >


    //                                            OutputObject
    // --------------------------------------------------------------------------------------------------
    //

/**
* Infer result type for UserConnection selection sets.
*/
export type UserConnection<$SelectionSet extends $$SelectionSets.UserConnection> = GraphqlKit.Document.Object.InferResult.OutputObjectLike<$SelectionSet, $$Schema.Schema, $$Schema.Schema['allTypes']['UserConnection']>
/**
* Infer result type for User selection sets.
*/
export type User<$SelectionSet extends $$SelectionSets.User> = GraphqlKit.Document.Object.InferResult.OutputObjectLike<$SelectionSet, $$Schema.Schema, $$Schema.Schema['allTypes']['User']>
/**
* Infer result type for RoleConnection selection sets.
*/
export type RoleConnection<$SelectionSet extends $$SelectionSets.RoleConnection> = GraphqlKit.Document.Object.InferResult.OutputObjectLike<$SelectionSet, $$Schema.Schema, $$Schema.Schema['allTypes']['RoleConnection']>
/**
* Infer result type for Role selection sets.
*/
export type Role<$SelectionSet extends $$SelectionSets.Role> = GraphqlKit.Document.Object.InferResult.OutputObjectLike<$SelectionSet, $$Schema.Schema, $$Schema.Schema['allTypes']['Role']>
/**
* Infer result type for Permission selection sets.
*/
export type Permission<$SelectionSet extends $$SelectionSets.Permission> = GraphqlKit.Document.Object.InferResult.OutputObjectLike<$SelectionSet, $$Schema.Schema, $$Schema.Schema['allTypes']['Permission']>
/**
* Infer result type for MenuConnection selection sets.
*/
export type MenuConnection<$SelectionSet extends $$SelectionSets.MenuConnection> = GraphqlKit.Document.Object.InferResult.OutputObjectLike<$SelectionSet, $$Schema.Schema, $$Schema.Schema['allTypes']['MenuConnection']>
/**
* Infer result type for Menu selection sets.
*/
export type Menu<$SelectionSet extends $$SelectionSets.Menu> = GraphqlKit.Document.Object.InferResult.OutputObjectLike<$SelectionSet, $$Schema.Schema, $$Schema.Schema['allTypes']['Menu']>
/**
* Infer result type for DictCategoryConnection selection sets.
*/
export type DictCategoryConnection<$SelectionSet extends $$SelectionSets.DictCategoryConnection> = GraphqlKit.Document.Object.InferResult.OutputObjectLike<$SelectionSet, $$Schema.Schema, $$Schema.Schema['allTypes']['DictCategoryConnection']>
/**
* Infer result type for DictCategory selection sets.
*/
export type DictCategory<$SelectionSet extends $$SelectionSets.DictCategory> = GraphqlKit.Document.Object.InferResult.OutputObjectLike<$SelectionSet, $$Schema.Schema, $$Schema.Schema['allTypes']['DictCategory']>
/**
* Infer result type for DictItemConnection selection sets.
*/
export type DictItemConnection<$SelectionSet extends $$SelectionSets.DictItemConnection> = GraphqlKit.Document.Object.InferResult.OutputObjectLike<$SelectionSet, $$Schema.Schema, $$Schema.Schema['allTypes']['DictItemConnection']>
/**
* Infer result type for DictItem selection sets.
*/
export type DictItem<$SelectionSet extends $$SelectionSets.DictItem> = GraphqlKit.Document.Object.InferResult.OutputObjectLike<$SelectionSet, $$Schema.Schema, $$Schema.Schema['allTypes']['DictItem']>


    //                                               Union
    // --------------------------------------------------------------------------------------------------
    //



    //                                             Interface
    // --------------------------------------------------------------------------------------------------
    //

}