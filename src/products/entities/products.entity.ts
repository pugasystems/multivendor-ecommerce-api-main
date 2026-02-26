import { ApiProperty } from "@nestjs/swagger";
import { ProductEntity } from "./product.entity";

export class Products {
    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    products: ProductEntity[];
}