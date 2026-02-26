import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { UserEntity } from "src/users/entities/user.entity";

export class RegisterEntity extends UserEntity {
    @ApiProperty({ required: false, nullable: true })
    @IsString()
    message?: string;
}