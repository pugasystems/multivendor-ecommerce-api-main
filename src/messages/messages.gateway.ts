import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from 'src/interfaces/chat.interface';

@WebSocketGateway()
export class MessagesGateway {
  @WebSocketServer() server: Server = new Server<
    ServerToClientEvents,
    ClientToServerEvents
  >();

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('send-chat')
  async create(@MessageBody() payload: CreateMessageDto) {
    const response = await this.messagesService.create(payload);
    this.server.emit('recieve-chat', response);
  }
}
