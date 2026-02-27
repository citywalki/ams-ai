import type * as $$Utilities from 'graffle/utilities-for-generated'
import type { GraphqlKit } from 'graffle/utilities-for-generated'
import type { $DefaultSelectionContext } from '../../_context.js'
import type * as $Named from '../../$named.js'

export type * as PermissionFilter from './fields.js'

/**
* Input for {@link https://graphql.org/learn/schema/#input-types | InputObject}.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Fields** | 3 |
* | **All Fields Nullable** | Yes |
*/
export interface PermissionFilter<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> {
id?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.LongFilter<_$Context> | null | undefined>,
code?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.StringFilter<_$Context> | null | undefined>,
name?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.StringFilter<_$Context> | null | undefined>
}