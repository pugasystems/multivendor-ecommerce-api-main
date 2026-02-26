import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiInternalServerErrorResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { MessagesService } from './messages.service';
import { ChatHistoryQuery, ChatQuery, SortOrder } from 'src/interfaces/query.interface';
import { AdminGuard } from 'src/guards/admin/admin.guard';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags("Messages")
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Get()
    @ApiOkResponse()
    @ApiInternalServerErrorResponse()
    @ApiQuery({ name: 'skip', required: false, type: Number })
    @ApiQuery({ name: 'take', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'orderBy', required: false })
    @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
    @ApiQuery({ name: 'userIdOne', required: true, type: Number })
    @ApiQuery({ name: 'userIdTwo', required: true, type: Number })
    findAll(
        @Query('skip') skip?: number,
        @Query('take') take?: number,
        @Query('search') search?: string,
        @Query('orderBy') orderBy?: string,
        @Query('sortOrder') sortOrder?: SortOrder,
        @Query('userIdOne') userIdOne?: number,
        @Query('userIdTwo') userIdTwo?: number,
    ) {
        const query: ChatQuery = {
            ...(search && { search }),
            userIdOne: +userIdOne,
            userIdTwo: +userIdTwo,
            skip: +skip || 0,
            take: +take || 25,
            orderBy: orderBy || "createdAt",
            sortOrder: sortOrder || SortOrder.DESC,
        }

        return this.messagesService.findAll(query);
    }

    @Get('/history')
    @ApiOkResponse()
    @ApiInternalServerErrorResponse()
    @ApiQuery({ name: 'skip', required: false, type: Number })
    @ApiQuery({ name: 'take', required: false, type: Number })
    @ApiQuery({ name: 'vendorId', required: true, type: Number })
    fetchMessageHistory(
        @Query('skip') skip?: number,
        @Query('take') take?: number,
        @Query('vendorId') vendorId?: number,
    ) {
        const query: ChatHistoryQuery = {
            skip: +skip || 0,
            take: +take ||25,
            vendorId: +vendorId,
        };

        return this.messagesService.fetchMessageHistory(query);
    }

    @UseGuards(AdminGuard)
    @Get('/admin/history')
    @ApiOkResponse()
    @ApiInternalServerErrorResponse()
    @ApiQuery({ name: 'skip', required: false, type: Number })
    @ApiQuery({ name: 'take', required: false, type: Number })
    @ApiQuery({ name: 'vendorId', required: false, type: Number })
    fetchMessageHistoryForAdmin(
        @Query('skip') skip?: number,
        @Query('take') take?: number,
        @Query('vendorId') vendorId?: number,
    ) {
        const query: ChatHistoryQuery = {
            skip: +skip || 0,
            take: +take ||25,
            vendorId: +vendorId,
        };

        return this.messagesService.fetchMessageHistory(query);
    }
}
