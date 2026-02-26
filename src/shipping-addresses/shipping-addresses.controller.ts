import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, UseGuards, Request } from '@nestjs/common';
import { ShippingAddressesService } from './shipping-addresses.service';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';
import { ApiBearerAuth, ApiInternalServerErrorResponse, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ShippingAddresses } from './entities/shipping-addresses.entity';
import { ShippingAddressQuery, SortOrder } from 'src/interfaces/query.interface';
import { ShippingAddressEntity } from './entities/shipping-address.entity';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Public } from 'src/helpers/public';
import { CanEdit } from 'src/guards/shipping-addresses/can-edit.guard';

@ApiBearerAuth()
@ApiTags("Shipping Addresses")
@Controller('shipping-addresses')
@UseGuards(AuthGuard)
export class ShippingAddressesController {
  constructor(private readonly shippingAddressesService: ShippingAddressesService) {}

  @Post()
  @HttpCode(200)
  @ApiOkResponse({ description: 'Create a new shipping address', type: ShippingAddressEntity })
  @ApiNotAcceptableResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  create(@Body() createShippingAddressDto: CreateShippingAddressDto) {
    return this.shippingAddressesService.create(createShippingAddressDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Fetch all user addresses', type: ShippingAddresses })
  @ApiInternalServerErrorResponse()
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'countryId', required: false, type: Number })
  @ApiQuery({ name: 'stateId', required: false, type: Number })
  @ApiQuery({ name: 'districtId', required: false, type: Number })
  @ApiQuery({ name: 'cityId', required: false, type: Number })
  findAll(
    @Request() req,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('userId') userId?: number,
    @Query('countryId') countryId?: number,
    @Query('stateId') stateId?: number,
    @Query('districtId') districtId?: number,
    @Query('cityId') cityId?: number,
  ) {
    if (req.payload.role.name !== "Admin") {
      userId = +req.payload.userId;
    }

    const query: ShippingAddressQuery = {
      ...(search && { search }),
      ...(userId && { userId: +userId }),
      ...(countryId && { countryId: +countryId }),
      ...(stateId && { stateId: +stateId }),
      ...(districtId && { districtId: +districtId }),
      ...(cityId && { cityId: +cityId }),
      skip: +skip || 0,
      take: +take || 25,
      orderBy: orderBy || "createdAt",
      sortOrder: sortOrder || SortOrder.DESC,
    };

    return this.shippingAddressesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ type: ShippingAddressEntity })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  findOne(@Param('id') id: string) {
    return this.shippingAddressesService.findOne(+id);
  }

  @UseGuards(CanEdit)
  @Patch(':id')
  @ApiOkResponse({ type: ShippingAddressEntity })
  @ApiNotAcceptableResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  update(@Param('id') id: string, @Body() updateShippingAddressDto: UpdateShippingAddressDto) {
    return this.shippingAddressesService.update(+id, updateShippingAddressDto);
  }

  @UseGuards(CanEdit)
  @Delete(':id')
  @ApiOkResponse({ type: ShippingAddressEntity })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  remove(@Param('id') id: string) {
    return this.shippingAddressesService.remove(+id);
  }
}
