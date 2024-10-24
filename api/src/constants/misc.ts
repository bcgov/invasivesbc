export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DATA_EDITOR = 'data-editor',
  ADMIN_PLANTS = 'administrator_plants',
  ADMIN_ANIMALS = 'administrator_animals',
  BCGOV_STAFF_ANIMALS = 'bcgov_staff_animals',
  BCGOV_STAFF_PLANTS = 'bcgov_staff_plants',
  BCGOV_STAFF_BOTH = 'bcgov_staff_both',
  CONTRACTOR_MANAGER_ANIMALS = 'contractor_manager_animals',
  CONTRACTOR_MANAGER_PLANTS = 'contractor_manager_plants',
  CONTRACTOR_MANAGER_BOTH = 'contractor_manager_both',
  CONTRACTOR_STAFF_PLANTS = 'contractor_staff_plants',
  CONTRACTOR_STAFF_ANIMALS = 'contractor_staff_animals',
  CONTRACTOR_STAFF_BOTH = 'contractor_staff_both',
  INDIGENOUS_RISO_MANAGER_ANIMALS = 'indigenous_riso_manager_animals',
  INDIGENOUS_RISO_MANAGER_PLANTS = 'indigenous_riso_manager_plants',
  INDIGENOUS_RISO_MANAGER_BOTH = 'indigenous_riso_manager_both',
  INDIGENOUS_RISO_STAFF_ANIMALS = 'indigenous_riso_staff_animals',
  INDIGENOUS_RISO_STAFF_PLANTS = 'indigenous_riso_staff_plants',
  INDIGENOUS_RISO_STAFF_BOTH = 'indigenous_riso_staff_both',
  MUSSEL_INSPECTION_OFFICER = 'mussel_inspection_officer',
  MASTER_ADMINISTRATOR = 'master_administrator',
  PRIMARY_BIOCONTROL_USER = 'biocontrol_user'
}

export const SECURITY_ON = process.env.SECURITY_ON === 'false' ? false : true;

export const ALL_ROLES = [
  Role.ADMIN,
  Role.MANAGER,
  Role.DATA_EDITOR,
  Role.ADMIN_ANIMALS,
  Role.ADMIN_PLANTS,
  Role.BCGOV_STAFF_ANIMALS,
  Role.BCGOV_STAFF_PLANTS,
  Role.BCGOV_STAFF_BOTH,
  Role.CONTRACTOR_MANAGER_ANIMALS,
  Role.CONTRACTOR_MANAGER_PLANTS,
  Role.CONTRACTOR_MANAGER_BOTH,
  Role.CONTRACTOR_STAFF_PLANTS,
  Role.CONTRACTOR_STAFF_ANIMALS,
  Role.CONTRACTOR_STAFF_BOTH,
  Role.INDIGENOUS_RISO_MANAGER_ANIMALS,
  Role.INDIGENOUS_RISO_MANAGER_PLANTS,
  Role.INDIGENOUS_RISO_MANAGER_BOTH,
  Role.INDIGENOUS_RISO_STAFF_ANIMALS,
  Role.INDIGENOUS_RISO_STAFF_PLANTS,
  Role.INDIGENOUS_RISO_STAFF_BOTH,
  Role.MUSSEL_INSPECTION_OFFICER,
  Role.MASTER_ADMINISTRATOR,
  Role.PRIMARY_BIOCONTROL_USER
];

/**
 * Caching keys, for use with `memory-cache`.
 *
 * @export
 * @enum {number}
 */
export enum CacheKeys {
  ALL_CODE_CATEGORIES = 'all-code-categories',
  ALL_CODE_HEADERS = 'all-code-headers',
  ALL_CODES = 'all-codes'
}

/**
 * Supported activity types.
 *
 * @export
 * @enum {number}
 */
export enum ActivityType {
  OBSERVATION = 'Observation',
  MONITOR = 'Monitor',
  TREATMENT = 'Treatment'
}

/**
 * Supported activity sub types.
 *
 * @export
 * @enum {number}
 */
export enum ActivitySubType {
  TERRESTRIAL_PLANT = 'Terrestrial Plant',
  AQUATIC_PLANT = 'Aquatic Plant',
  AQUATIC_TERRESTRIAL_PLANT = 'Aquatic Terrestrial Plant',
  TERRESTRIAL_ANIMAL = 'Terrestrial Animal',
  AQUATIC_ANIMAL = 'Aquatic Animal',
  AQUATIC_TERRESTRIAL_ANIMAL = 'Aquatic Terrestrial Animal'
}

/**
 * Some of the S3 ACL roles supported by default.
 *
 * Full list: https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl
 *
 * @export
 * @enum {number}
 */
export enum S3ACLRole {
  AUTH_READ = 'authenticated-read',
  PUBLIC_READ = 'public-read'
}

/**
 * Root custom api-doc.json keys for any `x-...` fields.
 *
 * @export
 * @enum {number}
 */
export enum X_API_DOC_KEYS {
  /**
   * specifies a field whose value is an object containing `x-enum-code...` fields (see `X_ENUM_CODE`)
   */
  X_ENUM_CODE = 'x-enum-code'
}

/**
 * Nested keys in a `x-enum-code` field (see `X_API_DOC_KEYS.X_ENUM_CODE`)
 *
 * @export
 * @enum {number}
 */
export enum X_ENUM_CODE {
  /**
   * The `code_category` name.
   */
  CATEGORY_NAME = 'x-enum-code-category-name',
  /**
   * The `code_header` name.
   */
  HEADER_NAME = 'x-enum-code-header-name',
  /**
   * The `code` column name that holds the unique code value.
   */
  CODE_NAME = 'x-enum-code-name',
  /**
   * The `code` column name that holds the human readable name for the code value.
   */
  CODE_TEXT = 'x-enum-code-text',
  /**
   * The `code` column name that defines the sort order.
   */
  CODE_SORT_ORDER = 'x-enum-code-sort-order'
}

/**
 * The default number of records the search endpoint can return.
 *
 * @type {number}
 */
export const SEARCH_LIMIT_DEFAULT = 1000;

/**
 * The maximum number of records the search endpoint can return.
 *
 * @type {number}
 */
export const SEARCH_LIMIT_MAX = 999999;

/**
 * Supported PSQL `ORDER BY` directions.
 *
 * @export
 * @enum {number}
 */
export enum SORT_DIRECTION {
  ASC = 'ASC',
  DESC = 'DESC'
}
