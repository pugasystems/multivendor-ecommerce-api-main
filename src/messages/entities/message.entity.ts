import { ApiProperty } from "@nestjs/swagger";
import { Chat } from "@prisma/client";

export class Message implements Chat {
    @ApiProperty()
    id: number;

    @ApiProperty()
    senderUserId: number;

    @ApiProperty()
    recipientUserId: number;

    @ApiProperty()
    message: string;

    @ApiProperty()
    readAt: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
