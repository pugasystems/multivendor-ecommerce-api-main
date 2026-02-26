import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDecimal, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSubscriptionDto {
    @ApiProperty({ uniqueItems: true })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    price: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    leadsCount: number;

    @ApiProperty({ required: false, nullable: true })
    @IsArray()
    @IsOptional()
    attributes?: {
        name: string;
        value: string;
        subscriptionId?: number;
    }[];

    @ApiProperty({ required: false, nullable: true })
    @IsArray()
    @IsOptional()
    items?: {
        text: string;
        icon?: string;
        tag?: string;
        subscriptionId?: number;
    }[];
}
