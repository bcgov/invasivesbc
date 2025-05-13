import IActivityPermissions from 'interfaces/IActivityPermissions';

/**
 * @desc Parse an Inbound Activity for its assigned permissions, defaulting to false
 * @param {Record<PropertyKey, any>} inboundData Incoming Activity Data
 * @param {Boolean} override Overrides client-side permissions of a record (e.g. Serialized Activity handling)
 * @returns {IActivityPermissions} User specific permissions for a given record.
 */
const parseActivityForPermissions = (
  inboundData: Record<PropertyKey, any>,
  override?: boolean
): IActivityPermissions => {
  const can_delete = !!inboundData?.can_delete;
  const can_edit = !!inboundData.can_edit;

  // Remove permissions from Activity to avoid any recycling of state back into the db.
  delete inboundData?.can_delete;
  delete inboundData?.can_edit;
  if (override != undefined) {
    return {
      can_delete: override,
      can_edit: override
    };
  }

  return { can_delete, can_edit };
};

export default parseActivityForPermissions;
