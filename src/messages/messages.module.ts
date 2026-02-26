import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagesController } from './messages.controller';

@Module({
  providers: [MessagesGateway, MessagesService],
  imports: [PrismaModule],
  controllers: [MessagesController],
})
export class MessagesModule {}
