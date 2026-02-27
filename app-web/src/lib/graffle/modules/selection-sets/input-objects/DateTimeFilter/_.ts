import type * as $$Utilities from 'graffle/utilities-for-generated'
import type { GraphqlKit } from 'graffle/utilities-for-generated'
import type { $DefaultSelectionContext } from '../../_context.js'
import type * as $Scalars from '../../scalars/_.js'

export type * as DateTimeFilter from './fields.js'

/**
* Input for {@link https://graphql.org/learn/schema/#input-types | InputObject}.
*
* # Info
*
* | | |
* | - | - |
* | **Kind** | {@link https://graphql.org/graphql-js/type/#graphqlinputobjecttype | InputObject ↗} |
* | **Fields** | 7 |
* | **All Fields Nullable** | Yes |
*/
export interface DateTimeFilter<_$Context extends GraphqlKit.Document.Object.Select.SelectionContext = $DefaultSelectionContext> {
_eq?: $Scalars.String<_$Context>,
_neq?: $Scalars.String<_$Context>,
_gt?: $Scalars.String<_$Context>,
_gte?: $Scalars.String<_$Context>,
_lt?: $Scalars.String<_$Context>,
_lte?: $Scalars.String<_$Context>,
_isNull?: $Scalars.Boolean<_$Context>
}