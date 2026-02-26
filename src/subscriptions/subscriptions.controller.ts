import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SubscriptionEntity } from './entities/subscription.entity';
import { Subscriptions } from './entities/subscriptions.entity';
import { CommonQuery, SortOrder } from 'src/interfaces/query.interface';
import { AdminGuard } from 'src/guards/admin/admin.guard';
import { Public } from 'src/helpers/public';

@ApiBearerAuth()
@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(AdminGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @HttpCode(200)
  @ApiOkResponse({ description: 'Create a new subscription', type: SubscriptionEntity })
  @ApiNotAcceptableResponse({ description: 'Subscription Already Exists' })
  @ApiInternalServerErrorResponse()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Fetch all subscriptions', type: Subscriptions })
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

    return this.subscriptionsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ description: "Fetch specific subsription", type: SubscriptionEntity })
  @ApiNotFoundResponse({ description: "Subscription not found" })
  @ApiInternalServerErrorResponse()
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Update specific subscription', type: SubscriptionEntity })
  @ApiNotFoundResponse({ description: "Subscription not found" })
  @ApiNotAcceptableResponse({ description: 'Subscription Already Exists' })
  @ApiInternalServerErrorResponse()
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(+id, updateSubscriptionDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Remove specific subscription', type: SubscriptionEntity })
  @ApiNotFoundResponse({ description: "Subscription not found" })
  @ApiInternalServerErrorResponse()
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(+id);
  }
}
