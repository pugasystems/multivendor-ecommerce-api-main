import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateStateDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    countryId: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;
}
