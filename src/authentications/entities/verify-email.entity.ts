import { ApiProperty } from "@nestjs/swagger";

export class VerifyEmailEntity {
    @ApiProperty()
    message: string;

    @ApiProperty()
    statusCode: number;
}