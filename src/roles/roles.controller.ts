import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RoleEntity } from './entities/role.entity';
import { Roles } from './entities/roles.entity';
import { CommonQuery, SortOrder } from 'src/interfaces/query.interface';
import { AdminGuard } from 'src/guards/admin/admin.guard';

@ApiBearerAuth()
@ApiTags('Roles')
@Controller('roles')
@UseGuards(AdminGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOkResponse({ description: 'Create a new role', type: RoleEntity })
  @ApiNotAcceptableResponse({ description: 'Role Already Exists' })
  @ApiInternalServerErrorResponse()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Fetch all roles', type: Roles })
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

    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: "Fetch specific role", type: RoleEntity })
  @ApiNotFoundResponse({ description: "Role not found" })
  @ApiInternalServerErrorResponse()
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Update specific role', type: RoleEntity })
  @ApiNotFoundResponse({ description: "Role not found" })
  @ApiNotAcceptableResponse({ description: 'Role Already Exists' })
  @ApiInternalServerErrorResponse()
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Remove specific role', type: RoleEntity })
  @ApiNotFoundResponse({ description: "Role not found" })
  @ApiInternalServerErrorResponse()
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
