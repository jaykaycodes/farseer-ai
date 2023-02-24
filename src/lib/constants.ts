import type { IProject } from '~schemas'

export const TOGGLE_PLUGIN_VISIBILITY = 'TOGGLE_PLUGIN_VISIBILITY'
export const DEFAULT_PROJECT_ID = 'DEFAULT_PROJECT_ID'
export const DEFAULT_FIELD_ID = 'DEFAULT_FIELD_ID'
export const DEFAULT_OUTLET_ID = 'DEFAULT_OUTLET_ID'

export const defaultProject: IProject = {
  id: DEFAULT_PROJECT_ID,
  name: 'Default',
  fields: [],
  outlets: [],
}
