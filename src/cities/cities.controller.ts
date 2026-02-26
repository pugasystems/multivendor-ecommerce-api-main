import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, UseGuards } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CityQuery, CommonQuery, SortOrder } from 'src/interfaces/query.interface';
import { CityEntity } from './entities/city.entity';
import { Cities } from './entities/cities.entity';
import { AdminGuard } from 'src/guards/admin/admin.guard';
import { Public } from 'src/helpers/public';

@ApiBearerAuth()
@ApiTags("Cities")
@Controller('cities')
@UseGuards(AdminGuard)
export class CitiesController {
  constructor(private readonly cityService: CitiesService) {}

  @Post()
  @HttpCode(200)
  @ApiOkResponse({ description: 'Create a new city', type: CityEntity })
  @ApiNotAcceptableResponse({ description: 'City Already Exists' })
  @ApiInternalServerErrorResponse()
  create(@Body() createDistrictDto: CreateCityDto) {
    return this.cityService.create(createDistrictDto);
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Fetch all cities', type: Cities })
  @ApiInternalServerErrorResponse()
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'stateId', required: false, type: Number })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('stateId') stateId?: number,
  ) {
    const query: CityQuery = {
      ...(search && { search }),
      ...(stateId && { stateId }),
      skip: +skip || 0,
      take: +take || 25,
      orderBy: orderBy || "createdAt",
      sortOrder: sortOrder || SortOrder.DESC,
    };

    return this.cityService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ description: "Fetch specific city", type: CityEntity })
  @ApiNotFoundResponse({ description: "Stae not found" })
  @ApiInternalServerErrorResponse()
  findOne(@Param('id') id: string) {
    return this.cityService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: "Updated a specific city", type: CityEntity })
  @ApiNotFoundResponse({ description: "City not found" })
  @ApiNotAcceptableResponse({ description: 'City Already Exists' })
  @ApiInternalServerErrorResponse()
  update(@Param('id') id: string, @Body() updateDistrictDto: UpdateCityDto) {
    return this.cityService.update(+id, updateDistrictDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: "Delete specific city", type: CityEntity })
  @ApiNotFoundResponse({ description: "city not found" })
  @ApiInternalServerErrorResponse()
  remove(@Param('id') id: string) {
    return this.cityService.remove(+id);
  }
}
