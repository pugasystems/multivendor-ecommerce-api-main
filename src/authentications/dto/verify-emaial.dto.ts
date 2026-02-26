import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class VerifyEmailDto {
    @ApiProperty()
    @IsNumber()
    userId: number;

    @ApiProperty()
    @IsNumber()
    verificationCode: number;
}