// src/lib/types/user.ts
export interface UserWithRoles {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  roles: {
    id: string;
    name: string;
    description: string | null;
  }[];
}
