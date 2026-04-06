import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Agent, AgentDocument } from './agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name)
    private readonly agentModel: Model<AgentDocument>,
  ) {}

  async create(userId: string, dto: CreateAgentDto): Promise<AgentDocument> {
    const agent = new this.agentModel({
      userId: new Types.ObjectId(userId),
      name: dto.name,
      description: dto.description ?? '',
      modelId: dto.modelId,
      systemPrompt: dto.systemPrompt ?? '',
      tools: dto.tools ?? [],
      agentType: dto.agentType ?? '',
      mainJob: dto.mainJob ?? '',
      audience: dto.audience ?? '',
      tone: dto.tone ?? '',
      restrictions: dto.restrictions ?? '',
      successMetrics: dto.successMetrics ?? '',
      memory: dto.memory ?? 'short-term',
    });
    return agent.save();
  }

  async findAllByUser(userId: string): Promise<AgentDocument[]> {
    return this.agentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean<AgentDocument[]>();
  }

  async delete(userId: string, agentId: string): Promise<void> {
    const result = await this.agentModel.deleteOne({
      _id: new Types.ObjectId(agentId),
      userId: new Types.ObjectId(userId),
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Agent not found');
    }
  }
}
