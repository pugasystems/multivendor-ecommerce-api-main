import { ApiProperty } from "@nestjs/swagger";
import { StateEntity } from "./state.entity";

export class States {
    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    states: StateEntity[];
}