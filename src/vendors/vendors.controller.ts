import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query, UseGuards, Request } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { VendorEntity } from './entities/vendor.entity';
import { Vendors } from './entities/vendors.entity';
import { SortOrder, VendorQuery } from 'src/interfaces/query.interface';
import { AdminGuard } from 'src/guards/admin/admin.guard';
import { Public, Vendor } from 'src/helpers/public';
import { CanEdit } from 'src/guards/vendors/can-edit.guard';
import { UploadFileDto } from './dto/upload-file.dto';

@ApiBearerAuth()
@ApiTags("Vendors")
@Controller('vendors')
@UseGuards(AdminGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Vendor()
  @Post()
  @HttpCode(200)
  @ApiOkResponse({ type: VendorEntity })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(createVendorDto);
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Fetch all vendors', type: Vendors })
  @ApiInternalServerErrorResponse()
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'userAddressId', required: false, type: Number })
  @ApiQuery({ name: 'businessCategoryId', required: false, type: Number })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('userId') userId?: number,
    @Query('userAddressId') userAddressId?: number,
    @Query('businessCategoryId') businessCategoryId?: number,
  ) {
    const query: VendorQuery = {
      ...(search && { search }),
      ...(userId && { userId: +userId }),
      ...(userAddressId && { userAddressId: +userAddressId }),
      ...(businessCategoryId && { businessCategoryId: +businessCategoryId }),
      skip: +skip || 0,
      take: +take || 25,
      orderBy: orderBy || "createdAt",
      sortOrder: sortOrder || SortOrder.DESC,
    };

    return this.vendorsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ type: VendorEntity })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(+id);
  }

  @Vendor()
  @UseGuards(CanEdit)
  @Patch(':id')
  @ApiOkResponse({ type: VendorEntity })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorsService.update(+id, updateVendorDto);
  }

  @Delete(':id')
  @Vendor()
  @UseGuards(CanEdit)
  @ApiOkResponse({ type: VendorEntity })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(+id);
  }

  @Post('/upload/bulk')
  bulkUpload(@Body() uploadFileDto: UploadFileDto) {
    return this.vendorsService.bulkUpload(uploadFileDto);
  }

  @Vendor()
  @UseGuards(CanEdit)
  @Get(':id/subscriptions')
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  getAllSubscriptions(@Param('id') id: string) {
    return this.vendorsService.getVendorSubscriotions(+id);
  }

  @Public()
  @Post(':id/subscriptions/:subscriptionId/buy')
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  buySubscription(
    @Param('id') id: string,
    @Param('subscriptionId') subscriptionId: string,
  ) {
    return this.vendorsService.buySubscription(+id, +subscriptionId);
  }

  @Vendor()
  @Post(':id/leads/:leadId/contact')
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  contactLead(
    @Param('id') id: string,
    @Param('leadId') leadId: string,
  ) {
    return this.vendorsService.contactLead(+id, +leadId);
  }
}
