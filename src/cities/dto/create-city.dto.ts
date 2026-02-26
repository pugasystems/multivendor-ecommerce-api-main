import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCityDto {
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    districtId: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    stateId: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;
}
