export * as $Named from './$named.js'
export * as $Scalars from './scalars/_.js'

export type * from './_context.js'
export type * from './_document.js'

export type * from './roots/Query/_.js'
export type * from './objects/UserConnection/_.js'
export type * from './objects/User/_.js'
export type * from './objects/RoleConnection/_.js'
export type * from './objects/Role/_.js'
export type * from './objects/Permission/_.js'
export type * from './objects/MenuConnection/_.js'
export type * from './objects/Menu/_.js'
export type * from './objects/DictCategoryConnection/_.js'
export type * from './objects/DictCategory/_.js'
export type * from './objects/DictItemConnection/_.js'
export type * from './objects/DictItem/_.js'
export type * from './input-objects/UserFilter/_.js'
export type * from './input-objects/RoleFilter/_.js'
export type * from './input-objects/PermissionFilter/_.js'
export type * from './input-objects/MenuFilter/_.js'
export type * from './input-objects/DictCategoryFilter/_.js'
export type * from './input-objects/DictItemFilter/_.js'
export type * from './input-objects/LongFilter/_.js'
export type * from './input-objects/StringFilter/_.js'
export type * from './input-objects/IntFilter/_.js'
export type * from './input-objects/BooleanFilter/_.js'
export type * from './input-objects/EnumFilter/_.js'
export type * from './input-objects/DateTimeFilter/_.js'
export type * from './input-objects/OrderByInput/_.js'

import type * as $$Utilities from 'graffle/utilities-for-generated'
import type { GraphqlKit } from 'graffle/utilities-for-generated'
import type * as $$Schema from '../schema/_.js'

/**
* Infer the result type of a Query selection set.
*
* Given a selection set object, this type computes the exact TypeScript type
* of the data that will be returned from executing the Query operation.
*/
export type Query$Infer<$SelectionSet extends object> = GraphqlKit.Document.Object.InferResult.OperationQuery<$SelectionSet, $$Schema.Schema>

/**
* Infer the variables type for a Query selection set.
*
* @deprecated This is temporarily typed as `any` and will be replaced with the new analysis system.
*/
export type Query$Variables<_$SelectionSet> = any // Temporarily any - will be replaced with new analysis system
