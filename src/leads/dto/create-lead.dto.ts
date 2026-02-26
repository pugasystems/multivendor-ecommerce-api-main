import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateLeadDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    requiredUnits: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    possibleOrderValue?: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    businessCategoryId?: number;
}
