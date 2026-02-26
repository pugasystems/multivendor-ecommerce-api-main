import { ApiProperty } from "@nestjs/swagger";
import { Product, ProductAttribute, ProductImage } from "@prisma/client";
import { CategoryEntity } from "src/categories/entities/category.entity";

export class ProductEntity implements Product {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty({ nullable: true })
    description: string;

    @ApiProperty()
    price: number;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    categoryId: number;

    @ApiProperty()
    vendorId: number;

    @ApiProperty()
    attributes?: ProductAttribute[];

    @ApiProperty()
    images?: ProductImage[];

    @ApiProperty()
    category?: CategoryEntity;
}
