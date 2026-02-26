import { ApiProperty } from "@nestjs/swagger";
import { Category } from "@prisma/client";

export class CategoryEntity implements Category {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty({ nullable: true })
    imageUrl: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty({ nullable: true })
    businessCategoryId: number;

    @ApiProperty({ nullable: true })
    parentCategoryId: number;
}
