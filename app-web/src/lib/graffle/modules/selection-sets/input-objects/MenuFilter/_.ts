import type * as $$Utilities from 'graffle/utilities-for-generated'
import type { GraphqlKit } from 'graffle/utilities-for-generated'
import type { $DefaultSelectionContext } from '../../_context.js'
import type * as $Named from '../../$named.js'

export type * as MenuFilter from './fields.js'

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
export interface MenuFilter<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> {
_and?: GraphqlKit.Document.Object.Var.MaybeSchemaful<Array<GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.MenuFilter<_$Context> | null | undefined>> | null | undefined>,
_or?: GraphqlKit.Document.Object.Var.MaybeSchemaful<Array<GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.MenuFilter<_$Context> | null | undefined>> | null | undefined>,
id?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.LongFilter<_$Context> | null | undefined>,
key?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.StringFilter<_$Context> | null | undefined>,
label?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.StringFilter<_$Context> | null | undefined>,
route?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.StringFilter<_$Context> | null | undefined>,
parentId?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.LongFilter<_$Context> | null | undefined>,
menuType?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.EnumFilter<_$Context> | null | undefined>,
isVisible?: GraphqlKit.Document.Object.Var.MaybeSchemaful<$Named.BooleanFilter<_$Context> | null | undefined>
}