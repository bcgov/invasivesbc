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
  MASTER_ADMINISTRATOR = 'master_administrator'
}

export enum User_Access {
  PLANTS = 'plants',
  ANIMALS = 'animals',
  BOTH = 'both',
  NONE = 'none'
}

export const UserRolesAccess = {
  [Role.ADMIN]: User_Access.BOTH,
  [Role.MANAGER]: User_Access.BOTH,
  [Role.DATA_EDITOR]: User_Access.BOTH,
  [Role.ADMIN_PLANTS]: User_Access.PLANTS,
  [Role.ADMIN_ANIMALS]: User_Access.ANIMALS,
  [Role.BCGOV_STAFF_ANIMALS]: User_Access.ANIMALS,
  [Role.BCGOV_STAFF_PLANTS]: User_Access.PLANTS,
  [Role.BCGOV_STAFF_BOTH]: User_Access.BOTH,
  [Role.CONTRACTOR_MANAGER_ANIMALS]: User_Access.ANIMALS,
  [Role.CONTRACTOR_MANAGER_PLANTS]: User_Access.PLANTS,
  [Role.CONTRACTOR_MANAGER_BOTH]: User_Access.BOTH,
  [Role.CONTRACTOR_STAFF_PLANTS]: User_Access.PLANTS,
  [Role.CONTRACTOR_STAFF_ANIMALS]: User_Access.ANIMALS,
  [Role.CONTRACTOR_STAFF_BOTH]: User_Access.BOTH,
  [Role.INDIGENOUS_RISO_MANAGER_ANIMALS]: User_Access.ANIMALS,
  [Role.INDIGENOUS_RISO_MANAGER_PLANTS]: User_Access.PLANTS,
  [Role.INDIGENOUS_RISO_MANAGER_BOTH]: User_Access.BOTH,
  [Role.INDIGENOUS_RISO_STAFF_ANIMALS]: User_Access.ANIMALS,
  [Role.INDIGENOUS_RISO_STAFF_PLANTS]: User_Access.PLANTS,
  [Role.INDIGENOUS_RISO_STAFF_BOTH]: User_Access.BOTH,
  [Role.MASTER_ADMINISTRATOR]: User_Access.BOTH
};

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
  Role.MASTER_ADMINISTRATOR
];

export const ANIMAL_ROLES = [
  Role.MASTER_ADMINISTRATOR,
  Role.ADMIN,
  Role.DATA_EDITOR,
  Role.ADMIN_ANIMALS,
  Role.BCGOV_STAFF_ANIMALS,
  Role.CONTRACTOR_MANAGER_ANIMALS,
  Role.CONTRACTOR_STAFF_ANIMALS,
  Role.INDIGENOUS_RISO_MANAGER_ANIMALS,
  Role.INDIGENOUS_RISO_STAFF_ANIMALS
];

export const PLANT_ROLES = [
  Role.MASTER_ADMINISTRATOR,
  Role.ADMIN,
  Role.DATA_EDITOR,
  Role.ADMIN_PLANTS,
  Role.BCGOV_STAFF_PLANTS,
  Role.CONTRACTOR_MANAGER_PLANTS,
  Role.CONTRACTOR_STAFF_PLANTS,
  Role.INDIGENOUS_RISO_MANAGER_PLANTS,
  Role.INDIGENOUS_RISO_STAFF_PLANTS
];

export const USER_ACCESS = [User_Access.PLANTS, User_Access.ANIMALS, User_Access.BOTH, User_Access.NONE];
