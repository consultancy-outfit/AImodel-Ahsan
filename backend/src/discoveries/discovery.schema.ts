import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DiscoveryDocument = Discovery & Document;

@Schema({ _id: false })
export class Metric {
  @Prop({ required: true }) label: string;
  @Prop({ required: true }) value: string;
}

export const MetricSchema = SchemaFactory.createForClass(Metric);

@Schema({ timestamps: true })
export class Discovery {
  @Prop({ required: true, unique: true, index: true }) slug: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) organization: string;
  @Prop({ required: true }) date: Date;
  @Prop({ required: true }) category: string;
  @Prop({ required: true }) snippet: string;
  @Prop({ required: true }) overview: string;
  @Prop({ required: true }) arxivId: string;
  @Prop({ required: true }) authors: string;
  @Prop({ type: [MetricSchema], default: [] }) metrics: Metric[];
  @Prop({ type: [String], default: [] }) keyFindings: string[];
  @Prop({ type: [String], default: [] }) modelsReferenced: string[];
  @Prop({ required: true }) impactLevel: string;
  @Prop({ required: true }) impactDescription: string;
}

export const DiscoverySchema = SchemaFactory.createForClass(Discovery);
