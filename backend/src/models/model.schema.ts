import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ModelDocument = AIModel & Document;

@Schema({ timestamps: true })
export class AIModel {
  @Prop({ required: true, unique: true, index: true })
  modelId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lab: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, default: 0 })
  contextWindow: number;

  @Prop({ required: true, default: 0 })
  inputPrice: number;

  @Prop({ required: true, default: 0 })
  outputPrice: number;

  @Prop({ required: true, default: 0 })
  rating: number;

  @Prop({ required: true })
  speed: string;

  @Prop({ required: true, default: false })
  multimodal: boolean;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  useCases: string[];

  @Prop({ type: String, default: null })
  badge: string | null;

  @Prop({ required: true })
  logo: string;
}

export const ModelSchema = SchemaFactory.createForClass(AIModel);
