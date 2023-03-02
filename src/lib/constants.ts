export enum AppMessages {
  TOGGLE_PLUGIN_VISIBILITY = 'TOGGLE_PLUGIN_VISIBILITY',
  EXTRACT_CONTENT = 'EXTRACT_CONTENT',
}

export enum StorageKeys {
  RESULTS = 'RESULTS',
  RECENT_PROJECT = 'RECENT_PROJECT',
}

export const APP_WINDOW_DIMS = {
  width: `300px`,
  height: `400px`,
} as const
