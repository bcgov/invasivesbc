import { ActivityType } from "src/constants/activities";
import { generateDBActivityPayload, populateSpeciesArrays } from "utils/addActivity";

export const activity_create_function = (
  type: string,
  subType: string,
  username: string,
  accessRoles: Array<any>,
  displayName: string,
  pac_number?: string
) => {
  let activityV1 = generateDBActivityPayload({}, null, type, subType);
  let activityV2 = populateSpeciesArrays(activityV1);
  activityV2.created_by = username;
  activityV2.user_role = accessRoles.map((role) => role.role_id);

  //    if ([ActivityType.Observation, ActivityType.Treatment].includes(activityV2.activity_type))
  {
    activityV2.form_data.activity_type_data.activity_persons = [{ person_name: displayName }];
  }

  if ([ActivityType.Treatment].includes(activityV2.activity_type)) {
    activityV2.form_data.activity_type_data.activity_persons[0].applicator_license = pac_number;
  }

  return activityV2;
};