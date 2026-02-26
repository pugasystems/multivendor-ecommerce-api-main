import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateBusinessCategoryDto {
    @ApiProperty({ uniqueItems: true, })
    @IsNotEmpty()
    @IsString()
    name: string;
}

