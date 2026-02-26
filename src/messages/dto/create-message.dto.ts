import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateMessageDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    senderUserId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    recipientUserId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    message: string;
}
