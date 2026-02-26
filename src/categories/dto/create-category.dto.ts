import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: false, nullable: true })
    @IsString()
    @IsOptional()
    image?: string;

    @ApiProperty({ required: false, nullable: true })
    @IsString()
    @IsOptional()
    imageUrl?: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    businessCategoryId: number;

    @ApiProperty({ required: false, nullable: true })
    @IsNumber()
    @IsOptional()
    parentCategoryId?: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    vendorId: number;
}
