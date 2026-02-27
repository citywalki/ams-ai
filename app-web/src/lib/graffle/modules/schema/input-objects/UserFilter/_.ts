import type * as $Fields from './fields.js'

export * as UserFilter from './fields.js'

/**
* GraphQL {@link https://graphql.org/learn/schema/#input-types | InputObject}.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Fields** | 9 |
* | **All Fields Nullable** | Yes |
*/
export interface UserFilter {
kind: "InputObject",
name: "UserFilter",
isAllFieldsNullable: true,
fields: {
_and: $Fields._and,
_or: $Fields._or,
id: $Fields.id,
username: $Fields.username,
email: $Fields.email,
status: $Fields.status,
createdAt: $Fields.createdAt,
updatedAt: $Fields.updatedAt,
roles: $Fields.roles
},
type: {
_and?: $Fields._and['type'],
_or?: $Fields._or['type'],
id?: $Fields.id['type'],
username?: $Fields.username['type'],
email?: $Fields.email['type'],
status?: $Fields.status['type'],
createdAt?: $Fields.createdAt['type'],
updatedAt?: $Fields.updatedAt['type'],
roles?: $Fields.roles['type']
}
}