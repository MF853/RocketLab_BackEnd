import { Role } from '../../auth/enums/role.enum';

export class User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
} 