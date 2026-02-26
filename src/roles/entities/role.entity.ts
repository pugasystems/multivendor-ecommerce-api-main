import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";

export class RoleEntity implements Role {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false, nullable: true, })
    createdAt!: Date | null;

    @ApiProperty({ required: false, nullable: true, })
    updatedAt!: Date | null;
}
