import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, UseGuards } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CountryEntity } from './entities/country.entity';
import { Countries } from './entities/countries.entity';
import { CommonQuery, SortOrder } from 'src/interfaces/query.interface';
import { Public } from 'src/helpers/public';
import { AdminGuard } from 'src/guards/admin/admin.guard';

@ApiBearerAuth()
@ApiTags('Countries')
@Controller('countries')
@UseGuards(AdminGuard)
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @HttpCode(200)
  @ApiOkResponse({ description: 'Create a new country', type: CountryEntity })
  @ApiNotAcceptableResponse({ description: 'Country Already Exists' })
  @ApiInternalServerErrorResponse()
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.create(createCountryDto);
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Fetch all countries', type: Countries })
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
    return this.countriesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ description: "Fetch specific country", type: CountryEntity })
  @ApiNotFoundResponse({ description: "Country not found" })
  @ApiInternalServerErrorResponse()
  findOne(@Param('id') id: string) {
    return this.countriesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: "Updated a specific country", type: CountryEntity })
  @ApiNotFoundResponse({ description: "Country not found" })
  @ApiNotAcceptableResponse({ description: 'Country Already Exists' })
  @ApiInternalServerErrorResponse()
  update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.countriesService.update(+id, updateCountryDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: "Fetch specific country", type: CountryEntity })
  @ApiNotFoundResponse({ description: "Country not found" })
  @ApiInternalServerErrorResponse()
  remove(@Param('id') id: string) {
    return this.countriesService.remove(+id);
  }
}
