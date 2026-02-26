import { ApiProperty } from "@nestjs/swagger";
import { RoleEntity } from "./role.entity";

export class Roles {
    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    roles: RoleEntity[];
}