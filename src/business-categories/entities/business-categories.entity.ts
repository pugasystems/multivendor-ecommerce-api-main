import { ApiProperty } from "@nestjs/swagger";
import { BusinessCategoryEntity } from "./business-category.entity";

export class BusinessCategories {
    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    businessCategories: BusinessCategoryEntity[];
}