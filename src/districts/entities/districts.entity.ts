import { ApiProperty } from "@nestjs/swagger";
import { DistrictEntity } from "./district.entity";

export class Districts {
    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    districts: DistrictEntity[];
}