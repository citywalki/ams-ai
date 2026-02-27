import * as $$SelectionSets from './selection-sets/_.js'
import type * as $$Utilities from 'graffle/utilities-for-generated'


    //
    //
    //
    //
    //
    //
    // ==================================================================================================
    //                                      Select Methods Interface
    // ==================================================================================================
    //
    //
    //
    //
    //
    //



      /**
       * Selection method types for building native GraphQL documents.
       *
       * Maps each GraphQL schema type to its corresponding selection method interface.
       * These methods are available on `.select()` to build type-safe selection sets
       * that return the selection set itself (for document building).
       */

export interface $MethodsSelect {
Query: Query,
UserConnection: UserConnection,
User: User,
RoleConnection: RoleConnection,
Role: Role,
Permission: Permission,
MenuConnection: MenuConnection,
Menu: Menu,
DictCategoryConnection: DictCategoryConnection,
DictCategory: DictCategory,
DictItemConnection: DictItemConnection,
DictItem: DictItem
}


    //
    //
    //
    //
    //
    //
    // ==================================================================================================
    //                                                Root
    // ==================================================================================================
    //
    //
    //
    //
    //
    //


/**
* Build type-safe selection set for Query.
*/
export interface Query {

            <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.Query>):
              $SelectionSet
          
}


    //
    //
    //
    //
    //
    //
    // ==================================================================================================
    //                                            OutputObject
    // ==================================================================================================
    //
    //
    //
    //
    //
    //


/**
* Build type-safe selection set for UserConnection.
*/
export interface UserConnection {

            <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.UserConnection>):
              $SelectionSet
          
}

/**
* Build type-safe selection set for User.
*/
export interface User {

            <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.User>):
              $SelectionSet
          
}

/**
* Build type-safe selection set for RoleConnection.
*/
export interface RoleConnection {

            <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.RoleConnection>):
              $SelectionSet
          
}

/**
* Build type-safe selection set for Role.
*/
export interface Role {

            <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.Role>):
              $SelectionSet
          
}

/**
* Build type-safe selection set for Permission.
*/
export interface Permission {

            <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.Permission>):
              $SelectionSet
          
}

/**
* Build type-safe selection set for MenuConnection.
*/
export interface MenuConnection {

            <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.MenuConnection>):
              $SelectionSet
          
}

/**
* Build type-safe selection set for Menu.
*/
export interface Menu {

            <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.Menu>):
              $SelectionSet
          
}

/**
* Build type-safe selection set for DictCategoryConnection.
*/
export interface DictCategoryConnection {

            <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.DictCategoryConnection>):
              $SelectionSet
          
}

/**
* Build type-safe selection set for DictCategory.
*/
export interface DictCategory {

            <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.DictCategory>):
              $SelectionSet
          
}

/**
* Build type-safe selection set for DictItemConnection.
*/
export interface DictItemConnection {

            <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.DictItemConnection>):
              $SelectionSet
          
}

/**
* Build type-safe selection set for DictItem.
*/
export interface DictItem {

            <$SelectionSet>(selectionSet: $$Utilities.NoExcess<$SelectionSet, $$SelectionSets.DictItem>):
              $SelectionSet
          
}


    //
    //
    //
    //
    //
    //
    // ==================================================================================================
    //                                               Union
    // ==================================================================================================
    //
    //
    //
    //
    //
    //



    //
    //
    //
    //
    //
    //
    // ==================================================================================================
    //                                             Interface
    // ==================================================================================================
    //
    //
    //
    //
    //
    //

