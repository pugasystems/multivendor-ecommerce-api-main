import { ApiProperty } from "@nestjs/swagger";
import { CityEntity } from "./city.entity";

export class Cities {
    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    cities: CityEntity[];
}