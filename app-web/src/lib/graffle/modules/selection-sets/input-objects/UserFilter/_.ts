import type * as $$Utilities from 'graffle/utilities-for-generated'
import type { GraphqlKit } from 'graffle/utilities-for-generated'
import type { $DefaultSelectionContext } from '../../_context.js'
import type * as $Named from '../../$named.js'

export type * as UserFilter from './fields.js'

/**
* Input for {@link https://graphql.org/learn/schema/#input-types | InputObject}.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Fields** | 9 |
* | **All Fields Nullable** | Yes |
*/
export interface UserFilter<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> {
_and?: GraphqlKit.Document.Object.Var.MaybeSchemaful<Array<GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.UserFilter<_$Context> | null | undefined>> | null | undefined>,
_or?: GraphqlKit.Document.Object.Var.MaybeSchemaful<Array<GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.UserFilter<_$Context> | null | undefined>> | null | undefined>,
id?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.LongFilter<_$Context> | null | undefined>,
username?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.StringFilter<_$Context> | null | undefined>,
email?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.StringFilter<_$Context> | null | undefined>,
status?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.EnumFilter<_$Context> | null | undefined>,
createdAt?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.DateTimeFilter<_$Context> | null | undefined>,
updatedAt?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.DateTimeFilter<_$Context> | null | undefined>,
roles?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.RoleFilter<_$Context> | null | undefined>
}