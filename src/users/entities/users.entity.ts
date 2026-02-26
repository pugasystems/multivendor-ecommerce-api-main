import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "./user.entity";

export class Users {
    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    users: UserEntity[];
}