import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AgentDocument = Agent & Document;

@Schema({ timestamps: true })
export class Agent {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  modelId: string;

  @Prop({ default: '' })
  systemPrompt: string;

  @Prop({ type: [String], default: [] })
  tools: string[];

  // Purpose step fields
  @Prop({ default: '' })
  agentType: string;

  @Prop({ default: '' })
  mainJob: string;

  @Prop({ default: '' })
  audience: string;

  @Prop({ default: '' })
  tone: string;

  @Prop({ default: '' })
  restrictions: string;

  @Prop({ default: '' })
  successMetrics: string;

  // Memory step
  @Prop({ enum: ['none', 'short-term', 'long-term'], default: 'short-term' })
  memory: string;

  // Status
  @Prop({ enum: ['active', 'idle'], default: 'active' })
  status: string;

  @Prop({ default: 0 })
  requestCount: number;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
