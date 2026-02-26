import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: false, nullable: true })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    categoryId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    vendorId: number;

    @ApiProperty({ required: false, nullable: true })
    @IsArray()
    @IsOptional()
    attributes: {
        name: string;
        value: string;
        productId?: number;
    }[];

    @ApiProperty({ required: false, nullable: true })
    @IsArray()
    @IsOptional()
    images: {
        image: string;
        imageUrl?: string;
        productId?: number;
    }[];
}
