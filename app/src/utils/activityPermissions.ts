import { ActivityPermissionsOut, RecordAction } from 'api/api-schema';

export const activityPermissionActions = (permissions?: ActivityPermissionsOut): RecordAction[] => {
  if (!permissions) return [];
  const actions: RecordAction[] = [];
  if (permissions.can_edit) actions.push('EDIT');
  if (permissions.can_submit) actions.push('SUBMIT');
  if (permissions.can_delete) actions.push('DELETE');
  return actions;
};
