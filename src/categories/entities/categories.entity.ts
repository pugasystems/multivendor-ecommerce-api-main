import { ApiProperty } from "@nestjs/swagger";
import { CategoryEntity } from "./category.entity";

export class Categories {
    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    categories: CategoryEntity[];
}