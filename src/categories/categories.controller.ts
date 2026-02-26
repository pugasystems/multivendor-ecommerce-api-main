import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryEntity } from './entities/category.entity';
import { CategoryQuery, SortOrder } from 'src/interfaces/query.interface';
import { Categories } from './entities/categories.entity';
import { AdminGuard } from 'src/guards/admin/admin.guard';
import { Public, Vendor } from 'src/helpers/public';
import { CanEdit } from 'src/guards/categories/can-edit.guard';
import { CanCreate } from 'src/guards/categories/can-create.guard';

@ApiBearerAuth()
@ApiTags("Categories")
@Controller('categories')
@UseGuards(AdminGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Vendor()
  @UseGuards(CanCreate)
  @Post()
  @HttpCode(200)
  @ApiOkResponse({ type: CategoryEntity })
  @ApiNotFoundResponse()
  @ApiNotAcceptableResponse()
  @ApiInternalServerErrorResponse()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Fetch all categories', type: Categories })
  @ApiInternalServerErrorResponse()
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'parentCategoryId', required: false, type: Number })
  @ApiQuery({ name: 'businessCategoryId', required: false, type: Number })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('parentCategoryId') parentCategoryId?: number,
    @Query('businessCategoryId') businessCategoryId?: number,
  ) {
    const query: CategoryQuery = {
      ...(search && { search }),
      ...(parentCategoryId && { parentCategoryId: +parentCategoryId }),
      ...(businessCategoryId && { businessCategoryId: +businessCategoryId }),
      skip: +skip || 0,
      take: +take || 25,
      orderBy: orderBy || "createdAt",
      sortOrder: sortOrder || SortOrder.DESC,
    };

    return this.categoriesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ type: CategoryEntity })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Vendor()
  @UseGuards(CanEdit)
  @Patch(':id')
  @ApiOkResponse({ type: CategoryEntity })
  @ApiNotFoundResponse()
  @ApiNotAcceptableResponse()
  @ApiInternalServerErrorResponse()
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Vendor()
  @UseGuards(CanEdit)
  @Delete(':id')
  @ApiOkResponse({ type: CategoryEntity })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
