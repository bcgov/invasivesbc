import { Knex } from 'knex';
import { Role } from '../../constants/roles';

export async function up(knex: Knex): Promise<void> {
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
        ROLE_ID                          SERIAL4     REFERENCES invasivesbc.USER_ROLE(ROLE_ID),
        CATEGORY_ID                      VARCHAR(64) REFERENCES invasivesbc.PERMISSION_CATEGORY(ID),
        CAN_WRITE                        BOOLEAN     DEFAULT FALSE,
        CAN_READ                         BOOLEAN     DEFAULT FALSE,

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
    const addCommaIfNotFirstIndex = () => {
      if (index !== 0) {
        query += ', ';
      }
    };
    switch (role_name) {
      case Role.MASTER_ADMINISTRATOR:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE)  
        `;
        break;
      case Role.ADMIN_PLANTS:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   ),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   ),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   ),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   )
        `;
        break;
      case Role.ADMIN_ANIMALS:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   ),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   ),
        (${role_id}, '${Category.PLANT_TRANSECT}',              DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE,    TRUE   ),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.BCGOV_STAFF_ANIMALS:
      case Role.INDIGENOUS_RISO_STAFF_ANIMALS:
      case Role.CONTRACTOR_STAFF_ANIMALS:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;

        break;
      case Role.BCGOV_STAFF_PLANTS:
      case Role.INDIGENOUS_RISO_STAFF_PLANTS:
      case Role.CONTRACTOR_STAFF_PLANTS:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.BCGOV_STAFF_BOTH:
      case Role.INDIGENOUS_RISO_STAFF_BOTH:
      case Role.CONTRACTOR_STAFF_BOTH:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.CONTRACTOR_MANAGER_ANIMALS:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.CONTRACTOR_MANAGER_PLANTS:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          DEFAULT, TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', DEFAULT, TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             DEFAULT, TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.CONTRACTOR_MANAGER_BOTH:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            TRUE,    TRUE,    DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT)
        `;
        break;
      case Role.INDIGENOUS_RISO_MANAGER_ANIMALS:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.INDIGENOUS_RISO_MANAGER_PLANTS:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
        `;
        break;
      case Role.INDIGENOUS_RISO_MANAGER_BOTH:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            TRUE,    TRUE,    DEFAULT, DEFAULT, TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT, TRUE,    TRUE,    DEFAULT)
        `;
        break;
      case Role.MUSSEL_INSPECTION_OFFICER:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)  
        `;
        break;
      case Role.BIOCONTROL_USER:
        addCommaIfNotFirstIndex();
        //                                                      WRITE    READ     DELETE   DEL_EMP  DEL_AGE  EDIT     ED_EMP   ED_AGE   REVIEW   REV_EMP  REV_AGE  ASSIGN
        query += `
        (${role_id}, '${Category.PLANT_OBSERVATION}',           DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_OBSERVATION}',          DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TREATMENT_MONITORING}',  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TREATMENT_MONITORING}', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_TRANSECT}',              DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.ANIMAL_TRANSECT}',             DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT),
        (${role_id}, '${Category.PLANT_BIOCONTROL}',            TRUE,    TRUE,    DEFAULT, DEFAULT, DEFAULT, TRUE,    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)  
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
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_WRITE) as CAN_WRITE,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_READ) as CAN_READ,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_DELETE) as CAN_DELETE,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_DELETE_EMPLOYER) as CAN_DELETE_EMPLOYER,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_DELETE_AGENCY) as CAN_DELETE_AGENCY,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_EDIT) as CAN_EDIT,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_EDIT_EMPLOYER) as CAN_EDIT_EMPLOYER,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_EDIT_AGENCY) as CAN_EDIT_AGENCY,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_REVIEW_AND_PUBLISH) as CAN_REVIEW_AND_PUBLISH,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_REVIEW_AND_PUBLISH_EMPLOYER) as CAN_REVIEW_AND_PUBLISH_EMPLOYER,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_REVIEW_AND_PUBLISH_AGENCY) as CAN_REVIEW_AND_PUBLISH_AGENCY,
        ARRAY_AGG(pc.ID ORDER BY pc.ID) FILTER (WHERE p.CAN_ASSIGN_ACCESS_LEVELS) as CAN_ASSIGN_ACCESS_LEVELS
      FROM invasivesbc.USER_ROLE ur
      LEFT JOIN invasivesbc.PERMISSIONS p  
      ON p.ROLE_ID = ur.ROLE_ID
      LEFT JOIN invasivesbc.PERMISSION_CATEGORY pc 
      ON pc.ID = p.CATEGORY_ID 
      GROUP BY ur.ROLE_ID;
    
    COMMENT ON VIEW invasivesbc.ROLE_PERMISSIONS is 'View Aggregating Permissions to Roles in the DB';

    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_WRITE is 'Can create new Records';
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_READ is 'Can read records'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_DELETE is 'Can delete records in category'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_DELETE_EMPLOYER is 'Can delete records with same employer'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_DELETE_AGENCY is 'Can delete records with same agency'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_EDIT is 'Can edit records in category'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_EDIT_EMPLOYER is 'Can edit records with same employer'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_EDIT_AGENCY is 'Can edit records with same agency'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_REVIEW_AND_PUBLISH is 'Can review and publish records in category'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_REVIEW_AND_PUBLISH_EMPLOYER is 'Can review and publish records with same employer'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_REVIEW_AND_PUBLISH_AGENCY is 'Can review and publish records with same agency'; 
    COMMENT ON column invasivesbc.ROLE_PERMISSIONS.CAN_ASSIGN_ACCESS_LEVELS is 'Can assign access levels'; 
    `
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    //language=PostgreSQL
    `DROP VIEW IF EXISTS invasivesbc.ROLE_PERMISSIONS`
  );
  await knex.raw(
    //language=PostgreSQL
    `DROP TABLE IF EXISTS invasivesbc.PERMISSIONS;`
  );
  await knex.raw(
    //language=PostgreSQL
    `DROP TABLE IF EXISTS invasivesbc.PERMISSION_CATEGORY;`
  );
}
