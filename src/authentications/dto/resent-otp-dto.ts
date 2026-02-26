import { ApiProperty } from "@nestjs/swagger";
import { VerificationType } from "@prisma/client";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ResendOtpDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    type: VerificationType
}