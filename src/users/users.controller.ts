import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiInternalServerErrorResponse, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Users } from './entities/users.entity';
import { CommonQuery, SortOrder } from 'src/interfaces/query.interface';
import { UserEntity } from './entities/user.entity';
import { RegisterEntity } from 'src/authentications/entities/register.entity';
import { AdminGuard } from 'src/guards/admin/admin.guard';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
@UseGuards(AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(200)
  @ApiOkResponse({ description: "Create new user", type: UserEntity })
  @ApiNotFoundResponse({ description: "Unable to find..." })
  @ApiNotAcceptableResponse({ description: "Conflict with existing data" })
  @ApiInternalServerErrorResponse()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Fetch all users', type: Users })
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

    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: "Fetch specific user", type: UserEntity })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiInternalServerErrorResponse()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: "Update specific user", type: RegisterEntity })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiNotAcceptableResponse({ description: "Conflict with existing data" })
  @ApiInternalServerErrorResponse()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: "Delete specific user", type: RegisterEntity })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiInternalServerErrorResponse()
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
