import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, UseGuards } from '@nestjs/common';
import { StatesService } from './states.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CommonQuery, SortOrder, StateQuery } from 'src/interfaces/query.interface';
import { StateEntity } from './entities/state.entity';
import { States } from './entities/states.entity';
import { AdminGuard } from 'src/guards/admin/admin.guard';
import { Public } from 'src/helpers/public';

@ApiBearerAuth()
@ApiTags("States")
@Controller('states')
@UseGuards(AdminGuard)
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Post()
  @HttpCode(200)
  @ApiOkResponse({ description: 'Create a new state', type: StateEntity })
  @ApiNotAcceptableResponse({ description: 'State Already Exists' })
  @ApiInternalServerErrorResponse()
  create(@Body() createStateDto: CreateStateDto) {
    return this.statesService.create(createStateDto);
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Fetch all states', type: States })
  @ApiInternalServerErrorResponse()
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'countryId', required: false, type: Number })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('countryId') countryId?: number,
  ) {
    const query: StateQuery = {
      ...(search && { search }),
      ...(countryId && { countryId }),
      skip: +skip || 0,
      take: +take || 25,
      orderBy: orderBy || "createdAt",
      sortOrder: sortOrder || SortOrder.DESC,
    };

    return this.statesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ description: "Fetch specific state", type: StateEntity })
  @ApiNotFoundResponse({ description: "Stae not found" })
  @ApiInternalServerErrorResponse()
  findOne(@Param('id') id: string) {
    return this.statesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: "Updated a specific state", type: StateEntity })
  @ApiNotFoundResponse({ description: "State not found" })
  @ApiNotAcceptableResponse({ description: 'State Already Exists' })
  @ApiInternalServerErrorResponse()
  update(@Param('id') id: string, @Body() updateStateDto: UpdateStateDto) {
    return this.statesService.update(+id, updateStateDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: "Delete specific state", type: StateEntity })
  @ApiNotFoundResponse({ description: "Stae not found" })
  @ApiInternalServerErrorResponse()
  remove(@Param('id') id: string) {
    return this.statesService.remove(+id);
  }
}
