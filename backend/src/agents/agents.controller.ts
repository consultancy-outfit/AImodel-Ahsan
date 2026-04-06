import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgentDocument } from './agent.schema';

interface AuthRequest {
  user: { userId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  findAll(@Request() req: AuthRequest): Promise<AgentDocument[]> {
    return this.agentsService.findAllByUser(req.user.userId);
  }

  @Post()
  create(
    @Request() req: AuthRequest,
    @Body() dto: CreateAgentDto,
  ): Promise<AgentDocument> {
    return this.agentsService.create(req.user.userId, dto);
  }

  @Delete(':id')
  async delete(
    @Request() req: AuthRequest,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.agentsService.delete(req.user.userId, id);
    return { success: true };
  }
}
