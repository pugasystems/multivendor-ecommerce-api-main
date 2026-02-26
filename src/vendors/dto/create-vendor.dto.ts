import { ApiProperty } from "@nestjs/swagger";
import { PaymentStatus, VendorStatus } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateVendorDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsEnum(VendorStatus)
    @IsNotEmpty()
    vendorStatus: VendorStatus;

    @ApiProperty()
    @IsEnum(PaymentStatus)
    @IsNotEmpty()
    paymentStatus: PaymentStatus;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    userAddressId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    subscriptionId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    businessCategoryId: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    leadsCount: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    taxId: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    registeredAt: number;
}
