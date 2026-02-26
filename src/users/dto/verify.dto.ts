import { ApiProperty } from "@nestjs/swagger";
import { VerificationType } from "@prisma/client";
import { IsString } from "class-validator";
import { VerifyEmailDto } from "src/authentications/dto/verify-emaial.dto";

export class VerifyDto extends VerifyEmailDto {
    @ApiProperty()
    @IsString()
    type: VerificationType;
}