import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCountryDto {
    @ApiProperty({ uniqueItems: true })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: false, nullable: true })
    abbreviation?: string;
}
