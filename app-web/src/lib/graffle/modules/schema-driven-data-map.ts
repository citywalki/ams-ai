import * as $$Scalar from './scalar.js'
import { Schema as $$Schema } from './schema/_.js'
import type * as $$Utilities from 'graffle/utilities-for-generated'

    //
    //
    //
    //
    //
    //
    // ==================================================================================================
    //                                               Types
    // ==================================================================================================
    //
    //
    //
    //
    //
    //


interface UserFilter extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "UserFilter"
readonly fields: {
readonly _and: {
readonly _tag: "argumentOrInputField"
readonly namedType: UserFilter
readonly inlineType: [0, [1, ]]
}
readonly _or: {
readonly _tag: "argumentOrInputField"
readonly namedType: UserFilter
readonly inlineType: [0, [1, ]]
}
readonly id: {
readonly _tag: "argumentOrInputField"
readonly namedType: LongFilter
readonly inlineType: [0, ]
}
readonly username: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly email: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly status: {
readonly _tag: "argumentOrInputField"
readonly namedType: EnumFilter
readonly inlineType: [0, ]
}
readonly createdAt: {
readonly _tag: "argumentOrInputField"
readonly namedType: DateTimeFilter
readonly inlineType: [0, ]
}
readonly updatedAt: {
readonly _tag: "argumentOrInputField"
readonly namedType: DateTimeFilter
readonly inlineType: [0, ]
}
readonly roles: {
readonly _tag: "argumentOrInputField"
readonly namedType: RoleFilter
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.UserFilter['type']
}

interface RoleFilter extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "RoleFilter"
readonly fields: {
readonly _and: {
readonly _tag: "argumentOrInputField"
readonly namedType: RoleFilter
readonly inlineType: [0, [1, ]]
}
readonly _or: {
readonly _tag: "argumentOrInputField"
readonly namedType: RoleFilter
readonly inlineType: [0, [1, ]]
}
readonly id: {
readonly _tag: "argumentOrInputField"
readonly namedType: LongFilter
readonly inlineType: [0, ]
}
readonly code: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly name: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly description: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly permissions: {
readonly _tag: "argumentOrInputField"
readonly namedType: PermissionFilter
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.RoleFilter['type']
}

interface PermissionFilter extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "PermissionFilter"
readonly fields: {
readonly id: {
readonly _tag: "argumentOrInputField"
readonly namedType: LongFilter
readonly inlineType: [0, ]
}
readonly code: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly name: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.PermissionFilter['type']
}

interface MenuFilter extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "MenuFilter"
readonly fields: {
readonly _and: {
readonly _tag: "argumentOrInputField"
readonly namedType: MenuFilter
readonly inlineType: [0, [1, ]]
}
readonly _or: {
readonly _tag: "argumentOrInputField"
readonly namedType: MenuFilter
readonly inlineType: [0, [1, ]]
}
readonly id: {
readonly _tag: "argumentOrInputField"
readonly namedType: LongFilter
readonly inlineType: [0, ]
}
readonly key: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly label: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly route: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly parentId: {
readonly _tag: "argumentOrInputField"
readonly namedType: LongFilter
readonly inlineType: [0, ]
}
readonly menuType: {
readonly _tag: "argumentOrInputField"
readonly namedType: EnumFilter
readonly inlineType: [0, ]
}
readonly isVisible: {
readonly _tag: "argumentOrInputField"
readonly namedType: BooleanFilter
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.MenuFilter['type']
}

interface DictCategoryFilter extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "DictCategoryFilter"
readonly fields: {
readonly _and: {
readonly _tag: "argumentOrInputField"
readonly namedType: DictCategoryFilter
readonly inlineType: [0, [1, ]]
}
readonly _or: {
readonly _tag: "argumentOrInputField"
readonly namedType: DictCategoryFilter
readonly inlineType: [0, [1, ]]
}
readonly id: {
readonly _tag: "argumentOrInputField"
readonly namedType: LongFilter
readonly inlineType: [0, ]
}
readonly code: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly name: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly description: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly sort: {
readonly _tag: "argumentOrInputField"
readonly namedType: IntFilter
readonly inlineType: [0, ]
}
readonly status: {
readonly _tag: "argumentOrInputField"
readonly namedType: IntFilter
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.DictCategoryFilter['type']
}

interface DictItemFilter extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "DictItemFilter"
readonly fields: {
readonly _and: {
readonly _tag: "argumentOrInputField"
readonly namedType: DictItemFilter
readonly inlineType: [0, [1, ]]
}
readonly _or: {
readonly _tag: "argumentOrInputField"
readonly namedType: DictItemFilter
readonly inlineType: [0, [1, ]]
}
readonly id: {
readonly _tag: "argumentOrInputField"
readonly namedType: LongFilter
readonly inlineType: [0, ]
}
readonly categoryId: {
readonly _tag: "argumentOrInputField"
readonly namedType: LongFilter
readonly inlineType: [0, ]
}
readonly parentId: {
readonly _tag: "argumentOrInputField"
readonly namedType: LongFilter
readonly inlineType: [0, ]
}
readonly code: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly name: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly value: {
readonly _tag: "argumentOrInputField"
readonly namedType: StringFilter
readonly inlineType: [0, ]
}
readonly sort: {
readonly _tag: "argumentOrInputField"
readonly namedType: IntFilter
readonly inlineType: [0, ]
}
readonly status: {
readonly _tag: "argumentOrInputField"
readonly namedType: IntFilter
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.DictItemFilter['type']
}

interface LongFilter extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "LongFilter"
readonly fields: {
readonly _eq: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _neq: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _gt: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _gte: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _lt: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _lte: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _in: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, [1, ]]
}
readonly _nin: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, [1, ]]
}
readonly _isNull: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Boolean
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.LongFilter['type']
}

interface StringFilter extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "StringFilter"
readonly fields: {
readonly _eq: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _neq: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _like: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _ilike: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _startsWith: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _endsWith: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _in: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, [1, ]]
}
readonly _nin: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, [1, ]]
}
readonly _isNull: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Boolean
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.StringFilter['type']
}

interface IntFilter extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "IntFilter"
readonly fields: {
readonly _eq: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
readonly _neq: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
readonly _gt: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
readonly _gte: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
readonly _lt: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
readonly _lte: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
readonly _in: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, [1, ]]
}
readonly _nin: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, [1, ]]
}
readonly _isNull: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Boolean
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.IntFilter['type']
}

interface BooleanFilter extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "BooleanFilter"
readonly fields: {
readonly _eq: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Boolean
readonly inlineType: [0, ]
}
readonly _neq: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Boolean
readonly inlineType: [0, ]
}
readonly _isNull: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Boolean
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.BooleanFilter['type']
}

interface EnumFilter extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "EnumFilter"
readonly fields: {
readonly _eq: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _neq: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _in: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, [1, ]]
}
readonly _nin: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, [1, ]]
}
readonly _isNull: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Boolean
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.EnumFilter['type']
}

interface DateTimeFilter extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "DateTimeFilter"
readonly fields: {
readonly _eq: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _neq: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _gt: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _gte: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _lt: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _lte: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
readonly _isNull: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Boolean
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.DateTimeFilter['type']
}

interface OrderByInput extends $$Utilities.SchemaDrivenDataMap.InputObject {
readonly _tag: "inputObject"
readonly name: "OrderByInput"
readonly fields: {
readonly field: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [1, ]
}
readonly direction: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.String
readonly inlineType: [0, ]
}
}
readonly type: $$Schema.OrderByInput['type']
}

interface UserConnection extends $$Utilities.SchemaDrivenDataMap.OutputObject {
readonly _tag: "outputObject"
readonly fields: {
readonly content: {
readonly _tag: "outputField"
readonly namedType: User
}
readonly totalElements: {
readonly _tag: "outputField"
readonly namedType: $$Scalar.Long
}
readonly totalPages: {
readonly _tag: "outputField"
}
readonly page: {
readonly _tag: "outputField"
}
readonly size: {
readonly _tag: "outputField"
}
}
}

interface User extends $$Utilities.SchemaDrivenDataMap.OutputObject {
readonly _tag: "outputObject"
readonly fields: {
readonly id: {
readonly _tag: "outputField"
}
readonly username: {
readonly _tag: "outputField"
}
readonly email: {
readonly _tag: "outputField"
}
readonly status: {
readonly _tag: "outputField"
}
readonly roles: {
readonly _tag: "outputField"
readonly namedType: Role
}
readonly createdAt: {
readonly _tag: "outputField"
}
readonly updatedAt: {
readonly _tag: "outputField"
}
}
}

interface RoleConnection extends $$Utilities.SchemaDrivenDataMap.OutputObject {
readonly _tag: "outputObject"
readonly fields: {
readonly content: {
readonly _tag: "outputField"
readonly namedType: Role
}
readonly totalElements: {
readonly _tag: "outputField"
readonly namedType: $$Scalar.Long
}
readonly totalPages: {
readonly _tag: "outputField"
}
readonly page: {
readonly _tag: "outputField"
}
readonly size: {
readonly _tag: "outputField"
}
}
}

interface Role extends $$Utilities.SchemaDrivenDataMap.OutputObject {
readonly _tag: "outputObject"
readonly fields: {
readonly id: {
readonly _tag: "outputField"
}
readonly code: {
readonly _tag: "outputField"
}
readonly name: {
readonly _tag: "outputField"
}
readonly description: {
readonly _tag: "outputField"
}
readonly permissions: {
readonly _tag: "outputField"
readonly namedType: Permission
}
}
}

interface Permission extends $$Utilities.SchemaDrivenDataMap.OutputObject {
readonly _tag: "outputObject"
readonly fields: {
readonly id: {
readonly _tag: "outputField"
}
readonly code: {
readonly _tag: "outputField"
}
readonly name: {
readonly _tag: "outputField"
}
readonly description: {
readonly _tag: "outputField"
}
readonly menuId: {
readonly _tag: "outputField"
}
readonly sortOrder: {
readonly _tag: "outputField"
}
readonly buttonType: {
readonly _tag: "outputField"
}
}
}

interface MenuConnection extends $$Utilities.SchemaDrivenDataMap.OutputObject {
readonly _tag: "outputObject"
readonly fields: {
readonly content: {
readonly _tag: "outputField"
readonly namedType: Menu
}
readonly totalElements: {
readonly _tag: "outputField"
readonly namedType: $$Scalar.Long
}
readonly totalPages: {
readonly _tag: "outputField"
}
readonly page: {
readonly _tag: "outputField"
}
readonly size: {
readonly _tag: "outputField"
}
}
}

interface Menu extends $$Utilities.SchemaDrivenDataMap.OutputObject {
readonly _tag: "outputObject"
readonly fields: {
readonly id: {
readonly _tag: "outputField"
}
readonly key: {
readonly _tag: "outputField"
}
readonly label: {
readonly _tag: "outputField"
}
readonly route: {
readonly _tag: "outputField"
}
readonly parentId: {
readonly _tag: "outputField"
}
readonly icon: {
readonly _tag: "outputField"
}
readonly sortOrder: {
readonly _tag: "outputField"
}
readonly isVisible: {
readonly _tag: "outputField"
}
readonly menuType: {
readonly _tag: "outputField"
}
readonly rolesAllowed: {
readonly _tag: "outputField"
}
readonly tenant: {
readonly _tag: "outputField"
}
readonly createdAt: {
readonly _tag: "outputField"
}
readonly updatedAt: {
readonly _tag: "outputField"
}
readonly metadata: {
readonly _tag: "outputField"
}
readonly children: {
readonly _tag: "outputField"
readonly namedType: Menu
}
}
}

interface DictCategoryConnection extends $$Utilities.SchemaDrivenDataMap.OutputObject {
readonly _tag: "outputObject"
readonly fields: {
readonly content: {
readonly _tag: "outputField"
readonly namedType: DictCategory
}
readonly totalElements: {
readonly _tag: "outputField"
readonly namedType: $$Scalar.Long
}
readonly totalPages: {
readonly _tag: "outputField"
}
readonly page: {
readonly _tag: "outputField"
}
readonly size: {
readonly _tag: "outputField"
}
}
}

interface DictCategory extends $$Utilities.SchemaDrivenDataMap.OutputObject {
readonly _tag: "outputObject"
readonly fields: {
readonly id: {
readonly _tag: "outputField"
}
readonly code: {
readonly _tag: "outputField"
}
readonly name: {
readonly _tag: "outputField"
}
readonly description: {
readonly _tag: "outputField"
}
readonly sort: {
readonly _tag: "outputField"
}
readonly status: {
readonly _tag: "outputField"
}
readonly tenant: {
readonly _tag: "outputField"
}
readonly createdAt: {
readonly _tag: "outputField"
}
readonly updatedAt: {
readonly _tag: "outputField"
}
readonly itemCount: {
readonly _tag: "outputField"
}
}
}

interface DictItemConnection extends $$Utilities.SchemaDrivenDataMap.OutputObject {
readonly _tag: "outputObject"
readonly fields: {
readonly content: {
readonly _tag: "outputField"
readonly namedType: DictItem
}
readonly totalElements: {
readonly _tag: "outputField"
readonly namedType: $$Scalar.Long
}
readonly totalPages: {
readonly _tag: "outputField"
}
readonly page: {
readonly _tag: "outputField"
}
readonly size: {
readonly _tag: "outputField"
}
}
}

interface DictItem extends $$Utilities.SchemaDrivenDataMap.OutputObject {
readonly _tag: "outputObject"
readonly fields: {
readonly id: {
readonly _tag: "outputField"
}
readonly categoryId: {
readonly _tag: "outputField"
}
readonly parentId: {
readonly _tag: "outputField"
}
readonly code: {
readonly _tag: "outputField"
}
readonly name: {
readonly _tag: "outputField"
}
readonly value: {
readonly _tag: "outputField"
}
readonly sort: {
readonly _tag: "outputField"
}
readonly status: {
readonly _tag: "outputField"
}
readonly remark: {
readonly _tag: "outputField"
}
readonly tenant: {
readonly _tag: "outputField"
}
readonly createdAt: {
readonly _tag: "outputField"
}
readonly updatedAt: {
readonly _tag: "outputField"
}
readonly children: {
readonly _tag: "outputField"
readonly namedType: DictItem
}
}
}

interface Query extends $$Utilities.SchemaDrivenDataMap.OutputObject {
readonly _tag: "outputObject"
readonly fields: {
readonly users: {
readonly _tag: "outputField"
readonly arguments: {
readonly where: {
readonly _tag: "argumentOrInputField"
readonly namedType: UserFilter
readonly inlineType: [0, ]
}
readonly orderBy: {
readonly _tag: "argumentOrInputField"
readonly namedType: OrderByInput
readonly inlineType: [0, [0, ]]
}
readonly page: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
readonly size: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
}
readonly $argumentsType: {
where?: SchemaDrivenDataMap['inputTypes']['UserFilter']['type'] | null | undefined
orderBy?: readonly (SchemaDrivenDataMap['inputTypes']['OrderByInput']['type'])[] | null | undefined
page?: $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
size?: $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
}
readonly namedType: UserConnection
}
readonly roles: {
readonly _tag: "outputField"
readonly arguments: {
readonly where: {
readonly _tag: "argumentOrInputField"
readonly namedType: RoleFilter
readonly inlineType: [0, ]
}
readonly orderBy: {
readonly _tag: "argumentOrInputField"
readonly namedType: OrderByInput
readonly inlineType: [0, [0, ]]
}
readonly page: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
readonly size: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
}
readonly $argumentsType: {
where?: SchemaDrivenDataMap['inputTypes']['RoleFilter']['type'] | null | undefined
orderBy?: readonly (SchemaDrivenDataMap['inputTypes']['OrderByInput']['type'])[] | null | undefined
page?: $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
size?: $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
}
readonly namedType: RoleConnection
}
readonly menus: {
readonly _tag: "outputField"
readonly arguments: {
readonly where: {
readonly _tag: "argumentOrInputField"
readonly namedType: MenuFilter
readonly inlineType: [0, ]
}
readonly orderBy: {
readonly _tag: "argumentOrInputField"
readonly namedType: OrderByInput
readonly inlineType: [0, [0, ]]
}
readonly page: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
readonly size: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
}
readonly $argumentsType: {
where?: SchemaDrivenDataMap['inputTypes']['MenuFilter']['type'] | null | undefined
orderBy?: readonly (SchemaDrivenDataMap['inputTypes']['OrderByInput']['type'])[] | null | undefined
page?: $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
size?: $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
}
readonly namedType: MenuConnection
}
readonly dictCategories: {
readonly _tag: "outputField"
readonly arguments: {
readonly where: {
readonly _tag: "argumentOrInputField"
readonly namedType: DictCategoryFilter
readonly inlineType: [0, ]
}
readonly orderBy: {
readonly _tag: "argumentOrInputField"
readonly namedType: OrderByInput
readonly inlineType: [0, [0, ]]
}
readonly page: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
readonly size: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
}
readonly $argumentsType: {
where?: SchemaDrivenDataMap['inputTypes']['DictCategoryFilter']['type'] | null | undefined
orderBy?: readonly (SchemaDrivenDataMap['inputTypes']['OrderByInput']['type'])[] | null | undefined
page?: $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
size?: $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
}
readonly namedType: DictCategoryConnection
}
readonly dictItems: {
readonly _tag: "outputField"
readonly arguments: {
readonly where: {
readonly _tag: "argumentOrInputField"
readonly namedType: DictItemFilter
readonly inlineType: [0, ]
}
readonly orderBy: {
readonly _tag: "argumentOrInputField"
readonly namedType: OrderByInput
readonly inlineType: [0, [0, ]]
}
readonly page: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
readonly size: {
readonly _tag: "argumentOrInputField"
readonly namedType: $$Scalar.Int
readonly inlineType: [0, ]
}
}
readonly $argumentsType: {
where?: SchemaDrivenDataMap['inputTypes']['DictItemFilter']['type'] | null | undefined
orderBy?: readonly (SchemaDrivenDataMap['inputTypes']['OrderByInput']['type'])[] | null | undefined
page?: $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
size?: $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
}
readonly namedType: DictItemConnection
}
}
}


    //
    //
    //
    //
    //
    //
    // ==================================================================================================
    //                                           ScalarStandard
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
    //                                            ScalarCustom
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
    //                                                Enum
    // ==================================================================================================
    //
    //
    //
    //
    //
    //


// None of your Enums have custom scalars.


    //
    //
    //
    //
    //
    //
    // ==================================================================================================
    //                                            InputObject
    // ==================================================================================================
    //
    //
    //
    //
    //
    //


const UserFilter: UserFilter = {
_tag: "inputObject",
name: "UserFilter",
fields: {
_and: {

_tag: "argumentOrInputField",
namedType: null as any as UserFilter,
inlineType: [0, [1, ]]
},
_or: {

_tag: "argumentOrInputField",
namedType: null as any as UserFilter,
inlineType: [0, [1, ]]
},
id: {

_tag: "argumentOrInputField",
namedType: null as any as LongFilter,
inlineType: [0, ]
},
username: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
email: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
status: {

_tag: "argumentOrInputField",
namedType: null as any as EnumFilter,
inlineType: [0, ]
},
createdAt: {

_tag: "argumentOrInputField",
namedType: null as any as DateTimeFilter,
inlineType: [0, ]
},
updatedAt: {

_tag: "argumentOrInputField",
namedType: null as any as DateTimeFilter,
inlineType: [0, ]
},
roles: {

_tag: "argumentOrInputField",
namedType: null as any as RoleFilter,
inlineType: [0, ]
}
},
type: {
_and: null as any as readonly (SchemaDrivenDataMap['inputTypes']['UserFilter']['type'])[] | null | undefined,
_or: null as any as readonly (SchemaDrivenDataMap['inputTypes']['UserFilter']['type'])[] | null | undefined,
id: null as any as SchemaDrivenDataMap['inputTypes']['LongFilter']['type'] | null | undefined,
username: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
email: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
status: null as any as SchemaDrivenDataMap['inputTypes']['EnumFilter']['type'] | null | undefined,
createdAt: null as any as SchemaDrivenDataMap['inputTypes']['DateTimeFilter']['type'] | null | undefined,
updatedAt: null as any as SchemaDrivenDataMap['inputTypes']['DateTimeFilter']['type'] | null | undefined,
roles: null as any as SchemaDrivenDataMap['inputTypes']['RoleFilter']['type'] | null | undefined
}
}

const RoleFilter: RoleFilter = {
_tag: "inputObject",
name: "RoleFilter",
fields: {
_and: {

_tag: "argumentOrInputField",
namedType: null as any as RoleFilter,
inlineType: [0, [1, ]]
},
_or: {

_tag: "argumentOrInputField",
namedType: null as any as RoleFilter,
inlineType: [0, [1, ]]
},
id: {

_tag: "argumentOrInputField",
namedType: null as any as LongFilter,
inlineType: [0, ]
},
code: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
name: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
description: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
permissions: {

_tag: "argumentOrInputField",
namedType: null as any as PermissionFilter,
inlineType: [0, ]
}
},
type: {
_and: null as any as readonly (SchemaDrivenDataMap['inputTypes']['RoleFilter']['type'])[] | null | undefined,
_or: null as any as readonly (SchemaDrivenDataMap['inputTypes']['RoleFilter']['type'])[] | null | undefined,
id: null as any as SchemaDrivenDataMap['inputTypes']['LongFilter']['type'] | null | undefined,
code: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
name: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
description: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
permissions: null as any as SchemaDrivenDataMap['inputTypes']['PermissionFilter']['type'] | null | undefined
}
}

const PermissionFilter: PermissionFilter = {
_tag: "inputObject",
name: "PermissionFilter",
fields: {
id: {

_tag: "argumentOrInputField",
namedType: null as any as LongFilter,
inlineType: [0, ]
},
code: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
name: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
}
},
type: {
id: null as any as SchemaDrivenDataMap['inputTypes']['LongFilter']['type'] | null | undefined,
code: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
name: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined
}
}

const MenuFilter: MenuFilter = {
_tag: "inputObject",
name: "MenuFilter",
fields: {
_and: {

_tag: "argumentOrInputField",
namedType: null as any as MenuFilter,
inlineType: [0, [1, ]]
},
_or: {

_tag: "argumentOrInputField",
namedType: null as any as MenuFilter,
inlineType: [0, [1, ]]
},
id: {

_tag: "argumentOrInputField",
namedType: null as any as LongFilter,
inlineType: [0, ]
},
key: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
label: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
route: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
parentId: {

_tag: "argumentOrInputField",
namedType: null as any as LongFilter,
inlineType: [0, ]
},
menuType: {

_tag: "argumentOrInputField",
namedType: null as any as EnumFilter,
inlineType: [0, ]
},
isVisible: {

_tag: "argumentOrInputField",
namedType: null as any as BooleanFilter,
inlineType: [0, ]
}
},
type: {
_and: null as any as readonly (SchemaDrivenDataMap['inputTypes']['MenuFilter']['type'])[] | null | undefined,
_or: null as any as readonly (SchemaDrivenDataMap['inputTypes']['MenuFilter']['type'])[] | null | undefined,
id: null as any as SchemaDrivenDataMap['inputTypes']['LongFilter']['type'] | null | undefined,
key: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
label: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
route: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
parentId: null as any as SchemaDrivenDataMap['inputTypes']['LongFilter']['type'] | null | undefined,
menuType: null as any as SchemaDrivenDataMap['inputTypes']['EnumFilter']['type'] | null | undefined,
isVisible: null as any as SchemaDrivenDataMap['inputTypes']['BooleanFilter']['type'] | null | undefined
}
}

const DictCategoryFilter: DictCategoryFilter = {
_tag: "inputObject",
name: "DictCategoryFilter",
fields: {
_and: {

_tag: "argumentOrInputField",
namedType: null as any as DictCategoryFilter,
inlineType: [0, [1, ]]
},
_or: {

_tag: "argumentOrInputField",
namedType: null as any as DictCategoryFilter,
inlineType: [0, [1, ]]
},
id: {

_tag: "argumentOrInputField",
namedType: null as any as LongFilter,
inlineType: [0, ]
},
code: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
name: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
description: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
sort: {

_tag: "argumentOrInputField",
namedType: null as any as IntFilter,
inlineType: [0, ]
},
status: {

_tag: "argumentOrInputField",
namedType: null as any as IntFilter,
inlineType: [0, ]
}
},
type: {
_and: null as any as readonly (SchemaDrivenDataMap['inputTypes']['DictCategoryFilter']['type'])[] | null | undefined,
_or: null as any as readonly (SchemaDrivenDataMap['inputTypes']['DictCategoryFilter']['type'])[] | null | undefined,
id: null as any as SchemaDrivenDataMap['inputTypes']['LongFilter']['type'] | null | undefined,
code: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
name: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
description: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
sort: null as any as SchemaDrivenDataMap['inputTypes']['IntFilter']['type'] | null | undefined,
status: null as any as SchemaDrivenDataMap['inputTypes']['IntFilter']['type'] | null | undefined
}
}

const DictItemFilter: DictItemFilter = {
_tag: "inputObject",
name: "DictItemFilter",
fields: {
_and: {

_tag: "argumentOrInputField",
namedType: null as any as DictItemFilter,
inlineType: [0, [1, ]]
},
_or: {

_tag: "argumentOrInputField",
namedType: null as any as DictItemFilter,
inlineType: [0, [1, ]]
},
id: {

_tag: "argumentOrInputField",
namedType: null as any as LongFilter,
inlineType: [0, ]
},
categoryId: {

_tag: "argumentOrInputField",
namedType: null as any as LongFilter,
inlineType: [0, ]
},
parentId: {

_tag: "argumentOrInputField",
namedType: null as any as LongFilter,
inlineType: [0, ]
},
code: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
name: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
value: {

_tag: "argumentOrInputField",
namedType: null as any as StringFilter,
inlineType: [0, ]
},
sort: {

_tag: "argumentOrInputField",
namedType: null as any as IntFilter,
inlineType: [0, ]
},
status: {

_tag: "argumentOrInputField",
namedType: null as any as IntFilter,
inlineType: [0, ]
}
},
type: {
_and: null as any as readonly (SchemaDrivenDataMap['inputTypes']['DictItemFilter']['type'])[] | null | undefined,
_or: null as any as readonly (SchemaDrivenDataMap['inputTypes']['DictItemFilter']['type'])[] | null | undefined,
id: null as any as SchemaDrivenDataMap['inputTypes']['LongFilter']['type'] | null | undefined,
categoryId: null as any as SchemaDrivenDataMap['inputTypes']['LongFilter']['type'] | null | undefined,
parentId: null as any as SchemaDrivenDataMap['inputTypes']['LongFilter']['type'] | null | undefined,
code: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
name: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
value: null as any as SchemaDrivenDataMap['inputTypes']['StringFilter']['type'] | null | undefined,
sort: null as any as SchemaDrivenDataMap['inputTypes']['IntFilter']['type'] | null | undefined,
status: null as any as SchemaDrivenDataMap['inputTypes']['IntFilter']['type'] | null | undefined
}
}

const LongFilter: LongFilter = {
_tag: "inputObject",
name: "LongFilter",
fields: {
_eq: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_neq: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_gt: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_gte: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_lt: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_lte: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_in: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, [1, ]]
},
_nin: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, [1, ]]
},
_isNull: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Boolean,
inlineType: [0, ]
}
},
type: {
_eq: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_neq: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_gt: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_gte: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_lt: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_lte: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_in: null as any as readonly ($$Scalar.String['codec']['_typeDecoded'])[] | null | undefined,
_nin: null as any as readonly ($$Scalar.String['codec']['_typeDecoded'])[] | null | undefined,
_isNull: null as any as $$Scalar.Boolean['codec']['_typeDecoded'] | null | undefined
}
}

const StringFilter: StringFilter = {
_tag: "inputObject",
name: "StringFilter",
fields: {
_eq: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_neq: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_like: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_ilike: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_startsWith: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_endsWith: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_in: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, [1, ]]
},
_nin: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, [1, ]]
},
_isNull: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Boolean,
inlineType: [0, ]
}
},
type: {
_eq: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_neq: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_like: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_ilike: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_startsWith: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_endsWith: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_in: null as any as readonly ($$Scalar.String['codec']['_typeDecoded'])[] | null | undefined,
_nin: null as any as readonly ($$Scalar.String['codec']['_typeDecoded'])[] | null | undefined,
_isNull: null as any as $$Scalar.Boolean['codec']['_typeDecoded'] | null | undefined
}
}

const IntFilter: IntFilter = {
_tag: "inputObject",
name: "IntFilter",
fields: {
_eq: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
},
_neq: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
},
_gt: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
},
_gte: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
},
_lt: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
},
_lte: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
},
_in: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, [1, ]]
},
_nin: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, [1, ]]
},
_isNull: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Boolean,
inlineType: [0, ]
}
},
type: {
_eq: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined,
_neq: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined,
_gt: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined,
_gte: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined,
_lt: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined,
_lte: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined,
_in: null as any as readonly ($$Scalar.Int['codec']['_typeDecoded'])[] | null | undefined,
_nin: null as any as readonly ($$Scalar.Int['codec']['_typeDecoded'])[] | null | undefined,
_isNull: null as any as $$Scalar.Boolean['codec']['_typeDecoded'] | null | undefined
}
}

const BooleanFilter: BooleanFilter = {
_tag: "inputObject",
name: "BooleanFilter",
fields: {
_eq: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Boolean,
inlineType: [0, ]
},
_neq: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Boolean,
inlineType: [0, ]
},
_isNull: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Boolean,
inlineType: [0, ]
}
},
type: {
_eq: null as any as $$Scalar.Boolean['codec']['_typeDecoded'] | null | undefined,
_neq: null as any as $$Scalar.Boolean['codec']['_typeDecoded'] | null | undefined,
_isNull: null as any as $$Scalar.Boolean['codec']['_typeDecoded'] | null | undefined
}
}

const EnumFilter: EnumFilter = {
_tag: "inputObject",
name: "EnumFilter",
fields: {
_eq: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_neq: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_in: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, [1, ]]
},
_nin: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, [1, ]]
},
_isNull: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Boolean,
inlineType: [0, ]
}
},
type: {
_eq: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_neq: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_in: null as any as readonly ($$Scalar.String['codec']['_typeDecoded'])[] | null | undefined,
_nin: null as any as readonly ($$Scalar.String['codec']['_typeDecoded'])[] | null | undefined,
_isNull: null as any as $$Scalar.Boolean['codec']['_typeDecoded'] | null | undefined
}
}

const DateTimeFilter: DateTimeFilter = {
_tag: "inputObject",
name: "DateTimeFilter",
fields: {
_eq: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_neq: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_gt: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_gte: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_lt: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_lte: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
},
_isNull: {

_tag: "argumentOrInputField",
namedType: $$Scalar.Boolean,
inlineType: [0, ]
}
},
type: {
_eq: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_neq: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_gt: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_gte: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_lt: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_lte: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined,
_isNull: null as any as $$Scalar.Boolean['codec']['_typeDecoded'] | null | undefined
}
}

const OrderByInput: OrderByInput = {
_tag: "inputObject",
name: "OrderByInput",
fields: {
field: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [1, ]
},
direction: {

_tag: "argumentOrInputField",
namedType: $$Scalar.String,
inlineType: [0, ]
}
},
type: {
field: null as any as $$Scalar.String['codec']['_typeDecoded'],
direction: null as any as $$Scalar.String['codec']['_typeDecoded'] | null | undefined
}
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


const UserConnection: UserConnection = {
_tag: "outputObject",
fields: {
content: {

_tag: "outputField",
namedType: null as any as User
},
totalElements: {

_tag: "outputField",
namedType: $$Scalar.Long
},
totalPages: {

_tag: "outputField"
},
page: {

_tag: "outputField"
},
size: {

_tag: "outputField"
}
}
}

const User: User = {
_tag: "outputObject",
fields: {
id: {

_tag: "outputField"
},
username: {

_tag: "outputField"
},
email: {

_tag: "outputField"
},
status: {

_tag: "outputField"
},
roles: {

_tag: "outputField",
namedType: null as any as Role
},
createdAt: {

_tag: "outputField"
},
updatedAt: {

_tag: "outputField"
}
}
}

const RoleConnection: RoleConnection = {
_tag: "outputObject",
fields: {
content: {

_tag: "outputField",
namedType: null as any as Role
},
totalElements: {

_tag: "outputField",
namedType: $$Scalar.Long
},
totalPages: {

_tag: "outputField"
},
page: {

_tag: "outputField"
},
size: {

_tag: "outputField"
}
}
}

const Role: Role = {
_tag: "outputObject",
fields: {
id: {

_tag: "outputField"
},
code: {

_tag: "outputField"
},
name: {

_tag: "outputField"
},
description: {

_tag: "outputField"
},
permissions: {

_tag: "outputField",
namedType: null as any as Permission
}
}
}

const Permission: Permission = {
_tag: "outputObject",
fields: {
id: {

_tag: "outputField"
},
code: {

_tag: "outputField"
},
name: {

_tag: "outputField"
},
description: {

_tag: "outputField"
},
menuId: {

_tag: "outputField"
},
sortOrder: {

_tag: "outputField"
},
buttonType: {

_tag: "outputField"
}
}
}

const MenuConnection: MenuConnection = {
_tag: "outputObject",
fields: {
content: {

_tag: "outputField",
namedType: null as any as Menu
},
totalElements: {

_tag: "outputField",
namedType: $$Scalar.Long
},
totalPages: {

_tag: "outputField"
},
page: {

_tag: "outputField"
},
size: {

_tag: "outputField"
}
}
}

const Menu: Menu = {
_tag: "outputObject",
fields: {
id: {

_tag: "outputField"
},
key: {

_tag: "outputField"
},
label: {

_tag: "outputField"
},
route: {

_tag: "outputField"
},
parentId: {

_tag: "outputField"
},
icon: {

_tag: "outputField"
},
sortOrder: {

_tag: "outputField"
},
isVisible: {

_tag: "outputField"
},
menuType: {

_tag: "outputField"
},
rolesAllowed: {

_tag: "outputField"
},
tenant: {

_tag: "outputField"
},
createdAt: {

_tag: "outputField"
},
updatedAt: {

_tag: "outputField"
},
metadata: {

_tag: "outputField"
},
children: {

_tag: "outputField",
namedType: null as any as Menu
}
}
}

const DictCategoryConnection: DictCategoryConnection = {
_tag: "outputObject",
fields: {
content: {

_tag: "outputField",
namedType: null as any as DictCategory
},
totalElements: {

_tag: "outputField",
namedType: $$Scalar.Long
},
totalPages: {

_tag: "outputField"
},
page: {

_tag: "outputField"
},
size: {

_tag: "outputField"
}
}
}

const DictCategory: DictCategory = {
_tag: "outputObject",
fields: {
id: {

_tag: "outputField"
},
code: {

_tag: "outputField"
},
name: {

_tag: "outputField"
},
description: {

_tag: "outputField"
},
sort: {

_tag: "outputField"
},
status: {

_tag: "outputField"
},
tenant: {

_tag: "outputField"
},
createdAt: {

_tag: "outputField"
},
updatedAt: {

_tag: "outputField"
},
itemCount: {

_tag: "outputField"
}
}
}

const DictItemConnection: DictItemConnection = {
_tag: "outputObject",
fields: {
content: {

_tag: "outputField",
namedType: null as any as DictItem
},
totalElements: {

_tag: "outputField",
namedType: $$Scalar.Long
},
totalPages: {

_tag: "outputField"
},
page: {

_tag: "outputField"
},
size: {

_tag: "outputField"
}
}
}

const DictItem: DictItem = {
_tag: "outputObject",
fields: {
id: {

_tag: "outputField"
},
categoryId: {

_tag: "outputField"
},
parentId: {

_tag: "outputField"
},
code: {

_tag: "outputField"
},
name: {

_tag: "outputField"
},
value: {

_tag: "outputField"
},
sort: {

_tag: "outputField"
},
status: {

_tag: "outputField"
},
remark: {

_tag: "outputField"
},
tenant: {

_tag: "outputField"
},
createdAt: {

_tag: "outputField"
},
updatedAt: {

_tag: "outputField"
},
children: {

_tag: "outputField",
namedType: null as any as DictItem
}
}
}



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


// None of your Interfaces have custom scalars.


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


// None of your Unions have custom scalars.


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


const Query: Query = {
_tag: "outputObject",
fields: {
users: {

_tag: "outputField",
arguments: {
where: {
_tag: "argumentOrInputField",
namedType: UserFilter,
inlineType: [0, ]
},
orderBy: {
_tag: "argumentOrInputField",
namedType: OrderByInput,
inlineType: [0, [0, ]]
},
page: {
_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
},
size: {
_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
}
},
$argumentsType: {
where: null as any as SchemaDrivenDataMap['inputTypes']['UserFilter']['type'] | null | undefined,
orderBy: null as any as readonly (SchemaDrivenDataMap['inputTypes']['OrderByInput']['type'])[] | null | undefined,
page: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined,
size: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
},
namedType: null as any as UserConnection
},
roles: {

_tag: "outputField",
arguments: {
where: {
_tag: "argumentOrInputField",
namedType: RoleFilter,
inlineType: [0, ]
},
orderBy: {
_tag: "argumentOrInputField",
namedType: OrderByInput,
inlineType: [0, [0, ]]
},
page: {
_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
},
size: {
_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
}
},
$argumentsType: {
where: null as any as SchemaDrivenDataMap['inputTypes']['RoleFilter']['type'] | null | undefined,
orderBy: null as any as readonly (SchemaDrivenDataMap['inputTypes']['OrderByInput']['type'])[] | null | undefined,
page: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined,
size: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
},
namedType: null as any as RoleConnection
},
menus: {

_tag: "outputField",
arguments: {
where: {
_tag: "argumentOrInputField",
namedType: MenuFilter,
inlineType: [0, ]
},
orderBy: {
_tag: "argumentOrInputField",
namedType: OrderByInput,
inlineType: [0, [0, ]]
},
page: {
_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
},
size: {
_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
}
},
$argumentsType: {
where: null as any as SchemaDrivenDataMap['inputTypes']['MenuFilter']['type'] | null | undefined,
orderBy: null as any as readonly (SchemaDrivenDataMap['inputTypes']['OrderByInput']['type'])[] | null | undefined,
page: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined,
size: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
},
namedType: null as any as MenuConnection
},
dictCategories: {

_tag: "outputField",
arguments: {
where: {
_tag: "argumentOrInputField",
namedType: DictCategoryFilter,
inlineType: [0, ]
},
orderBy: {
_tag: "argumentOrInputField",
namedType: OrderByInput,
inlineType: [0, [0, ]]
},
page: {
_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
},
size: {
_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
}
},
$argumentsType: {
where: null as any as SchemaDrivenDataMap['inputTypes']['DictCategoryFilter']['type'] | null | undefined,
orderBy: null as any as readonly (SchemaDrivenDataMap['inputTypes']['OrderByInput']['type'])[] | null | undefined,
page: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined,
size: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
},
namedType: null as any as DictCategoryConnection
},
dictItems: {

_tag: "outputField",
arguments: {
where: {
_tag: "argumentOrInputField",
namedType: DictItemFilter,
inlineType: [0, ]
},
orderBy: {
_tag: "argumentOrInputField",
namedType: OrderByInput,
inlineType: [0, [0, ]]
},
page: {
_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
},
size: {
_tag: "argumentOrInputField",
namedType: $$Scalar.Int,
inlineType: [0, ]
}
},
$argumentsType: {
where: null as any as SchemaDrivenDataMap['inputTypes']['DictItemFilter']['type'] | null | undefined,
orderBy: null as any as readonly (SchemaDrivenDataMap['inputTypes']['OrderByInput']['type'])[] | null | undefined,
page: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined,
size: null as any as $$Scalar.Int['codec']['_typeDecoded'] | null | undefined
},
namedType: null as any as DictItemConnection
}
}
}



    //
    //
    //
    //
    //
    //
    // ==================================================================================================
    //                                       Reference Assignments
//                                (avoids circular assignment issues)
    // ==================================================================================================
    //
    //
    //
    //
    //
    //


// TODO: Contribute helper to Utilities to cast readonly data to mutable at type level.
// These assignments are needed to avoid circular references during module initialization.
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
UserFilter.fields![`_and`]!.namedType = UserFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
UserFilter.fields![`_or`]!.namedType = UserFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
UserFilter.fields![`id`]!.namedType = LongFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
UserFilter.fields![`username`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
UserFilter.fields![`email`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
UserFilter.fields![`status`]!.namedType = EnumFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
UserFilter.fields![`createdAt`]!.namedType = DateTimeFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
UserFilter.fields![`updatedAt`]!.namedType = DateTimeFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
UserFilter.fields![`roles`]!.namedType = RoleFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
RoleFilter.fields![`_and`]!.namedType = RoleFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
RoleFilter.fields![`_or`]!.namedType = RoleFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
RoleFilter.fields![`id`]!.namedType = LongFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
RoleFilter.fields![`code`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
RoleFilter.fields![`name`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
RoleFilter.fields![`description`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
RoleFilter.fields![`permissions`]!.namedType = PermissionFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
PermissionFilter.fields![`id`]!.namedType = LongFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
PermissionFilter.fields![`code`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
PermissionFilter.fields![`name`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
MenuFilter.fields![`_and`]!.namedType = MenuFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
MenuFilter.fields![`_or`]!.namedType = MenuFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
MenuFilter.fields![`id`]!.namedType = LongFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
MenuFilter.fields![`key`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
MenuFilter.fields![`label`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
MenuFilter.fields![`route`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
MenuFilter.fields![`parentId`]!.namedType = LongFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
MenuFilter.fields![`menuType`]!.namedType = EnumFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
MenuFilter.fields![`isVisible`]!.namedType = BooleanFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictCategoryFilter.fields![`_and`]!.namedType = DictCategoryFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictCategoryFilter.fields![`_or`]!.namedType = DictCategoryFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictCategoryFilter.fields![`id`]!.namedType = LongFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictCategoryFilter.fields![`code`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictCategoryFilter.fields![`name`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictCategoryFilter.fields![`description`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictCategoryFilter.fields![`sort`]!.namedType = IntFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictCategoryFilter.fields![`status`]!.namedType = IntFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictItemFilter.fields![`_and`]!.namedType = DictItemFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictItemFilter.fields![`_or`]!.namedType = DictItemFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictItemFilter.fields![`id`]!.namedType = LongFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictItemFilter.fields![`categoryId`]!.namedType = LongFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictItemFilter.fields![`parentId`]!.namedType = LongFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictItemFilter.fields![`code`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictItemFilter.fields![`name`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictItemFilter.fields![`value`]!.namedType = StringFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictItemFilter.fields![`sort`]!.namedType = IntFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictItemFilter.fields![`status`]!.namedType = IntFilter
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
UserConnection.fields[`content`]!.namedType = User
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
User.fields[`roles`]!.namedType = Role
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
RoleConnection.fields[`content`]!.namedType = Role
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
Role.fields[`permissions`]!.namedType = Permission
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
MenuConnection.fields[`content`]!.namedType = Menu
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
Menu.fields[`children`]!.namedType = Menu
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictCategoryConnection.fields[`content`]!.namedType = DictCategory
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictItemConnection.fields[`content`]!.namedType = DictItem
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
DictItem.fields[`children`]!.namedType = DictItem
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
Query.fields[`users`]!.namedType = UserConnection
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
Query.fields[`roles`]!.namedType = RoleConnection
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
Query.fields[`menus`]!.namedType = MenuConnection
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
Query.fields[`dictCategories`]!.namedType = DictCategoryConnection
// @ts-expect-error Assignment to readonly property is needed for circular reference handling.
Query.fields[`dictItems`]!.namedType = DictItemConnection


    //
    //
    //
    //
    //
    //
    // ==================================================================================================
    //                                               Index
    // ==================================================================================================
    //
    //
    //
    //
    //
    //


interface SchemaDrivenDataMap extends $$Utilities.SchemaDrivenDataMap {
readonly operations: {
readonly query: Query
}
readonly directives: {}
readonly inputTypes: {
readonly Int: $$Scalar.Int
readonly String: $$Scalar.String
readonly Boolean: $$Scalar.Boolean
readonly Long: $$Scalar.Long
readonly UserFilter: UserFilter
readonly RoleFilter: RoleFilter
readonly PermissionFilter: PermissionFilter
readonly MenuFilter: MenuFilter
readonly DictCategoryFilter: DictCategoryFilter
readonly DictItemFilter: DictItemFilter
readonly LongFilter: LongFilter
readonly StringFilter: StringFilter
readonly IntFilter: IntFilter
readonly BooleanFilter: BooleanFilter
readonly EnumFilter: EnumFilter
readonly DateTimeFilter: DateTimeFilter
readonly OrderByInput: OrderByInput
}
readonly outputTypes: {
readonly Int: $$Scalar.Int
readonly String: $$Scalar.String
readonly Boolean: $$Scalar.Boolean
readonly Long: $$Scalar.Long
readonly UserConnection: UserConnection
readonly User: User
readonly RoleConnection: RoleConnection
readonly Role: Role
readonly Permission: Permission
readonly MenuConnection: MenuConnection
readonly Menu: Menu
readonly DictCategoryConnection: DictCategoryConnection
readonly DictCategory: DictCategory
readonly DictItemConnection: DictItemConnection
readonly DictItem: DictItem
readonly Query: Query
}
readonly scalarTypes: {
readonly Int: $$Scalar.Int
readonly String: $$Scalar.String
readonly Boolean: $$Scalar.Boolean
readonly Long: $$Scalar.Long
}
}

const $schemaDrivenDataMap: SchemaDrivenDataMap =
{
operations: {
query: Query
},
directives: {},
inputTypes: {


Int: $$Scalar.Int,
String: $$Scalar.String,
Boolean: $$Scalar.Boolean,
Long: $$Scalar.Long,
UserFilter,
RoleFilter,
PermissionFilter,
MenuFilter,
DictCategoryFilter,
DictItemFilter,
LongFilter,
StringFilter,
IntFilter,
BooleanFilter,
EnumFilter,
DateTimeFilter,
OrderByInput
},
outputTypes: {


Int: $$Scalar.Int,
String: $$Scalar.String,
Boolean: $$Scalar.Boolean,
Long: $$Scalar.Long,
UserConnection,
User,
RoleConnection,
Role,
Permission,
MenuConnection,
Menu,
DictCategoryConnection,
DictCategory,
DictItemConnection,
DictItem,
Query
},
scalarTypes: {


Int: $$Scalar.Int,
String: $$Scalar.String,
Boolean: $$Scalar.Boolean,
Long: $$Scalar.Long
}
}

export { $schemaDrivenDataMap as schemaDrivenDataMap }
export type { SchemaDrivenDataMap }