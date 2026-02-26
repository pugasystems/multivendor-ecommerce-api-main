import { ApiProperty } from "@nestjs/swagger";
import { ShippingAddressEntity } from "./shipping-address.entity";

export class ShippingAddresses {
    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    userAddresses: ShippingAddressEntity[];
}