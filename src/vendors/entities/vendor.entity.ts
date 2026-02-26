import { ApiProperty } from "@nestjs/swagger";
import { $Enums, Vendor } from "@prisma/client";
import { BusinessCategoryEntity } from "src/business-categories/entities/business-category.entity";
import { ShippingAddressEntity } from "src/shipping-addresses/entities/shipping-address.entity";

export class VendorEntity implements Vendor {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    vendorStatus: $Enums.VendorStatus;

    @ApiProperty()
    paymentStatus: $Enums.PaymentStatus;

    @ApiProperty()
    leadsCount: number;

    @ApiProperty()
    leadsConsumed: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    userId: number;

    @ApiProperty()
    userAddressId: number;

    @ApiProperty()
    businessCategoryId: number;

    @ApiProperty()
    taxId: string;

    @ApiProperty()
    registeredAt: number;

    @ApiProperty()
    userAddress: ShippingAddressEntity;

    @ApiProperty()
    businessCategory: BusinessCategoryEntity;
}
