import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, UseGuards } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CommonQuery, SortOrder } from 'src/interfaces/query.interface';
import { DistrictEntity } from './entities/district.entity';
import { Districts } from './entities/districts.entity';
import { AdminGuard } from 'src/guards/admin/admin.guard';
import { Public } from 'src/helpers/public';

@ApiBearerAuth()
@ApiTags("Districts")
@Controller('districts')
@UseGuards(AdminGuard)
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Post()
  @HttpCode(200)
  @ApiOkResponse({ description: 'Create a new district', type: DistrictEntity })
  @ApiNotAcceptableResponse({ description: 'District Already Exists' })
  @ApiInternalServerErrorResponse()
  create(@Body() createDistrictDto: CreateDistrictDto) {
    return this.districtsService.create(createDistrictDto);
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Fetch all districts', type: Districts })
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

    return this.districtsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ description: "Fetch specific district", type: DistrictEntity })
  @ApiNotFoundResponse({ description: "Stae not found" })
  @ApiInternalServerErrorResponse()
  findOne(@Param('id') id: string) {
    return this.districtsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: "Updated a specific district", type: DistrictEntity })
  @ApiNotFoundResponse({ description: "District not found" })
  @ApiNotAcceptableResponse({ description: 'District Already Exists' })
  @ApiInternalServerErrorResponse()
  update(@Param('id') id: string, @Body() updateDistrictDto: UpdateDistrictDto) {
    return this.districtsService.update(+id, updateDistrictDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: "Delete specific district", type: DistrictEntity })
  @ApiNotFoundResponse({ description: "district not found" })
  @ApiInternalServerErrorResponse()
  remove(@Param('id') id: string) {
    return this.districtsService.remove(+id);
  }
}
