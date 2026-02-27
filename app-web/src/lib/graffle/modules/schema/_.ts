import type * as $ from 'graffle/utilities-for-generated'
import * as $$Data from '../data.js'
import * as $$Scalar from '../scalar.js'
import * as $Types from './__.js'

export * as Schema from './__.js'

export interface Schema<$Scalars extends $.Schema.Scalars.Registry = $$Scalar.$Registry> {
name: $$Data.Name,
operationsAvailable: [$.GraphqlKit.Schema.OperationType.QUERY],
RootUnion: $Types.Query,
Root: {
query: $Types.Query,
mutation: null,
subscription: null
},
allTypes: {
Query: $Types.Query,
UserConnection: $Types.UserConnection,
User: $Types.User,
RoleConnection: $Types.RoleConnection,
Role: $Types.Role,
Permission: $Types.Permission,
MenuConnection: $Types.MenuConnection,
Menu: $Types.Menu,
DictCategoryConnection: $Types.DictCategoryConnection,
DictCategory: $Types.DictCategory,
DictItemConnection: $Types.DictItemConnection,
DictItem: $Types.DictItem
},
objects: {
UserConnection: $Types.UserConnection,
User: $Types.User,
RoleConnection: $Types.RoleConnection,
Role: $Types.Role,
Permission: $Types.Permission,
MenuConnection: $Types.MenuConnection,
Menu: $Types.Menu,
DictCategoryConnection: $Types.DictCategoryConnection,
DictCategory: $Types.DictCategory,
DictItemConnection: $Types.DictItemConnection,
DictItem: $Types.DictItem
},
unions: {},
interfaces: {},
scalarNamesUnion: "Long"
| "Int"
| "String"
| "Boolean",
scalars: {
Long: $Types.Long,
Int: $Types.Int,
String: $Types.String,
Boolean: $Types.Boolean
},
scalarRegistry: $Scalars,
extensions: $.GlobalRegistry.TypeExtensions
}