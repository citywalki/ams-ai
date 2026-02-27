import type * as $$Utilities from 'graffle/utilities-for-generated'
import type { GraphqlKit } from 'graffle/utilities-for-generated'
import type * as $Fields from './fields.js'
import type { $DefaultSelectionContext } from '../../_context.js'
import type { $FragmentInline } from './fragment.js'

export type * as Query from './__.js'

/**
* GraphQL root {@link https://graphql.org/learn/schema/#the-query-and-mutation-types | Query} type.
*/
export interface Query<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> extends GraphqlKit.Document.Object.Select.Bases.RootObjectLike {

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
* | **Type** | {@link $NamedTypes.$UserConnection}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | OutputObject ↗} |
* | **Parent** | {@link $NamedTypes.$Query} |
* | **Path** | `Query.users` |
* | **Nullability** | Required |
* | **Arguments** | 4 |
*/
users?: $Fields.users.$Expanded<_$Context>| GraphqlKit.Document.Object.Select.SelectAlias.SelectAlias<$Fields.users<_$Context>>
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
* | **Type** | {@link $NamedTypes.$RoleConnection}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | OutputObject ↗} |
* | **Parent** | {@link $NamedTypes.$Query} |
* | **Path** | `Query.roles` |
* | **Nullability** | Required |
* | **Arguments** | 4 |
*/
roles?: $Fields.roles.$Expanded<_$Context>| GraphqlKit.Document.Object.Select.SelectAlias.SelectAlias<$Fields.roles<_$Context>>
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
* | **Type** | {@link $NamedTypes.$MenuConnection}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | OutputObject ↗} |
* | **Parent** | {@link $NamedTypes.$Query} |
* | **Path** | `Query.menus` |
* | **Nullability** | Required |
* | **Arguments** | 4 |
*/
menus?: $Fields.menus.$Expanded<_$Context>| GraphqlKit.Document.Object.Select.SelectAlias.SelectAlias<$Fields.menus<_$Context>>
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
* | **Type** | {@link $NamedTypes.$DictCategoryConnection}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | OutputObject ↗} |
* | **Parent** | {@link $NamedTypes.$Query} |
* | **Path** | `Query.dictCategories` |
* | **Nullability** | Required |
* | **Arguments** | 4 |
*/
dictCategories?: $Fields.dictCategories.$Expanded<_$Context>| GraphqlKit.Document.Object.Select.SelectAlias.SelectAlias<$Fields.dictCategories<_$Context>>
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
* | **Type** | {@link $NamedTypes.$DictItemConnection}! |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlobjecttype | OutputObject ↗} |
* | **Parent** | {@link $NamedTypes.$Query} |
* | **Path** | `Query.dictItems` |
* | **Nullability** | Required |
* | **Arguments** | 4 |
*/
dictItems?: $Fields.dictItems.$Expanded<_$Context>| GraphqlKit.Document.Object.Select.SelectAlias.SelectAlias<$Fields.dictItems<_$Context>>
      
      /**
* Inline fragments for field groups.
*
* Generally a niche feature. This can be useful for example to apply an `@include` directive to a subset of the
* selection set in turn allowing you to pass a variable to opt in/out of that selection during execution on the server.
*
* @see {@link https://spec.graphql.org/draft/#sec-Inline-Fragments}
*/
___?: $FragmentInline<_$Context> | $FragmentInline<_$Context>[]
      /**
* A meta field. Is the name of the type being selected.
*
* @see {@link https://graphql.org/learn/queries/#meta-fields | Meta Fields}
*/
__typename?: GraphqlKit.Document.Object.Select.Indicator.NoArgsIndicator| GraphqlKit.Document.Object.Select.SelectAlias.SelectAlias<GraphqlKit.Document.Object.Select.Indicator.NoArgsIndicator> | GraphqlKit.Document.Object.Select.SelectAlias.SelectAliasShort | GraphqlKit.Document.Object.Select.SelectAlias.SelectAliasString
    
}