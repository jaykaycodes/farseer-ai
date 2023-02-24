/**
 * NOTE: This file just exists so we don't have circular references between *.queries.ts <-> index.ts <-> *.mutations.ts
 */

import { mergeQueryKeys } from '@lukemorales/query-key-factory'

import { projectQueries } from './project.queries'

export default mergeQueryKeys(projectQueries)
