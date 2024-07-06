import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces';

export const META_ROLES = 'roles';

//recibe como argumento un array de strings
export const RoleProtected = (...args: ValidRoles[]) => {
  return  SetMetadata(META_ROLES , args)
};
