import { RoleEntity } from "src/roles/entities/role.entity";

export interface JwtPayload {
    userId: number;
    role: RoleEntity;
    isActive: boolean;
    hasVerified: boolean;
    vendors?: { id: number, name: string }[];
}