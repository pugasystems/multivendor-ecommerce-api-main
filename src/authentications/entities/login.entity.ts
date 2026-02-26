import { ApiProperty } from "@nestjs/swagger";
import { RoleEntity } from "src/roles/entities/role.entity";

export class LoginEntity {
    @ApiProperty()
    userId: number;

    @ApiProperty()
    role: RoleEntity;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    hasVerified: boolean;

    @ApiProperty()
    accessToken: string;
}