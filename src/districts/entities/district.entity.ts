import { ApiProperty } from "@nestjs/swagger";
import { District } from "@prisma/client";

export class DistrictEntity implements District {
    @ApiProperty()
    id: number;

    @ApiProperty()
    stateId: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
