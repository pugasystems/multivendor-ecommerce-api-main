import { CreateMessageDto } from "src/messages/dto/create-message.dto";

export interface ServerToClientEvents {
    chat: (e: CreateMessageDto) => void;
}

export interface ClientToServerEvents {
    chat: (e: CreateMessageDto) => void;
}
