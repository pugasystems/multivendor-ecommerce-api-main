import { ApiProperty } from "@nestjs/swagger";
import { State } from "@prisma/client";

export class StateEntity implements State {
    @ApiProperty()
    id: number;

    @ApiProperty()
    countryId: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
