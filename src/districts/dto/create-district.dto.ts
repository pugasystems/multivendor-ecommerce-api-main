import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateDistrictDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    stateId: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;
}
