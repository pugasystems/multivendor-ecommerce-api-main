import { ApiProperty } from "@nestjs/swagger";
import { CountryEntity } from "./country.entity";

export class Countries {
    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    countries: CountryEntity[];
}