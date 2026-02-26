import { ApiProperty } from "@nestjs/swagger";
import { Vendor } from "@prisma/client";
import { RoleEntity } from "src/roles/entities/role.entity";

export class UserEntity {
    @ApiProperty()
    id: number;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    middleName?: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    hasVerified: boolean;

    @ApiProperty()
    verifiedAt?: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    role: RoleEntity;

    @ApiProperty()
    vendors?: Vendor[];
}
