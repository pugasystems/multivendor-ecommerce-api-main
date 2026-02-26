import { ApiProperty } from "@nestjs/swagger";
import { BusinessCategory } from "@prisma/client";

export class BusinessCategoryEntity implements BusinessCategory {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false, nullable: true, })
    createdAt!: Date | null;

    @ApiProperty({ required: false, nullable: true, })
    updatedAt!: Date | null;
}
