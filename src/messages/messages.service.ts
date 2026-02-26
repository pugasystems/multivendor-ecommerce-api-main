import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatHistoryQuery, ChatQuery } from 'src/interfaces/query.interface';
import { Message } from './entities/message.entity';
import { Chat } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor (private readonly prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto) {
    return this.prisma.chat.create({data: createMessageDto})
  }

  async findAll(query: ChatQuery): Promise<{ totalCount: number, messages: Message[] }> {
    const whereClause: { AND?: object[] } = {
      AND: [
        {
          OR: [
            {
              senderUserId: {
                equals: query.userIdOne,
              },
              recipientUserId: {
                equals: query.userIdTwo,
              },
            },
            {
              senderUserId: {
                equals: query.userIdTwo,
              },
              recipientUserId: {
                equals: query.userIdOne,
              },
            },
          ],
        },
        ...(query.search ? [
          {
            OR: [
              {
                message: {
                  contains: query.search,
                },
              }
            ],
          },
        ] : []),
      ],
    };

    const [totalCount, messages] = await this.prisma.$transaction([
      this.prisma.chat.count({ where: whereClause }),
      this.prisma.chat.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
      }),
    ]);

    return { totalCount, messages };
  }

  async fetchMessageHistory(query: ChatHistoryQuery) {
    const { skip, take, vendorId } = query;

    const whereQuery = {
      ...(vendorId && {
        OR: [
          {
            senderUserId: vendorId,
          },
          {
            recipientUserId: vendorId,
          },
        ],
      }),
    };

    const chatHistory: Chat[] = [];

    const chats = await this.prisma.chat.findMany({
      where: whereQuery,
      orderBy: {
        createdAt: 'desc',
      },
      distinct: ['senderUserId', 'recipientUserId'],
      include: {
        recipient: true,
        sender: true,
      },
      skip,
      take,
    });

    for (let i = 0; i < chats.length - 1; i++) {
      const currentObject = chats[i];
      const nextObject = chats[i + 1];

      if (currentObject.senderUserId !== nextObject.recipientUserId) {
        chatHistory.push(currentObject);
      }
    }

    chatHistory.push(chats[chats.length - 1]);

    return chatHistory;
  }
}
