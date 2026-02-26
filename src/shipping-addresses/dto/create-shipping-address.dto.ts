import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateShippingAddressDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    countryId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    stateId: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    districtId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    cityId: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    addressLineOne: string;

    @ApiProperty({ required: false })
    addressLineTwo?: string;

    @ApiProperty({ required: false })
    zipCode: string;

    @ApiProperty({ required: false })
    isDefault: boolean;
}
