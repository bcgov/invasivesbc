// Super user role
const ROLE_SUPER_USER = 'SUP';
// Admin role
const ROLE_ADMIN = 'ADM';
// Data editor role
const ROLE_DATA_EDITOR = 'DAE';
// View only role
const ROLE_DATA_VIEWER = 'DAV';

// Array of all supported roles
export const ALL_ROLES = [ROLE_SUPER_USER, ROLE_ADMIN, ROLE_DATA_EDITOR, ROLE_DATA_VIEWER];

// Array of all roles with read and write capabilities
export const WRITE_ROLES = [ROLE_SUPER_USER, ROLE_ADMIN, ROLE_DATA_EDITOR];

/**
 * Caching keys, for use with `memory-cache`.
 *
 * @export
 * @enum {number}
 */
export enum CacheKeys {
  ObservationCodePlant = 'observationCodePlant'
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
  AUTH_READ = 'authenticated-read'
}
