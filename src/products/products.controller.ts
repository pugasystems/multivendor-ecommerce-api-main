import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProductEntity } from './entities/product.entity';
import { ProductQuery, SortOrder } from 'src/interfaces/query.interface';
import { Products } from './entities/products.entity';
import { AdminGuard } from 'src/guards/admin/admin.guard';
import { Public, Vendor } from 'src/helpers/public';
import { CanCreate } from 'src/guards/products/can-create.guard';
import { CanEdit } from 'src/guards/products/can-edit.guard';

@ApiBearerAuth()
@ApiTags("Products")
@Controller('products')
@UseGuards(AdminGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Vendor()
  @UseGuards(CanCreate)
  @Post()
  @HttpCode(200)
  @ApiOkResponse({ type: ProductEntity })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Fetch all products', type: Products })
  @ApiInternalServerErrorResponse()
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'vendorId', required: false, type: Number })
  @ApiQuery({ name: 'countryId', required: false, type: Number })
  @ApiQuery({ name: 'stateId', required: false, type: Number })
  @ApiQuery({ name: 'districtId', required: false, type: Number })
  @ApiQuery({ name: 'cityId', required: false, type: Number })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('categoryId') categoryId?: number,
    @Query('vendorId') vendorId?: number,
    @Query('countryId') countryId?: number,
    @Query('stateId') stateId?: number,
    @Query('districtId') districtId?: number,
    @Query('cityId') cityId?: number,
  ) {
    const query: ProductQuery = {
      ...(search && { search }),
      ...(categoryId && { categoryId: +categoryId }),
      ...(vendorId && { vendorId: +vendorId }),
      ...(countryId && { countryId: +countryId }),
      ...(stateId && { stateId: +stateId }),
      ...(districtId && { districtId: +districtId }),
      ...(cityId && { cityId: +cityId }),
      skip: +skip || 0,
      take: +take || 25,
      orderBy: orderBy || "createdAt",
      sortOrder: sortOrder || SortOrder.DESC,
    };

    return this.productsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ type: ProductEntity })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Vendor()
  @UseGuards(CanEdit)
  @Patch(':id')
  @ApiOkResponse({ type: ProductEntity })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Vendor()
  @UseGuards(CanEdit)
  @Delete(':id')
  @ApiOkResponse({ type: ProductEntity })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @Vendor()
  @UseGuards(CanEdit)
  @Delete(':id/image/:imageId')
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.deleteProductImage(+imageId);
  }
}
