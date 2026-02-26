import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, UseGuards } from '@nestjs/common';
import { BusinessCategoriesService } from './business-categories.service';
import { CreateBusinessCategoryDto } from './dto/create-business-category.dto';
import { UpdateBusinessCategoryDto } from './dto/update-business-category.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BusinessCategoryEntity } from './entities/business-category.entity';
import { CommonQuery, SortOrder } from 'src/interfaces/query.interface';
import { BusinessCategories } from './entities/business-categories.entity';
import { AdminGuard } from 'src/guards/admin/admin.guard';
import { Public, Vendor } from 'src/helpers/public';

@ApiBearerAuth()
@ApiTags("Business Categories")
@Controller('business-categories')
@UseGuards(AdminGuard)
export class BusinessCategoriesController {
  constructor(private readonly businessCategoriesService: BusinessCategoriesService) {}

  @Vendor()
  @Post()
  @HttpCode(200)
  @ApiOkResponse({ description: 'Create a new business category', type: BusinessCategoryEntity })
  @ApiNotAcceptableResponse({ description: 'Business category Already Exists' })
  @ApiInternalServerErrorResponse()
  create(@Body() createBusinessCategoryDto: CreateBusinessCategoryDto) {
    return this.businessCategoriesService.create(createBusinessCategoryDto);
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Fetch all roles', type: BusinessCategories })
  @ApiInternalServerErrorResponse()
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('sortOrder') sortOrder?: SortOrder,
  ) {
    const query: CommonQuery = {
      ...(search && { search }),
      skip: +skip || 0,
      take: +take || 25,
      orderBy: orderBy || "createdAt",
      sortOrder: sortOrder || SortOrder.DESC,
    };

    return this.businessCategoriesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ description: "Fetch specific business category", type: BusinessCategoryEntity })
  @ApiNotFoundResponse({ description: "Business category not found" })
  @ApiInternalServerErrorResponse()
  findOne(@Param('id') id: string) {
    return this.businessCategoriesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Update specific business category', type: BusinessCategoryEntity })
  @ApiNotFoundResponse({ description: "Business Category not found" })
  @ApiNotAcceptableResponse({ description: 'Business Category Already Exists' })
  @ApiInternalServerErrorResponse()
  update(@Param('id') id: string, @Body() updateBusinessCategoryDto: UpdateBusinessCategoryDto) {
    return this.businessCategoriesService.update(+id, updateBusinessCategoryDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Remove specific business category', type: BusinessCategoryEntity })
  @ApiNotFoundResponse({ description: "Business category not found" })
  @ApiInternalServerErrorResponse()
  remove(@Param('id') id: string) {
    return this.businessCategoriesService.remove(+id);
  }
}
