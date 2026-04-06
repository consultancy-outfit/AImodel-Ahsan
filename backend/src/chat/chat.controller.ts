import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ChatService, ChatResponse } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(200)
  send(@Body() dto: SendMessageDto): Promise<ChatResponse> {
    return this.chatService.sendMessage(dto);
  }
}
