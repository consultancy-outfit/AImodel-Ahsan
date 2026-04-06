import { IsString, IsNotEmpty, IsOptional, IsArray, IsIn } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  modelId: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tools?: string[];

  @IsString()
  @IsOptional()
  agentType?: string;

  @IsString()
  @IsOptional()
  mainJob?: string;

  @IsString()
  @IsOptional()
  audience?: string;

  @IsString()
  @IsOptional()
  tone?: string;

  @IsString()
  @IsOptional()
  restrictions?: string;

  @IsString()
  @IsOptional()
  successMetrics?: string;

  @IsString()
  @IsIn(['none', 'short-term', 'long-term'])
  @IsOptional()
  memory?: string;
}
