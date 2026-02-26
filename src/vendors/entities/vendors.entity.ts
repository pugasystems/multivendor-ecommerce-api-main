import { ApiProperty } from "@nestjs/swagger";
import { VendorEntity } from "./vendor.entity";

export class Vendors {
    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    vendors: VendorEntity[];
}