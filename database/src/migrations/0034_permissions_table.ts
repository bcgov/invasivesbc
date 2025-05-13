/**
 * Introduces New Functions, Tables, Triggers, and Views
 * Functions:
 *  - get_user_permissions(uid integer)
 *  - get_user_permissions_for_activity_subtype(uid integer, subtype text)
 *  - fetch_activity_with_user_permissions
 *  - [Trigger Func] add_new_permission_category_to_existing_roles
 *  - [Trigger Func] add_new_role_to_existing_permissions
 *
 * Tables:
 *  - PERMISSIONS
 *  - PERMISSION_CATEGORY
 *  - ACTIVITY_SUBTYPE_PERMISSION_CATEGORY
 *
 * Triggers:
 *  - t_after_user_role_insert
 *  - t_after_permission_category_insert
 *
 * Views:
 *  - SUBTYPE_PERMISSIONS
 *  - ROLE_PERMISSIONS
 *
 * Types:
 *  - activity_record_with_permissions
 */

import { Knex } from 'knex';
import { Role } from '../../constants/roles';

export async function up(knex: Knex): Promise<void> {
  // Helper function for mapping inserts
  const addCommaIfNotFirstIndex = (index: number) => {
    if (index !== 0) {
      query += ', ';
    }
  };
  // Create Table to hold Permission Categories
  enum Category {
    PLANT_OBSERVATION = 'PLANT_OBSERVATION',
    ANIMAL_OBSERVATION = 'ANIMAL_OBSERVATION',
    PLANT_TREATMENT_MONITORING = 'PLANT_TREATMENT_MONITORING',
    ANIMAL_TREATMENT_MONITORING = 'ANIMAL_TREATMENT_MONITORING',
    PLANT_TRANSECT = 'PLANT_TRANSECT',
    ANIMAL_TRANSECT = 'ANIMAL_TRANSECT',
    PLANT_BIOCONTROL = 'PLANT_BIOCONTROL'
  }

  await knex.raw(
    //language=PostgreSQL
    `CREATE TABLE IF NOT EXISTS invasivesbc.PERMISSION_CATEGORY (
         ID          VARCHAR(64)  PRIMARY KEY,
         NAME        VARCHAR(128) NOT NULL,
         DESCRIPTION TEXT
       );
       COMMENT ON COLUMN invasivesbc.PERMISSION_CATEGORY.ID          is 'PK: Category for permission set';
       COMMENT ON COLUMN invasivesbc.PERMISSION_CATEGORY.NAME        is 'Readable category title';
       COMMENT ON COLUMN invasivesbc.PERMISSION_CATEGORY.DESCRIPTION is 'Brief details about category';
      `
  );
  // Populate the Permission Category table with initial information
  await knex.raw(
    //language=PostgreSQL
    `INSERT INTO invasivesbc.PERMISSION_CATEGORY (ID, NAME, DESCRIPTION)
     VALUES
        ('${Category.PLANT_OBSERVATION}',           'Invasives BC Plant Observations', 'Includes iNaturalist, "report a weed"'),
        ('${Category.ANIMAL_OBSERVATION}',          'Invasives BC Animal Observations',                       NULL),
        ('${Category.PLANT_TREATMENT_MONITORING}',  'Invasives BC Plant Treatments and Monitoring Records',   NULL),
        ('${Category.ANIMAL_TREATMENT_MONITORING}', 'Invasives BC Animal Treatments and Monitoring Records',  NULL),
        ('${Category.PLANT_TRANSECT}',              'Invasives BC Plant Transect Data',                       NULL),
        ('${Category.ANIMAL_TRANSECT}',             'Invasives BC Animal Transect Data',                      NULL),
        ('${Category.PLANT_BIOCONTROL}',            'Invasives BC Biocontrol Data',                           NULL)
     ON CONFLICT (ID)
     DO UPDATE SET
       NAME = EXCLUDED.NAME,
       DESCRIPTION = EXCLUDED.DESCRIPTION
     `
  );

  // Create the Permissions Table, mapping the Roles to Permissions
  await knex.raw(
    //language=PostgreSQL
    `CREATE TABLE IF NOT EXISTS invasivesbc.PERMISSIONS (
        ROLE_ID                          SERIAL4     REFERENCES invasivesbc.USER_ROLE(ROLE_ID)      
            ON UPDATE CASCADE
            ON DELETE CASCADE,
        CATEGORY_ID                      VARCHAR(64) REFERENCES invasivesbc.PERMISSION_CATEGORY(ID) 
            ON UPDATE CASCADE
            ON DELETE CASCADE,
        CAN_WRITE                        BOOLEAN     DEFAULT FALSE,
        CAN_READ                         BOOLEAN     DEFAULT FALSE,
        CAN_READ_SENSITIVE_BIOCONTROL    BOOLEAN     DEFAULT FALSE,

        CAN_DELETE                       BOOLEAN     DEFAULT FALSE,
        CAN_DELETE_EMPLOYER              BOOLEAN     DEFAULT FALSE,
        CAN_DELETE_AGENCY                BOOLEAN     DEFAULT FALSE,

        CAN_EDIT                         BOOLEAN     DEFAULT FALSE,
        CAN_EDIT_EMPLOYER                BOOLEAN     DEFAULT FALSE,
        CAN_EDIT_AGENCY                  BOOLEAN     DEFAULT FALSE,

        CAN_REVIEW_AND_PUBLISH           BOOLEAN     DEFAULT FALSE,
        CAN_REVIEW_AND_PUBLISH_EMPLOYER  BOOLEAN     DEFAULT FALSE,
        CAN_REVIEW_AND_PUBLISH_AGENCY    BOOLEAN     DEFAULT FALSE,

        CAN_ASSIGN_ACCESS_LEVELS         BOOLEAN     DEFAULT FALSE,

        COMMENTS                         TEXT,
        
        PRIMARY KEY (ROLE_ID, CATEGORY_ID)
     );
      
     COMMENT ON TABLE  invasivesbc.PERMISSIONS IS 'Mapping table linking permission categories to user roles.';

     COMMENT ON COLUMN invasivesbc.PERMISSIONS.ROLE_ID                         IS 'ID of the user role to which the permission applies';
     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CATEGORY_ID                     IS 'Category to which the permission applies';
     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_WRITE                       IS 'Can create new Records';
     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_READ                        IS 'Can read records';
     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_READ_SENSITIVE_BIOCONTROL   IS 'Can access records containing certain biocontrol species';

     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_DELETE                      IS 'Can delete records in category';
     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_DELETE_EMPLOYER             IS 'Can delete records with same employer';
     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_DELETE_AGENCY               IS 'Can delete records with same agency';

     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_EDIT                        IS 'Can edit records in category';
     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_EDIT_EMPLOYER               IS 'Can edit records with same employer';
     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_EDIT_AGENCY                 IS 'Can edit records with same agency';

     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_REVIEW_AND_PUBLISH          IS 'Can review and publish records in category';
     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_REVIEW_AND_PUBLISH_EMPLOYER IS 'Can review and publish records with same employer';
     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_REVIEW_AND_PUBLISH_AGENCY   IS 'Can review and publish records with same agency';

     COMMENT ON COLUMN invasivesbc.PERMISSIONS.CAN_ASSIGN_ACCESS_LEVELS        IS 'Can assign access levels';
    `
  );
  // Populate the Permissions table with a Cartesian Join of the Roles / Permission Categories.
  const role_data = await knex.raw(
    //language=PostgreSQL
    `SELECT role_id, role_name
     FROM invasivesbc.user_role;`
  );

  let query = `
  INSERT INTO invasivesbc.permissions (ROLE_ID,
                                       CATEGORY_ID,
                                       CAN_WRITE,
                                       CAN_READ,
                                       CAN_READ_SENSITIVE_BIOCONTROL,
                                       CAN_DELETE,
                                       CAN_DELETE_EMPLOYER,
                                       CAN_DELETE_AGENCY,
                                       CAN_EDIT,
                                       CAN_EDIT_EMPLOYER,
                                       CAN_EDIT_AGENCY,
                                       CAN_REVIEW_AND_PUBLISH,
                                       CAN_REVIEW_AND_PUBLISH_EMPLOYER,
                                       CAN_REVIEW_AND_PUBLISH_AGENCY,
                                       CAN_ASSIGN_ACCESS_LEVELS)
  VALUES `;

  // We cannot guarantee the role_id, so roll through the results to create the query.
  role_data.rows.forEach(({ role_name, role_id }, index) => {
    // shorthand for manually checking index at each step.
    switch (role_name) {
      case Role.MASTER_ADMINISTRATOR:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE)  
        `;
        break;
      case Role.ADMIN_PLANTS:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   ),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   ),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   ),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   )
        `;
        break;
      case Role.ADMIN_ANIMALS:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   ),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   ),
        (${role_id}, '${Category.PLANT_TRANSECT}',              DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   ),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.BCGOV_STAFF_ANIMALS:
      case Role.INDIGENOUS_RISO_STAFF_ANIMALS:
      case Role.CONTRACTOR_STAFF_ANIMALS:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;

        break;
      case Role.BCGOV_STAFF_PLANTS:
      case Role.INDIGENOUS_RISO_STAFF_PLANTS:
      case Role.CONTRACTOR_STAFF_PLANTS:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.BCGOV_STAFF_BOTH:
      case Role.INDIGENOUS_RISO_STAFF_BOTH:
      case Role.CONTRACTOR_STAFF_BOTH:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.CONTRACTOR_MANAGER_ANIMALS:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.CONTRACTOR_MANAGER_PLANTS:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.CONTRACTOR_MANAGER_BOTH:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT)
        `;
        break;
      case Role.INDIGENOUS_RISO_MANAGER_ANIMALS:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.INDIGENOUS_RISO_MANAGER_PLANTS:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.INDIGENOUS_RISO_MANAGER_BOTH:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT)
        `;
        break;
      case Role.MUSSEL_INSPECTION_OFFICER:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)  
        `;
        break;
      case Role.BIOCONTROL_USER:
        addCommaIfNotFirstIndex(index);
        //                                                      WRITE    READ     BIO_READ DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            TRUE,    TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)  
        `;
        break;
    }
  });
  query += ` ON CONFLICT DO NOTHING`;
  await knex.raw(query);

  // Create View aggregating permissions to roles
  await knex.raw(
    //language=PostgreSQL
    `
    CREATE OR REPLACE VIEW invasivesbc.ROLE_PERMISSIONS AS
      SELECT
        ur.ROLE_ID,
        ur.ROLE_DESCRIPTION,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_WRITE)                       as CAN_WRITE,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_READ)                        as CAN_READ,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_READ_SENSITIVE_BIOCONTROL)   as CAN_READ_SENSITIVE_BIOCONTROL,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_DELETE)                      as CAN_DELETE,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_DELETE_EMPLOYER)             as CAN_DELETE_EMPLOYER,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_DELETE_AGENCY)               as CAN_DELETE_AGENCY,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_EDIT)                        as CAN_EDIT,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_EDIT_EMPLOYER)               as CAN_EDIT_EMPLOYER,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_EDIT_AGENCY)                 as CAN_EDIT_AGENCY,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_REVIEW_AND_PUBLISH)          as CAN_REVIEW_AND_PUBLISH,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_REVIEW_AND_PUBLISH_EMPLOYER) as CAN_REVIEW_AND_PUBLISH_EMPLOYER,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_REVIEW_AND_PUBLISH_AGENCY)   as CAN_REVIEW_AND_PUBLISH_AGENCY,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_ASSIGN_ACCESS_LEVELS)        as CAN_ASSIGN_ACCESS_LEVELS
      FROM invasivesbc.USER_ROLE ur
      LEFT JOIN invasivesbc.PERMISSIONS p  
      ON p.ROLE_ID = ur.ROLE_ID
      LEFT JOIN invasivesbc.PERMISSION_CATEGORY pc 
      ON pc.ID = p.CATEGORY_ID 
      GROUP BY ur.ROLE_ID;
    
    COMMENT ON VIEW invasivesbc.ROLE_PERMISSIONS is 'View Aggregating Permissions to Roles in the DB';

    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_WRITE                       is 'Can create new Records';
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_READ                        is 'Can read records';
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_READ_SENSITIVE_BIOCONTROL   is 'Can read records containing sensitive biocontrol information';
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_DELETE                      is 'Can delete records in category'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_DELETE_EMPLOYER             is 'Can delete records with same employer'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_DELETE_AGENCY               is 'Can delete records with same agency'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_EDIT                        is 'Can edit records in category'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_EDIT_EMPLOYER               is 'Can edit records with same employer'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_EDIT_AGENCY                 is 'Can edit records with same agency'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_REVIEW_AND_PUBLISH          is 'Can review and publish records in category'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_REVIEW_AND_PUBLISH_EMPLOYER is 'Can review and publish records with same employer'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_REVIEW_AND_PUBLISH_AGENCY   is 'Can review and publish records with same agency'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_ASSIGN_ACCESS_LEVELS        is 'Can assign access levels'; 
    `
  );

  // Implement Function for fetching permissions from a user using their user_id
  await knex.raw(
    //language=PostgreSQL
    `
    CREATE OR REPLACE FUNCTION invasivesbc.get_user_permissions(uid integer)
    RETURNS TABLE (
        id                              VARCHAR,
        CAN_WRITE                       BOOLEAN,
        CAN_READ                        BOOLEAN,
        CAN_READ_SENSITIVE_BIOCONTROL   BOOLEAN,
        CAN_DELETE                      BOOLEAN,
        CAN_DELETE_EMPLOYER             BOOLEAN,
        CAN_DELETE_AGENCY               BOOLEAN,
        CAN_EDIT                        BOOLEAN,
        CAN_EDIT_EMPLOYER               BOOLEAN,
        CAN_EDIT_AGENCY                 BOOLEAN,
        CAN_REVIEW_AND_PUBLISH          BOOLEAN,
        CAN_REVIEW_AND_PUBLISH_EMPLOYER BOOLEAN,
        CAN_REVIEW_AND_PUBLISH_AGENCY   BOOLEAN,
        CAN_ASSIGN_ACCESS_LEVELS        BOOLEAN
    )
    LANGUAGE SQL
    AS $$
        SELECT pc.id,
          BOOL_OR(p.CAN_WRITE)                       as CAN_WRITE,
          BOOL_OR(p.CAN_READ)                        as CAN_READ,
          BOOL_OR(p.CAN_READ_SENSITIVE_BIOCONTROL)   as CAN_READ_SENSITIVE_BIOCONTROL,
          BOOL_OR(p.CAN_DELETE)                      as CAN_DELETE,
          BOOL_OR(p.CAN_DELETE_EMPLOYER)             as CAN_DELETE_EMPLOYER,
          BOOL_OR(p.CAN_DELETE_AGENCY)               as CAN_DELETE_AGENCY,
          BOOL_OR(p.CAN_EDIT)                        as CAN_EDIT,
          BOOL_OR(p.CAN_EDIT_EMPLOYER)               as CAN_EDIT_EMPLOYER,
          BOOL_OR(p.CAN_EDIT_AGENCY)                 as CAN_EDIT_AGENCY,
          BOOL_OR(p.CAN_REVIEW_AND_PUBLISH)          as CAN_REVIEW_AND_PUBLISH,
          BOOL_OR(p.CAN_REVIEW_AND_PUBLISH_EMPLOYER) as CAN_REVIEW_AND_PUBLISH_EMPLOYER,
          BOOL_OR(p.CAN_REVIEW_AND_PUBLISH_AGENCY)   as CAN_REVIEW_AND_PUBLISH_AGENCY,
          BOOL_OR(p.CAN_ASSIGN_ACCESS_LEVELS)        as CAN_ASSIGN_ACCESS_LEVELS
        FROM invasivesbc.user_access ua
        LEFT JOIN invasivesbc.permissions p
            ON p.role_id = ua.role_id
        LEFT JOIN invasivesbc.permission_category pc 
            ON p.category_id = pc.id
        WHERE ua.user_id = uid
        GROUP BY pc.id
    $$;
    `
  );
  /*
   * Create a table that links Activity Record subtypes to a Permissions Category
   * Example "Activity_Observation_PlantTerrestrial" Records are tied to Permissions under the 'PLANT_OBSERVATION' category.
   */
  await knex.raw(
    //language=PostgreSQL
    `
     CREATE TABLE IF NOT EXISTS invasivesbc.ACTIVITY_SUBTYPE_PERMISSION_CATEGORY (
       ACTIVITY_SUBTYPE SERIAL4 REFERENCES invasivesbc.ACTIVITY_SUBTYPE_MAPPING(MAPPING_ID) 
          ON UPDATE CASCADE
          ON DELETE CASCADE,
       PERMISSION_CATEGORY VARCHAR(64) REFERENCES invasivesbc.PERMISSION_CATEGORY(ID)       
          ON UPDATE CASCADE
          ON DELETE CASCADE,

       PRIMARY KEY (ACTIVITY_SUBTYPE, PERMISSION_CATEGORY)
     );
     
     COMMENT ON TABLE invasivesbc.ACTIVITY_SUBTYPE_PERMISSION_CATEGORY IS 'Relationship linking Activity_Subtypes to permission categories';
    `
  );

  // Get Correct IDS For Subtypes
  const subtypes = await knex.raw(
    //language=PostgreSQL
    `SELECT mapping_id, form_subtype 
     FROM invasivesbc.ACTIVITY_SUBTYPE_MAPPING
    `
  );

  query = `
  INSERT INTO invasivesbc.ACTIVITY_SUBTYPE_PERMISSION_CATEGORY (ACTIVITY_SUBTYPE, PERMISSION_CATEGORY)  
  VALUES `;

  subtypes.rows.forEach(({ mapping_id, form_subtype }, index: number) => {
    switch (form_subtype) {
      case 'Activity_Observation_PlantTerrestrial':
      case 'Activity_Observation_PlantAquatic':
        addCommaIfNotFirstIndex(index);
        query += `(${mapping_id}, '${Category.PLANT_OBSERVATION}')`;
        break;
      case 'Activity_AnimalActivity_AnimalTerrestrial':
      case 'Activity_AnimalActivity_AnimalAquatic':
        addCommaIfNotFirstIndex(index);
        query += `(${mapping_id}, '${Category.ANIMAL_OBSERVATION}')`;
        break;
      case 'Activity_Treatment_ChemicalPlantTerrestrial':
      case 'Activity_Treatment_ChemicalPlantAquatic':
      case 'Activity_Treatment_MechanicalPlantTerrestrial':
      case 'Activity_Treatment_MechanicalPlantAquatic':
      case 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant':
      case 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant':
        addCommaIfNotFirstIndex(index);
        query += `(${mapping_id}, '${Category.PLANT_TREATMENT_MONITORING}')`;
        break;
      case 'Activity_Biocontrol_Release':
      case 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant':
      case 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant':
      case 'Activity_Transect_BiocontrolEfficacy':
      case 'Activity_Biocontrol_Collection':
        addCommaIfNotFirstIndex(index);
        query += `(${mapping_id}, '${Category.PLANT_TREATMENT_MONITORING}'),`;
        query += `(${mapping_id}, '${Category.PLANT_BIOCONTROL}')`;
        break;
      case 'Activity_Treatment_ChemicalAnimalTerrestrial':
      case 'Activity_Treatment_MechanicalAnimalTerrestrial':
      case 'Activity_Monitoring_MechanicalAnimalTerrestrial':
      case 'Activity_Monitoring_ChemicalAnimalTerrestrial':
        addCommaIfNotFirstIndex(index);
        query += `(${mapping_id}, '${Category.ANIMAL_TREATMENT_MONITORING}')`;
        break;
    }
  });

  query += ` ON CONFLICT(ACTIVITY_SUBTYPE, PERMISSION_CATEGORY) DO NOTHING`;

  await knex.raw(
    //language=PostgreSQL
    query
  );

  await knex.raw(
    //language=PostgreSQL
    `
    CREATE OR REPLACE VIEW invasivesbc.SUBTYPE_PERMISSIONS AS
      SELECT asm.form_subtype, ARRAY_AGG(aspc.permission_category) AS ASSIGNED_CATEGORIES
      FROM invasivesbc.ACTIVITY_SUBTYPE_PERMISSION_CATEGORY aspc
      LEFT JOIN invasivesbc.ACTIVITY_SUBTYPE_MAPPING asm
      ON aspc.activity_subtype = asm.mapping_id
      GROUP BY asm.FORM_SUBTYPE;

    COMMENT ON VIEW invasivesbc.SUBTYPE_PERMISSIONS IS 'Readable View linking Readable Subtypes to their Permission Categories';
    `
  );

  // Create function to get the permissions a user has for a given Record subtype
  await knex.raw(
    //language=PostgreSQL
    `
    CREATE OR REPLACE FUNCTION invasivesbc.get_user_permissions_for_activity_subtype(uid integer, subtype text)
      RETURNS TABLE (
        CAN_WRITE BOOLEAN,
        CAN_READ BOOLEAN,
        CAN_READ_SENSITIVE_BIOCONTROL BOOLEAN,
        CAN_DELETE BOOLEAN,
        CAN_DELETE_EMPLOYER BOOLEAN,
        CAN_DELETE_AGENCY BOOLEAN,
        CAN_EDIT BOOLEAN,
        CAN_EDIT_EMPLOYER BOOLEAN,
        CAN_EDIT_AGENCY BOOLEAN,
        CAN_REVIEW_AND_PUBLISH BOOLEAN,
        CAN_REVIEW_AND_PUBLISH_EMPLOYER BOOLEAN,
        CAN_REVIEW_AND_PUBLISH_AGENCY BOOLEAN,
        CAN_ASSIGN_ACCESS_LEVELS BOOLEAN
      )
      LANGUAGE SQL
      AS $$
        WITH permission_categories AS (
        SELECT pc.permission_category 
        FROM invasivesbc.activity_subtype_permission_category pc
        LEFT JOIN invasivesbc.activity_subtype_mapping asm
        ON asm.mapping_id = pc.activity_subtype
        WHERE asm.form_subtype = subtype
        )
        SELECT  
          BOOL_OR(CAN_WRITE) AS CAN_WRITE,
          BOOL_OR(CAN_READ) AS CAN_READ,
          BOOL_OR(CAN_READ_SENSITIVE_BIOCONTROL) AS CAN_READ_SENSITIVE_BIOCONTROL,
          BOOL_OR(CAN_DELETE) AS CAN_DELETE,
          BOOL_OR(CAN_DELETE_EMPLOYER) AS CAN_DELETE_EMPLOYER,
          BOOL_OR(CAN_DELETE_AGENCY) AS CAN_DELETE_AGENCY,
          BOOL_OR(CAN_EDIT) AS CAN_EDIT,
          BOOL_OR(CAN_EDIT_EMPLOYER) AS CAN_EDIT_EMPLOYER,
          BOOL_OR(CAN_EDIT_AGENCY) AS CAN_EDIT_AGENCY,
          BOOL_OR(CAN_REVIEW_AND_PUBLISH) AS CAN_REVIEW_AND_PUBLISH,
          BOOL_OR(CAN_REVIEW_AND_PUBLISH_EMPLOYER) AS CAN_REVIEW_AND_PUBLISH_EMPLOYER,
          BOOL_OR(CAN_REVIEW_AND_PUBLISH_AGENCY) AS CAN_REVIEW_AND_PUBLISH_AGENCY,
          BOOL_OR(CAN_ASSIGN_ACCESS_LEVELS) AS CAN_ASSIGN_ACCESS_LEVELS
        FROM invasivesbc.get_user_permissions(uid) p 
        WHERE p.id in (select permission_category from permission_categories);
      $$
    `
  );

  /**
   * Create new `permission` rows when permission category created
   */
  await knex.raw(
    //language=PostgreSQL
    `
    CREATE OR REPLACE FUNCTION invasivesbc.add_new_permission_category_to_existing_roles()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO invasivesbc.PERMISSIONS(category_id, role_id)
      SELECT NEW.ID, r.ROLE_ID
      FROM invasivesbc.USER_ROLE r;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE TRIGGER t_after_permission_category_insert
      AFTER INSERT ON invasivesbc.permission_category
      FOR EACH ROW
      EXECUTE FUNCTION invasivesbc.add_new_permission_category_to_existing_roles();
    `
  );

  /**
   * Create new `permission` rows when user roles are created
   */
  await knex.raw(
    //language=PostgreSQL
    `
    CREATE OR REPLACE FUNCTION invasivesbc.add_new_role_to_existing_permissions()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO invasivesBC.permissions(category_id, role_id)
      SELECT pc.ID, NEW.role_id
      FROM invasivesbc.PERMISSION_CATEGORY pc;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE TRIGGER t_after_user_role_insert
      AFTER INSERT ON invasivesbc.user_role
      FOR EACH ROW
      EXECUTE FUNCTION invasivesbc.add_new_role_to_existing_permissions();
    `
  );

  await knex.raw(
    //language=PostgreSQL
    `
    CREATE TYPE invasivesbc.activity_record_with_permissions AS (
	    activity_incoming_data_id integer,
	    activity_id uuid,
	    "version" int4,
	    activity_type varchar(200),
	    activity_subtype varchar(200),
	    created_timestamp timestamp,
	    received_timestamp timestamp,
	    deleted_timestamp timestamp,
	    geom public.geometry(geometry, 3005),
	    geog public.geography(geometry, 4326),
	    media_keys _text,
	    activity_payload jsonb,
	    biogeoclimatic_zones varchar(30),
	    regional_invasive_species_organization_areas varchar(100),
	    invasive_plant_management_areas varchar(100),
	    ownership varchar(100),
	    regional_districts varchar(100),
	    flnro_districts varchar(100),
	    moti_districts varchar(100),
	    elevation int4,
	    well_proximity int4,
	    utm_zone int4,
	    utm_northing float4,
	    utm_easting float4,
	    albers_northing float4,
	    albers_easting float4,
	    created_by varchar(100),
	    form_status varchar(100),
	    sync_status varchar(100),
	    review_status varchar(100),
	    reviewed_by varchar(100),
	    reviewed_at timestamp,
	    species_positive jsonb,
	    species_negative jsonb,
	    jurisdiction _varchar,
	    updated_by varchar(100),
	    species_treated jsonb,
	    species_positive_full text,
	    species_negative_full text,
	    species_treated_full text,
	    agency text,
	    jurisdiction_display text,
	    short_id text,
	    created_by_with_guid text,
	    updated_by_with_guid text,
	    activity_subtype_full text,
	    batch_id int4,
	    row_number int4,
	    species_biocontrol_full text,
	    iscurrent bool,
	    map_symbol text,
	    invasive_plant text,
	    centroid public.geometry,
	    can_edit boolean,
	    can_delete boolean
    );

    CREATE OR REPLACE FUNCTION invasivesbc.fetch_activity_with_user_permissions(target_user_id integer, activity_ids uuid[])
    returns setof invasivesbc.activity_record_with_permissions
    AS $$
    BEGIN
      RETURN QUERY
      WITH user_details AS (
        SELECT idir_account_name, bceid_account_name, funding_agencies, employer
        FROM invasivesbc.application_user
        WHERE user_id = target_user_id
      )
      SELECT
        aid.*,
        (aid.created_by = ud.idir_account_name
        OR aid.created_by = ud.bceid_account_name
        OR perms.can_edit
        OR (perms.can_edit_employer AND aid.activity_payload #>> '{form_data, activity_data, employer_code}' = any(string_to_array(ud.employer, ',')))
        OR (perms.can_edit_agency   AND aid.activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}' = any(string_to_array(ud.funding_agencies, ',')))
        ) as can_edit,
        (aid.created_by = ud.idir_account_name
        OR aid.created_by = ud.bceid_account_name
        OR perms.can_delete
        OR (perms.can_delete_employer AND aid.activity_payload #>> '{form_data, activity_data, employer_code}' = any(string_to_array(ud.employer, ',')))
        OR (perms.can_delete_agency   AND aid.activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}' = any(string_to_array(ud.funding_agencies, ',')))
        ) AS can_delete
      FROM invasivesbc.activity_incoming_data aid
      JOIN LATERAL invasivesbc.get_user_permissions_for_activity_subtype(
        target_user_id,
        aid.activity_subtype
      ) AS perms ON true
      JOIN user_details ud ON TRUE
      WHERE aid.activity_id = ANY(activity_ids)
      AND aid.iscurrent = true
      AND perms.can_read = true;
    END;
    $$ LANGUAGE plpgsql;
    `
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    //language=PostgreSQL
    `
    DROP FUNCTION IF EXISTS invasivesbc.fetch_activity_with_user_permissions;
    DROP TYPE     IF EXISTS invasivesbc.activity_record_with_permissions;
    DROP TRIGGER  IF EXISTS t_after_user_role_insert ON invasivesbc.user_role;
    DROP FUNCTION IF EXISTS invasivesbc.add_new_role_to_existing_permissions;
    DROP TRIGGER  IF EXISTS t_after_permission_category_insert ON invasivesbc.permission_category;
    DROP FUNCTION IF EXISTS invasivesbc.add_new_permission_category_to_existing_roles;
    DROP FUNCTION IF EXISTS invasivesbc.get_user_permissions_for_activity_subtype;
    DROP VIEW     IF EXISTS invasivesbc.SUBTYPE_PERMISSIONS;
    DROP TABLE    IF EXISTS invasivesbc.ACTIVITY_SUBTYPE_PERMISSION_CATEGORY;
    DROP FUNCTION IF EXISTS invasivesbc.get_user_permissions;
    DROP VIEW     IF EXISTS invasivesbc.ROLE_PERMISSIONS;
    DROP TABLE    IF EXISTS invasivesbc.PERMISSIONS;
    DROP TABLE    IF EXISTS invasivesbc.PERMISSION_CATEGORY;
    `
  );
}
